-- Seed data for local development and CI
-- Run via: supabase db seed

-- FEMA denial codes
-- v1 ships with code 120 (ownership) fully wired.
-- Other codes accepted for intake but fall to generic path.
insert into public.denial_codes (code, label_es, label_en, window_days, playbook_id)
values
  ('120', 'Titularidad no verificada',         'Ownership not verified',       60, 'ownership'),
  ('203', 'Ocupación no verificada',            'Occupancy not verified',       60, 'generic'),
  ('204', 'Duplicación de beneficios',          'Duplication of benefits',      60, 'generic'),
  ('205', 'Pérdidas no relacionadas al desastre','Losses not disaster-related', 60, 'generic')
on conflict (code) do nothing;
