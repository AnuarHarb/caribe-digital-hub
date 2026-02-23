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
}

interface TalentFiltersProps {
  filters: TalentFiltersState;
  onFiltersChange: (filters: TalentFiltersState) => void;
}

export function TalentFilters({ filters, onFiltersChange }: TalentFiltersProps) {
  const { t } = useTranslation();

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
