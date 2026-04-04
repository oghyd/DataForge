"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Shield, Swords, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { searchAll } from "@/services/search-actions";

type SearchResults = Awaited<ReturnType<typeof searchAll>>;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    startTransition(async () => {
      const data = await searchAll(value.trim());
      setResults(data);
    });
  }

  const totalResults = results
    ? results.players.length + results.teams.length + results.matches.length + results.clubs.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground">Find players, teams, matches, and clubs across the platform</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, city, position..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {results && !isPending && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {results.players.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Players ({results.players.length})
              </h2>
              <div className="space-y-2">
                {results.players.map((p) => (
                  <Link key={p.id} href={`/players/${p.id}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.city && `${p.city} · `}{p.nationality || ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.primaryPosition && <Badge variant="outline">{p.primaryPosition}</Badge>}
                          <Badge className={p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {p.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.teams.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Teams ({results.teams.length})
              </h2>
              <div className="space-y-2">
                {results.teams.map((t) => (
                  <Link key={t.id} href={`/teams/${t.id}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{t.club.name} — {t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.ageGroup} · {t.gender}</p>
                          </div>
                        </div>
                        {t.formation && <Badge variant="outline">{t.formation}</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.clubs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Clubs ({results.clubs.length})
              </h2>
              <div className="space-y-2">
                {results.clubs.map((c) => (
                  <Card key={c.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: c.primaryColor || "#6b7280" }}
                        >
                          {c.shortName || c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          {c.city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {c.city}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.matches.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Swords className="h-4 w-4" /> Matches ({results.matches.length})
              </h2>
              <div className="space-y-2">
                {results.matches.map((m) => (
                  <Link key={m.id} href={`/matches/${m.id}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Swords className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              {m.homeTeam.club.name} {m.homeScore ?? "?"} - {m.awayScore ?? "?"} {m.awayTeam.club.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(m.matchDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={m.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                          {m.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!results && !isPending && query.length < 2 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">Type at least 2 characters to search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
