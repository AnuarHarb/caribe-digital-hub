import { membershipStatus, nextCreyenteNumber } from "./membershipAdmin.ts";

const now = Date.parse("2026-09-16T12:00:00Z");
console.assert(membershipStatus("2026-10-01T00:00:00Z", null, now) === "active");
console.assert(membershipStatus("2026-09-01T00:00:00Z", null, now) === "expired");
console.assert(membershipStatus("2026-10-01T00:00:00Z", "2026-09-10T00:00:00Z", now) === "canceled");
console.assert(nextCreyenteNumber([]) === 1);
console.assert(nextCreyenteNumber([1, 3]) === 4);
console.assert(nextCreyenteNumber(Array.from({ length: 60 }, (_, i) => i + 1)) === null);
console.log("membershipAdmin ok");
