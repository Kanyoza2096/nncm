// components/admin/DashboardCharts.tsx
// ============================================================================
// Dashboard Charts — Client-side only (Chart.js)
// Lazy-loaded to reduce initial bundle size.
// ============================================================================

'use client'

import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { PieChart as PieChartIcon } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// ============================================================================
// TYPES
// ============================================================================

interface DashboardChartsProps {
  donations: { amount: number; donor_name: string; created_at: string }[]
  expensesByCategory: { category: string; amount: number }[]
  totalDonations: number
}

// ============================================================================
// HELPERS
// ============================================================================

function buildLineData(donations: DashboardChartsProps['donations']) {
  // Group donations by month
  const monthlyMap: Record<string, number> = {}
  donations.forEach((d) => {
    const date = new Date(d.created_at)
    const key = date.toLocaleDateString('en-US', { month: 'short' })
    monthlyMap[key] = (monthlyMap[key] || 0) + d.amount
  })

  const labels = Object.keys(monthlyMap)
  const data = Object.values(monthlyMap)

  return {
    labels: labels.length > 0 ? labels : ['No data'],
    datasets: [
      {
        label: 'Seeds & Tithes',
        data: data.length > 0 ? data : [0],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }
}

function buildBarData(expensesByCategory: DashboardChartsProps['expensesByCategory']) {
  const labels = expensesByCategory.map((e) => e.category)
  const data = expensesByCategory.map((e) => e.amount)

  return {
    labels: labels.length > 0 ? labels : ['No data'],
    datasets: [
      {
        label: 'Spending by Category',
        data: data.length > 0 ? data : [0],
        backgroundColor: '#4f46e5',
      },
    ],
  }
}

function buildDoughnutData(expensesByCategory: DashboardChartsProps['expensesByCategory']) {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#64748b', '#ef4444', '#8b5cf6']
  const labels = expensesByCategory.map((e) => e.category)
  const data = expensesByCategory.map((e) => e.amount)
  const bgColors = labels.map((_, i) => colors[i % colors.length])

  return {
    labels: labels.length > 0 ? labels : ['No data'],
    datasets: [
      {
        data: data.length > 0 ? data : [1],
        backgroundColor: bgColors.length > 0 ? bgColors : ['#e2e8f0'],
        borderWidth: 0,
      },
    ],
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardCharts({ donations, expensesByCategory, totalDonations }: DashboardChartsProps) {
  const [linePeriod, setLinePeriod] = useState('6m')

  const lineData = buildLineData(donations)
  const barData = buildBarData(expensesByCategory)
  const doughnutData = buildDoughnutData(expensesByCategory)

  return (
    <>
      {/* Line Chart + Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Financial Momentum</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seeds & Tithes trajectory across Zomba assemblies.
              </p>
            </div>
            <select
              value={linePeriod}
              onChange={(e) => setLinePeriod(e.target.value)}
              className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Chart time period"
            >
              <option value="6m">Last 6 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Doughnut Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" aria-hidden="true" />

          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Yield Breakdown
              </span>
            </div>
            <div className="h-[200px] mb-8">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '75%',
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {doughnutData.labels.map((label, i) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                </div>
                <span className="text-xs font-bold">
                  {doughnutData.datasets[0].data[i]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Audit Status
            </span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6">Spending Distribution</h3>
        <div className="h-[250px]">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
    </>
  )
}
