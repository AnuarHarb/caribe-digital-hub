import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TalentFiltersState {
  search?: string;
  location?: string;
  availability?: string;
  skill?: string;
}

interface TalentFiltersProps {
  filters: TalentFiltersState;
  onFiltersChange: (filters: TalentFiltersState) => void;
}

export function TalentFilters({ filters, onFiltersChange }: TalentFiltersProps) {
  const { t } = useTranslation();

  const { data: skillsData } = useQuery({
    queryKey: ["talent-skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_skills")
        .select("skill_name")
        .order("skill_name");
      if (error) throw error;
      const names = [...new Set((data ?? []).map((s) => s.skill_name))].sort();
      return names;
    },
    staleTime: 5 * 60 * 1000,
  });

  const skills = skillsData ?? [];

  const handleChange = (key: keyof TalentFiltersState, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <aside className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">{t("talent.filters")}</h3>
      <div className="space-y-2">
        <Label htmlFor="talent-search">{t("talent.search")}</Label>
        <Input
          id="talent-search"
          placeholder={t("talent.searchPlaceholder")}
          value={filters.search ?? ""}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("talent.skills")}</Label>
        <Select
          value={filters.skill ?? "all"}
          onValueChange={(v) => handleChange("skill", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("talent.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("talent.all")}</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("profile.availability")}</Label>
        <Select
          value={filters.availability ?? "all"}
          onValueChange={(v) => handleChange("availability", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("talent.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("talent.all")}</SelectItem>
            <SelectItem value="available">{t("common.availability.available")}</SelectItem>
            <SelectItem value="open_to_offers">{t("common.availability.open_to_offers")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        {t("talent.clearFilters")}
      </Button>
    </aside>
  );
}
