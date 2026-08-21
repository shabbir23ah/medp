-- Migration 006: OTP persistence + fix botched +8800 phone normalization
-- (005 incorrectly turned +0XXXXXXXXXX into +8800XXXXXXXXXX by keeping the 0)

-- 1) Durable OTP store (survives restarts; works with single PM2 process)
CREATE TABLE IF NOT EXISTS otps (
  phone VARCHAR(20) PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);

-- 2) Fix phones that were double-prefixed: +8800XXXXXXXXXX -> +880XXXXXXXXXX
--    Only when the canonical form does not already exist (avoid unique conflicts)
UPDATE users u
SET phone = '+880' || substring(u.phone from 6)
WHERE u.phone ~ '^\+8800\d+$'
  AND NOT EXISTS (
    SELECT 1 FROM users x
    WHERE x.phone = '+880' || substring(u.phone from 6)
      AND x.id <> u.id
  );
