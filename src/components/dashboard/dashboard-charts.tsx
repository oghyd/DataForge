"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { POSITIONS } from "@/lib/utils";

const COLORS = [
  "hsl(142, 76%, 36%)", "hsl(200, 80%, 50%)", "hsl(45, 93%, 47%)",
  "hsl(0, 84%, 60%)", "hsl(270, 70%, 60%)", "hsl(180, 60%, 45%)",
  "hsl(30, 90%, 55%)", "hsl(330, 70%, 55%)", "hsl(120, 40%, 50%)",
  "hsl(210, 60%, 65%)", "hsl(60, 80%, 45%)", "hsl(300, 50%, 55%)",
  "hsl(150, 55%, 45%)",
];

interface DashboardChartsProps {
  positionDistribution: { position: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}

export function DashboardCharts({ positionDistribution, monthlyGrowth }: DashboardChartsProps) {
  const posData = positionDistribution.map((p) => ({
    name: POSITIONS[p.position] || p.position,
    value: p.count,
    position: p.position,
  }));

  return (
    <div className="space-y-6">
      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Player Registration Growth</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyGrowth.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No growth data yet. Add players to see trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Players" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Position Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Position Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {posData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No position data yet. Add players with positions.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={posData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {posData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
