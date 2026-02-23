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

export interface JobFiltersState {
  search?: string;
  work_mode?: string;
  employment_type?: string;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onFiltersChange: (filters: JobFiltersState) => void;
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const { t } = useTranslation();

  const handleChange = (key: keyof JobFiltersState, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <aside className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">{t("talent.filters")}</h3>
      <div className="space-y-2">
        <Label htmlFor="job-search">{t("talent.search")}</Label>
        <Input
          id="job-search"
          placeholder={t("jobs.searchPlaceholder")}
          value={filters.search ?? ""}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("jobs.workMode")}</Label>
        <Select
          value={filters.work_mode ?? "all"}
          onValueChange={(v) => handleChange("work_mode", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("talent.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("talent.all")}</SelectItem>
            <SelectItem value="remote">{t("common.workMode.remote")}</SelectItem>
            <SelectItem value="hybrid">{t("common.workMode.hybrid")}</SelectItem>
            <SelectItem value="onsite">{t("common.workMode.onsite")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("jobs.employmentType")}</Label>
        <Select
          value={filters.employment_type ?? "all"}
          onValueChange={(v) => handleChange("employment_type", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("talent.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("talent.all")}</SelectItem>
            <SelectItem value="full_time">{t("common.employmentType.full_time")}</SelectItem>
            <SelectItem value="part_time">{t("common.employmentType.part_time")}</SelectItem>
            <SelectItem value="contract">{t("common.employmentType.contract")}</SelectItem>
            <SelectItem value="freelance">{t("common.employmentType.freelance")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        {t("talent.clearFilters")}
      </Button>
    </aside>
  );
}
