// Canonicalize any dialing format into a single E.164-style form so the
// same number can never create two accounts:
//   01837992172      -> +8801837992172  (BD local)
//   8801837992172    -> +8801837992172  (country code, no +)
//   +880 1837-992172 -> +8801837992172  (spaces/dashes removed)
//   +01837992172     -> +8801837992172  (legacy +0 form)
//   +88001837992172  -> +8801837992172  (botched double-zero from mig 005)
//   +15551234567     -> +15551234567    (already canonical)
export function normalizePhone(raw: unknown): string {
  let p = String(raw ?? '').trim().replace(/[\s\-().]/g, '');

  // Local format starting with 0 (e.g. Bangladesh 01XXXXXXXXX)
  if (/^0\d{9,11}$/.test(p)) {
    p = '880' + p.slice(1);
  }

  // Legacy +0XXXXXXXXXX (missing country code)
  if (/^\+0\d{9,11}$/.test(p)) {
    p = '+880' + p.slice(2);
  }

  // Fix botched double-zero: +8800XXXXXXXXXX -> +880XXXXXXXXXX
  if (/^\+8800\d+$/.test(p)) {
    p = '+880' + p.slice(5);
  }

  return p.startsWith('+') ? p : '+' + p;
}
