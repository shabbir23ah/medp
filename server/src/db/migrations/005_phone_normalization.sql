-- Normalize phone numbers so the same number can't exist as multiple
-- accounts in different dialing formats.

-- 1) Ensure leading +
UPDATE users SET phone = '+' || phone WHERE phone NOT LIKE '+%';

-- 2) Fold local-format numbers (+0XXXXXXXXXX) into +880 form — only when
--    the canonical number doesn't already exist (avoid unique conflicts)
UPDATE users u
SET phone = '+880' || substring(u.phone from 2)
WHERE u.phone ~ '^\+0\d{9,11}$'
  AND NOT EXISTS (
    SELECT 1 FROM users x
    WHERE x.phone = '+880' || substring(u.phone from 2)
      AND x.id <> u.id
  );
