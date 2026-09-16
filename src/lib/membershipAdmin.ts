export type MembershipPlan = "miembro" | "residente";
export type MembershipStatus = "active" | "expired" | "canceled";

export function membershipStatus(
  endsAt: string,
  canceledAt: string | null,
  now = Date.now()
): MembershipStatus {
  if (new Date(endsAt).getTime() < now) return "expired";
  if (canceledAt) return "canceled";
  return "active";
}

// ponytail: client max+1; unique constraint is the lock. RPC if two admins grant at once.
export function nextCreyenteNumber(
  taken: Array<number | null | undefined>,
  max = 60
): number | null {
  const n = Math.max(0, ...taken.filter((x): x is number => x != null)) + 1;
  return n > max ? null : n;
}

export function addMonthsIso(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export function dateInputValue(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateInputToIso(date: string): string {
  return new Date(`${date}T23:59:59`).toISOString();
}
