-- Admin-only RPC to list users with contact data (including auth email).
-- Used by /admin/usuarios CSV export.

CREATE OR REPLACE FUNCTION public.admin_list_user_contacts()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  city text,
  address text,
  account_type text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    u.email::text,
    p.phone,
    p.city,
    p.address,
    p.account_type::text,
    COALESCE(ur.role::text, 'user'),
    p.created_at
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.id
  LEFT JOIN LATERAL (
    SELECT r.role
    FROM public.user_roles r
    WHERE r.user_id = p.id
    ORDER BY CASE WHEN r.role = 'admin' THEN 0 ELSE 1 END
    LIMIT 1
  ) ur ON true
  ORDER BY p.created_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_user_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_user_contacts() TO authenticated;
