-- Admin-only RPC: match newsletter subscribers to registered users by email.

CREATE OR REPLACE FUNCTION public.admin_list_newsletter_user_links()
RETURNS TABLE (
  subscriber_id uuid,
  email text,
  subscriber_status text,
  subscriber_name text,
  user_id uuid,
  full_name text
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
    ns.id AS subscriber_id,
    ns.email::text,
    ns.status::text AS subscriber_status,
    ns.name AS subscriber_name,
    u.id AS user_id,
    p.full_name
  FROM public.newsletter_subscribers ns
  INNER JOIN auth.users u
    ON lower(u.email) = lower(ns.email)
  LEFT JOIN public.profiles p
    ON p.id = u.id
  ORDER BY ns.created_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_newsletter_user_links() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_newsletter_user_links() TO authenticated;
