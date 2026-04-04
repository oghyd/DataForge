import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { BarChart3, Database, Users, Shield, Target, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              DF
            </div>
            <span className="text-xl font-bold">DataForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroGeometric
          badge="Football Data Platform"
          title1="Solve the Data Gap"
          title2="in Football"
        />

        <section className="relative z-10 -mt-24 mx-auto max-w-7xl px-6 pb-8">
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Start collecting data
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10">
                View demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Database,
                title: "Structured data collection",
                desc: "Player profiles, match statistics, training records, and scouting reports — all in one place with validation and completeness tracking.",
              },
              {
                icon: BarChart3,
                title: "Actionable analytics",
                desc: "Dashboards for player performance, team trends, participation patterns, and data quality. Know what data you have and what you're missing.",
              },
              {
                icon: Shield,
                title: "Built for football organizations",
                desc: "Role-based access for coaches, scouts, admins, and analysts. Organization-scoped data isolation. Season-aware modeling.",
              },
              {
                icon: Users,
                title: "Complete practitioner profiles",
                desc: "Track identity, physical attributes, positions, career history, injuries, availability, and development over time.",
              },
              {
                icon: Target,
                title: "Match intelligence",
                desc: "Record full match statistics — possession, shots, passes, tackles, cards, and 30+ per-player performance metrics.",
              },
              {
                icon: Activity,
                title: "Data quality as a feature",
                desc: "Completeness scores, missing data indicators, duplicate detection, and provenance tracking. Trust your data.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-card py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold">Ready to solve your data problem?</h2>
            <p className="mt-4 text-muted-foreground">
              Join clubs, academies, and leagues using DataForge to build reliable football data.
            </p>
            <Link href="/register">
              <Button size="lg" className="mt-8 h-12 px-8 text-base">
                Create your free account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          DataForge — Football Practitioner Data Platform
        </div>
      </footer>
    </div>
  );
}
