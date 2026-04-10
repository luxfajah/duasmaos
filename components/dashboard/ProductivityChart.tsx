'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card } from '@/components/ui/card'

const data = [
  { name: 'SEG', concluídas: 4, planejadas: 6 },
  { name: 'TER', concluídas: 7, planejadas: 8 },
  { name: 'QUA', concluídas: 9, planejadas: 9 },
  { name: 'QUI', concluídas: 5, planejadas: 7 },
  { name: 'SEX', concluídas: 12, planejadas: 11 },
  { name: 'SÁB', concluídas: 2, planejadas: 0 },
];

export function ProductivityChart() {
  return (
    <Card variant="muted" className="p-6 col-span-1 lg:col-span-2 relative min-h-[300px] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold font-serif text-text-primary">Produtividade da Semana</h3>
      </div>
      
      <div className="flex-1 w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ top: -40, right: 0, fontSize: 13, color: 'var(--text-secondary)' }}
            />
            <Line 
              type="monotone" 
              dataKey="concluídas" 
              name="Concluídas"
              stroke="var(--brand-primary)" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: 'var(--brand-primary)' }} 
              dot={{ r: 4, fill: 'var(--brand-primary)', strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="planejadas" 
              name="Planejadas"
              stroke="var(--border-strong)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--border-strong)', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
