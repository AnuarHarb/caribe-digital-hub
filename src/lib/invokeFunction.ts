import { supabase } from "@/integrations/supabase/client";
import type { FunctionsHttpError } from "@supabase/supabase-js";

async function readFunctionError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context?.json?.();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    /* ignore */
  }
  return error.message;
}

export async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    throw new Error(await readFunctionError(error as FunctionsHttpError));
  }
  if (!data) throw new Error("Respuesta vacía del servidor");
  return data;
}
