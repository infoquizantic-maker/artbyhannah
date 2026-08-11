-- ART by Hannaah — Security hardening migration
-- Run this in Supabase Dashboard → SQL Editor → New query, AFTER schema.sql.
-- Safe to re-run (drops constraints/policies before recreating).

-- ---------------------------------------------------------------------
-- 1. Shape/size validation on public-insert tables
-- Prevents garbage or oversized data landing in the DB even if someone
-- calls the Supabase REST API directly instead of going through the
-- React forms (the forms' `required`/`maxLength` are UI-only hints).
-- ---------------------------------------------------------------------

alter table public.contact_messages
  drop constraint if exists contact_email_format,
  drop constraint if exists contact_name_len,
  drop constraint if exists contact_subject_len,
  drop constraint if exists contact_message_len;

alter table public.contact_messages
  add constraint contact_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint contact_name_len check (char_length(name) between 1 and 120),
  add constraint contact_subject_len check (subject is null or char_length(subject) <= 200),
  add constraint contact_message_len check (message is null or char_length(message) <= 5000);

alter table public.custom_requests
  drop constraint if exists custom_email_format,
  drop constraint if exists custom_name_len,
  drop constraint if exists custom_phone_len,
  drop constraint if exists custom_desc_len;

alter table public.custom_requests
  add constraint custom_email_format check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint custom_name_len check (name is null or char_length(name) <= 120),
  add constraint custom_phone_len check (phone is null or char_length(phone) <= 30),
  add constraint custom_desc_len check (description is null or char_length(description) <= 5000);

alter table public.inquiries
  drop constraint if exists inquiries_email_format,
  drop constraint if exists inquiries_name_len,
  drop constraint if exists inquiries_message_len,
  drop constraint if exists inquiries_items_len;

alter table public.inquiries
  add constraint inquiries_email_format check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint inquiries_name_len check (name is null or char_length(name) <= 120),
  add constraint inquiries_message_len check (message is null or char_length(message) <= 5000),
  add constraint inquiries_items_len check (jsonb_array_length(items) <= 20);
