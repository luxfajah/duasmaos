'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const data = [
  { name: 'SEG', concluídas: 4, planejadas: 6 },
  { name: 'TER', concluídas: 7, planejadas: 8 },
  { name: 'QUA', concluídas: 9, planejadas: 9 },
  { name: 'QUI', concluídas: 5, planejadas: 7 },
  { name: 'SEX', concluídas: 12, planejadas: 11 },
  { name: 'SÁB', concluídas: 2, planejadas: 0 },
];

/* Brand gradient IDs */
const TERRACOTTA_ID  = 'grad-terracotta'
const OLIVE_ID       = 'grad-olive'

export function ProductivityChart() {
  return (
    <div className="rounded-2xl p-6 bg-surface-elevated shadow-sm border border-sand-dark/40 relative overflow-hidden">

      {/* Subtle Deep Blue accent corner */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'hsl(222 55% 22%)', filter: 'blur(32px)', transform: 'translate(30%, -30%)' }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <p className="label-eyebrow text-text-muted mb-1">Performance</p>
          <h3 className="text-xl font-black font-heading text-text-primary tracking-tight">
            Produtividade da Semana
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold font-body">
          <span className="flex items-center gap-1.5 text-terracotta-dark">
            <span className="w-3 h-3 rounded-full bg-terracotta" />
            Concluídas
          </span>
          <span className="flex items-center gap-1.5 text-olive-dark">
            <span className="w-3 h-3 rounded-full bg-olive" />
            Planejadas
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[220px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <defs>
              {/* Terracotta gradient fill */}
              <linearGradient id={TERRACOTTA_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(13 55% 50%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(13 55% 50%)" stopOpacity={0}    />
              </linearGradient>
              {/* Olive gradient fill */}
              <linearGradient id={OLIVE_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(68 28% 32%)" stopOpacity={0.20} />
                <stop offset="95%" stopColor="hsl(68 28% 32%)" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(35 18% 84%)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(222 10% 58%)', fontSize: 11, fontWeight: 700, fontFamily: 'Lato' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(222 10% 58%)', fontSize: 11, fontFamily: 'Lato' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(35 15% 98%)',
                border: '1px solid hsl(35 18% 84%)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgb(0 0 0 / 0.10)',
                fontFamily: 'Lato',
                fontSize: 13,
              }}
              itemStyle={{ color: 'hsl(222 30% 12%)' }}
              cursor={{ stroke: 'hsl(13 55% 50% / 0.2)', strokeWidth: 2 }}
            />
            <Legend wrapperStyle={{ display: 'none' }} />

            {/* Olive — Planejadas (behind) */}
            <Area
              type="monotone"
              dataKey="planejadas"
              name="Planejadas"
              stroke="hsl(68 28% 42%)"
              strokeWidth={2.5}
              fill={`url(#${OLIVE_ID})`}
              dot={false}
              activeDot={{ r: 5, fill: 'hsl(68 28% 32%)', strokeWidth: 0 }}
            />

            {/* Terracotta — Concluídas (front, dominant) */}
            <Area
              type="monotone"
              dataKey="concluídas"
              name="Concluídas"
              stroke="hsl(13 55% 50%)"
              strokeWidth={3}
              fill={`url(#${TERRACOTTA_ID})`}
              dot={{ r: 4, fill: 'hsl(13 55% 50%)', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'hsl(13 55% 50%)', stroke: 'hsl(35 35% 95%)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
