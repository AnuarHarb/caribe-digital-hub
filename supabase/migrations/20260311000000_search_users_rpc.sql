-- RPC to search registered users by name, excluding existing members of a company.
-- Used by owners/admins when adding members directly.

CREATE OR REPLACE FUNCTION public.search_users_by_name(
  search_term text,
  exclude_company_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE
    p.full_name ILIKE '%' || search_term || '%'
    AND (
      exclude_company_id IS NULL
      OR p.id NOT IN (
        SELECT cm.user_id FROM public.company_members cm
        WHERE cm.company_id = exclude_company_id
      )
    )
  ORDER BY p.full_name
  LIMIT 10
$$;

GRANT EXECUTE ON FUNCTION public.search_users_by_name(text, uuid) TO authenticated;
