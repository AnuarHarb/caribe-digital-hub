import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

const STORAGE_KEY = "caribe-digital-active-company-id";

export type CompanyWithRole = {
  id: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  location: string | null;
  company_size: Database["public"]["Enums"]["company_size"] | null;
  role: Database["public"]["Enums"]["company_member_role"];
};

type ActiveCompanyContextValue = {
  activeCompany: CompanyWithRole | null;
  companies: CompanyWithRole[];
  setActiveCompany: (company: CompanyWithRole | null) => void;
  isLoading: boolean;
  refetch: () => void;
};

const ActiveCompanyContext = createContext<ActiveCompanyContextValue | null>(null);

export function ActiveCompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ["my-companies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("company_members")
        .select(
          `
          company_id,
          role,
          company_profiles (
            id,
            company_name,
            description,
            industry,
            website,
            logo_url,
            location,
            company_size
          )
        `
        )
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((row) => {
        const cp = row.company_profiles as {
          id: string;
          company_name: string;
          description: string | null;
          industry: string | null;
          website: string | null;
          logo_url: string | null;
          location: string | null;
          company_size: Database["public"]["Enums"]["company_size"] | null;
        };
        return {
          ...cp,
          role: row.role as Database["public"]["Enums"]["company_member_role"],
        };
      });
    },
    enabled: !!user?.id,
  });

  const activeCompany = useMemo(() => {
    if (!activeId) return companies[0] ?? null;
    return companies.find((c) => c.id === activeId) ?? companies[0] ?? null;
  }, [activeId, companies]);

  const setActiveCompany = useCallback((company: CompanyWithRole | null) => {
    if (company) {
      setActiveId(company.id);
      localStorage.setItem(STORAGE_KEY, company.id);
    } else {
      setActiveId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && companies.length > 0 && !activeId) {
      const first = companies[0];
      setActiveId(first.id);
      localStorage.setItem(STORAGE_KEY, first.id);
    }
  }, [isLoading, companies, activeId]);

  const value: ActiveCompanyContextValue = useMemo(
    () => ({
      activeCompany,
      companies,
      setActiveCompany,
      isLoading,
      refetch,
    }),
    [activeCompany, companies, setActiveCompany, isLoading, refetch]
  );

  return (
    <ActiveCompanyContext.Provider value={value}>
      {children}
    </ActiveCompanyContext.Provider>
  );
}

export function useActiveCompany() {
  const ctx = useContext(ActiveCompanyContext);
  if (!ctx) {
    throw new Error("useActiveCompany must be used within ActiveCompanyProvider");
  }
  return ctx;
}

export function useActiveCompanyOptional() {
  return useContext(ActiveCompanyContext);
}
