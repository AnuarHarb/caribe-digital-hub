import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchUsers, type SearchedUser } from "@/hooks/useCompanies";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface UserSearchComboboxProps {
  companyId: string | undefined;
  selectedUser: SearchedUser | null;
  onSelect: (user: SearchedUser | null) => void;
}

export function UserSearchCombobox({ companyId, selectedUser, onSelect }: UserSearchComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  const { users, isLoading } = useSearchUsers(debouncedSearch, companyId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedUser ? (
            <span className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedUser.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-[10px]">
                  {getInitials(selectedUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.full_name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t("company.searchUserPlaceholder")}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("company.searchUserPlaceholder")}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : debouncedSearch.trim().length < 2 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("company.typeToSearch")}
              </p>
            ) : (
              <>
                <CommandEmpty>{t("company.noUsersFound")}</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        onSelect(selectedUser?.id === user.id ? null : user);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <Avatar className="mr-2 h-6 w-6">
                        <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{user.full_name ?? t("common.unknown")}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
