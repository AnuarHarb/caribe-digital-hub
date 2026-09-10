import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CATALOG, type ProductKey } from "./catalog.ts";
import { addMonths } from "./wompi.ts";

export async function activateMembership(
  supabase: SupabaseClient,
  order: {
    id: string;
    user_id: string | null;
    email: string;
    product_key: string;
    payload: Record<string, unknown> | null;
  },
  tx: {
    payment_source_id?: number | string;
    id?: string;
  },
) {
  const product = CATALOG[order.product_key as ProductKey];
  if (!product?.membershipPlan || !product.months) return;

  const now = new Date();
  const sourceId = tx.payment_source_id
    ? String(tx.payment_source_id)
    : (order.payload?.payment_source_id as string | undefined);
  const cardLastFour = (order.payload?.card_last_four as string | undefined) ?? null;
  const membershipId = order.payload?.membership_id as string | undefined;
  const isRenewal = order.payload?.renewal === true;

  const baseFields = {
    product_key: order.product_key,
    wompi_payment_source_id: sourceId ?? null,
    card_last_four: cardLastFour,
    renew: true,
    canceled_at: null,
  };

  if (isRenewal && membershipId) {
    const { data: existing } = await supabase
      .from("memberships")
      .select("id, ends_at")
      .eq("id", membershipId)
      .single();

    if (existing) {
      const base = new Date(existing.ends_at) > now ? new Date(existing.ends_at) : now;
      await supabase
        .from("memberships")
        .update({ ...baseFields, ends_at: addMonths(base, product.months).toISOString() })
        .eq("id", membershipId);
      return;
    }
  }

  let query = supabase
    .from("memberships")
    .select("id, ends_at, plan")
    .eq("plan", product.membershipPlan)
    .gte("ends_at", now.toISOString());

  if (order.user_id) {
    query = query.eq("user_id", order.user_id);
  } else {
    query = query.eq("email", order.email);
  }

  const { data: activeRows } = await query.order("ends_at", { ascending: false }).limit(1);
  const active = activeRows?.[0];

  if (active) {
    const base = new Date(active.ends_at) > now ? new Date(active.ends_at) : now;
    await supabase
      .from("memberships")
      .update({ ...baseFields, ends_at: addMonths(base, product.months).toISOString() })
      .eq("id", active.id);
    return;
  }

  await supabase.from("memberships").insert({
    user_id: order.user_id,
    email: order.email,
    plan: product.membershipPlan,
    ends_at: addMonths(now, product.months).toISOString(),
    ...baseFields,
  });
}
