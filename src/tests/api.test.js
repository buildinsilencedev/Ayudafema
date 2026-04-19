/**
 * API module tests — mock Supabase client, assert call shapes.
 *
 * These tests verify the contract between `src/lib/api.js` and the
 * Supabase client without hitting a real database.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock @supabase/supabase-js ────────────────────────────────────────────
// We intercept at the module level so api.js uses our fake client.

const mockSingle  = vi.fn()
const mockSelect  = vi.fn(() => ({ single: mockSingle, eq: mockEq }))
const mockEq      = vi.fn(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }))
const mockOrder   = vi.fn(() => ({ limit: mockLimit }))
const mockLimit   = vi.fn(() => ({ data: null, error: null }))
const mockInsert  = vi.fn(() => ({ select: mockSelect }))
const mockUpdate  = vi.fn(() => ({ eq: mockEq }))
const mockUpsert  = vi.fn(() => ({ select: mockSelect }))
const mockFrom    = vi.fn(() => ({
  select:  mockSelect,
  insert:  mockInsert,
  update:  mockUpdate,
  upsert:  mockUpsert,
}))
const mockGetUser = vi.fn(async () => ({ data: { user: { id: 'user-123' } } }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser:            mockGetUser,
      getSession:         vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange:  vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOtp:      vi.fn(async () => ({ error: null })),
      signOut:            vi.fn(async () => ({ error: null })),
    },
    from:      mockFrom,
    storage:   { from: vi.fn(() => ({ upload: vi.fn(async () => ({ error: null })) }) ) },
    functions: { invoke: vi.fn(async () => ({ error: null })) },
    channel:   vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
  }),
}))

// ─── Import under test (after mock is registered) ─────────────────────────
const {
  createCase,
  manualEntry,
  toggleEvidence,
  reportSubmission,
} = await import('../lib/api.js')

// ─── Tests ────────────────────────────────────────────────────────────────

describe('createCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockSingle.mockResolvedValue({ data: { id: 'new-case-id', status: 'intake' }, error: null })
  })

  it('calls supabase.from("cases").insert with user_id', async () => {
    await createCase()
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' })
    )
  })

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await expect(createCase()).rejects.toThrow('not authenticated')
  })
})

describe('manualEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({
      data: { id: 'case-123', status: 'evidence' },
      error: null,
    })
  })

  it('sets denial_code, denial_letter_date, status=evidence', async () => {
    await manualEntry('case-123', {
      denialCode:        '120',
      denialLetterDate:  '2026-02-15',
      applicantName:     'Ana R.',
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        denial_code:        '120',
        denial_letter_date: '2026-02-15',
        applicant_name:     'Ana R.',
        status:             'evidence',
      })
    )
  })

  it('passes null for optional fields when omitted', async () => {
    await manualEntry('case-123', {
      denialCode:       '120',
      denialLetterDate: '2026-02-15',
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        applicant_name: null,
        disaster_code:  null,
        disaster_name:  null,
      })
    )
  })
})

describe('toggleEvidence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({
      data: { case_id: 'case-123', evidence_id: 'photo', attached: true },
      error: null,
    })
  })

  it('calls upsert with correct shape', async () => {
    await toggleEvidence('case-123', 'photo', true)
    expect(mockUpsert).toHaveBeenCalledWith({
      case_id:     'case-123',
      evidence_id: 'photo',
      attached:    true,
    })
  })
})

describe('reportSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({
      data: { id: 'sub-1', case_id: 'case-123' },
      error: null,
    })
  })

  it('inserts submission with method and submitted_at', async () => {
    await reportSubmission('case-123', {
      method:      'mail',
      submittedAt: '2026-04-20T12:00:00Z',
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        case_id:      'case-123',
        method:       'mail',
        submitted_at: '2026-04-20T12:00:00Z',
      })
    )
  })
})
