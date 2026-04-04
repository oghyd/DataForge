"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { POSITIONS, PLAYER_STATUSES } from "@/lib/utils";
import { Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

export function PlayerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/players?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, city..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            updateFilters("search", e.target.value);
          }}
          className="pl-9"
        />
      </div>
      <Select
        value={searchParams.get("position") || ""}
        onChange={(e) => updateFilters("position", e.target.value)}
        className="w-44"
      >
        <option value="">All positions</option>
        {Object.entries(POSITIONS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </Select>
      <Select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateFilters("status", e.target.value)}
        className="w-36"
      >
        <option value="">All statuses</option>
        {PLAYER_STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </Select>
      {isPending && <span className="text-xs text-muted-foreground">Loading...</span>}
    </div>
  );
}
