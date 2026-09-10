/** Mirror of src/content/portafolio.ts for edge functions (Deno). Keep in sync. */

export type ProductKey =
  | "miembro_mensual"
  | "miembro_anual"
  | "residente_mensual"
  | "residente_anual"
  | "cowork_dia"
  | "tech_cupo"
  | "taller_maker"
  | "bono_cafe_10"
  | "bono_cafe_20";

export interface Product {
  amountCop: number;
  title: string;
  membershipPlan?: "miembro" | "residente";
  months?: number;
}

export const PRODUCTS: Record<ProductKey, Product> = {
  miembro_mensual: { amountCop: 70000, title: "Miembro mensual", membershipPlan: "miembro", months: 1 },
  miembro_anual: { amountCop: 700000, title: "Miembro anual", membershipPlan: "miembro", months: 12 },
  residente_mensual: { amountCop: 250000, title: "Residente mensual", membershipPlan: "residente", months: 1 },
  residente_anual: { amountCop: 2500000, title: "Residente anual", membershipPlan: "residente", months: 12 },
  cowork_dia: { amountCop: 25000, title: "Cowork por día" },
  tech_cupo: { amountCop: 100000, title: "Cupo Tech Centre" },
  taller_maker: { amountCop: 80000, title: "Taller Lab Maker" },
  bono_cafe_10: { amountCop: 180000, title: "Bono café 10" },
  bono_cafe_20: { amountCop: 320000, title: "Bono café 20" },
};

export const CATALOG = PRODUCTS;

export function isValidProductKey(key: string): key is ProductKey {
  return key in PRODUCTS;
}

export function getProduct(key: ProductKey): Product {
  return PRODUCTS[key];
}
