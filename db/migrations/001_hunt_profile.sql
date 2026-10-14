-- Hunt Profile: extra fields that steer AI scoring and reply drafts.
-- role, description and listener_context already exist from onboarding.
ALTER TABLE users ADD COLUMN IF NOT EXISTS hunt_signals text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hunt_ignore text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reply_tone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at timestamptz;
