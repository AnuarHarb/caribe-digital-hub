import { useState, useCallback, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, className }: TagInputProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed || value.includes(trimmed)) return;
      onChange([...value, trimmed]);
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue("");
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-2 rounded-lg border border-input bg-muted/50 px-3 py-2 ${className ?? ""}`}
    >
      {value.map((tag, i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
            aria-label={t("common.delete")}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder ?? t("admin.blog.tagsPlaceholder")}
        className="min-w-[120px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
