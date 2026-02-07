import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { COLUMNS } from "../lib/taskReducer";
import "./TaskChart.css";

const BAR_COLORS = ["#94a3b8", "#f59e0b", "#34d399"];
const PIE_COLORS = [
  { name: "To Do", color: "#94a3b8" },
  { name: "In Progress", color: "#f59e0b" },
  { name: "Done", color: "#34d399" },
];

export function TaskChart({ tasks }) {
  const byColumn = COLUMNS.map((col) => ({
    name: col.label,
    count: tasks.filter((t) => t.column === col.id).length,
    id: col.id,
  }));

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.column === "done").length;
  const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const pieData = byColumn.map((col, i) => ({
    name: col.name,
    value: col.count,
    color: PIE_COLORS[i].color,
  })).filter((d) => d.value > 0);

  return (
    <div className="task-chart" data-testid="task-chart">
      <div className="task-chart__header">
        <h3 className="task-chart__title">Task Progress</h3>
        <div className="task-chart__summary" data-testid="chart-completion">
          <span className="task-chart__stat">
            <strong className="task-chart__stat-value">{doneCount}</strong>
            <span className="task-chart__stat-sep">/</span>
            <strong className="task-chart__stat-total">{total}</strong>
            <span className="task-chart__stat-label"> tasks completed</span>
          </span>
          <span className="task-chart__pct">{completionPct}%</span>
        </div>
      </div>
      <div className="task-chart__bar">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byColumn} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<TaskChartTooltip />} />
            <Bar dataKey="count" name="Tasks" radius={[8, 8, 0, 0]} data-testid="chart-bar">
              {byColumn.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {pieData.length > 0 && (
        <div className="task-chart__pie">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={76}
                innerRadius={36}
                paddingAngle={2}
                stroke="none"
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<TaskChartTooltip />} />
              <Legend layout="horizontal" align="center" wrapperStyle={{ paddingTop: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function TaskChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="task-chart-tooltip">
      <span className="task-chart-tooltip__label">{label ?? item.name}</span>
      <span className="task-chart-tooltip__value">{item.value} task{item.value !== 1 ? "s" : ""}</span>
    </div>
  );
}
