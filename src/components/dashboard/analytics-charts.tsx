"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { POSITIONS } from "@/lib/utils";


const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#16a34a",
  INACTIVE: "#6b7280",
  INJURED: "#ef4444",
  SUSPENDED: "#f59e0b",
  DRAFT: "#3b82f6",
  TRANSFERRED: "#8b5cf6",
  RETIRED: "#9ca3af",
  ARCHIVED: "#d1d5db",
};

interface AnalyticsChartsProps {
  positionDistribution: { position: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
  playersByStatus: { status: string; count: number }[];
}

export function AnalyticsCharts({ positionDistribution, monthlyGrowth, playersByStatus }: AnalyticsChartsProps) {
  const posData = positionDistribution.map((p) => ({
    name: POSITIONS[p.position] || p.position,
    value: p.count,
  }));

  const statusData = playersByStatus.map((s) => ({
    name: s.status,
    value: s.count,
    fill: STATUS_COLORS[s.status] || "#6b7280",
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Player Registration Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyGrowth.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Add players to see registration trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="New Players" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Position Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {posData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Add players with positions to see distribution
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={posData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} name="Players" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Players by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No player data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Collection Priorities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">High Priority</p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                <li>Complete player profiles with missing positions</li>
                <li>Add match statistics for completed games</li>
                <li>Fill in player physical attributes</li>
              </ul>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-800">Medium Priority</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                <li>Add training session attendance records</li>
                <li>Complete team roster assignments</li>
                <li>Add match events (goals, cards, subs)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-semibold text-blue-800">Future Enhancement</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>Scouting reports for promising players</li>
                <li>Injury and availability tracking</li>
                <li>Player development assessments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
