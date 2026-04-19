# Attorney onboarding — Ayudafema.org

How to add a new attorney reviewer to the system.

## Prerequisites

The attorney must have:
- A valid email address
- Access to a laptop or tablet (the review queue is desktop-first)
- Completed orientation with AL-PR on the appeal review workflow

## Steps

### 1. Create their Supabase account

Option A (magic link — recommended):
1. Go to `ayudafema.org/#/login`
2. Enter the attorney's email
3. They receive a magic link and create their session

Option B (Supabase Dashboard):
1. Supabase → Authentication → Users → Invite user
2. Enter their email → Send invitation

### 2. Promote to attorney role

In the Supabase SQL editor:
```sql
update public.profiles
set role = 'attorney'
where id = (
  select id from auth.users where email = 'attorney@example.com'
);
```

Verify:
```sql
select id, role from public.profiles
where id = (select id from auth.users where email = 'attorney@example.com');
```

### 3. Test their access

Have the attorney:
1. Log in at `ayudafema.org`
2. Navigate to `ayudafema.org/#/admin/queue`
3. Confirm they can see the queue (empty queue is fine — shows "Queue is empty")
4. If they get redirected to `/#/landing`, check the role update succeeded

### 4. Orientation walkthrough

Walk through a test case with them:
1. In Supabase, set one test case to `status = 'under_review'`
2. Have them open the queue → click the case
3. Walk through the three-panel layout (EN draft / ES draft / sidebar)
4. Walk through Approve, Request changes actions
5. Confirm the test case moves to `status = 'ready'` after approval

## Removing an attorney

```sql
update public.profiles
set role = 'user'
where id = (
  select id from auth.users where email = 'attorney@example.com'
);
```

They will be immediately redirected to `/landing` on next navigation.

## Review SLA

Target: all cases reviewed within 72h of entering `under_review`.
Monitor via the queue screen — cases are sorted by deadline urgency.
Better Stack alert triggers if any case sits > 72h in `under_review`.

## What attorneys can and cannot do

**Can:**
- Read all cases in `under_review` status
- Approve drafts (atomic: sets `attorney_reviewed = true`, case → `ready`)
- Request changes (adds review note, returns to queue)
- Reject (marks case, notifies operations)
- Edit the Spanish draft body when requesting changes

**Cannot:**
- Access user PII beyond what's in the case row
- Change case status outside the approve/request_changes/reject flow
- Delete cases or drafts
- Access other users' cases that are not `under_review`

These constraints are enforced by RLS policies in Postgres.
