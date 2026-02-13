import {
  ZevSectionHeader,
  ZevSelect,
  ZevLoader,
  ZevEmptyState,
  ZevStatCard,
} from '@malvezzidatr/zev-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useDashboard } from './useDashboard'
import { periodOptions, levelOptions } from './Dashboard.types'
import type { DashboardViewModel } from './Dashboard.types'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const AREA_LABELS: Record<string, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  FULLSTACK: 'Fullstack',
  MOBILE: 'Mobile',
}

export function Dashboard() {
  const vm = useDashboard()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <ZevSectionHeader
          tag="[MERCADO]"
          title="Panorama do Mercado"
          variant="centered"
          size="medium"
        />
      </div>

      <FiltersSection vm={vm} />

      {vm.loading ? (
        <DashboardSkeleton />
      ) : vm.error ? (
        <div className="empty-container">
          <ZevEmptyState
            title="Erro ao carregar dados"
            description={vm.error}
          />
        </div>
      ) : vm.data ? (
        <>
          <SummaryCards vm={vm} />
          <div className="dashboard-charts-grid">
            <TechBarChart data={vm.data.topTechnologies} />
            <AreaDonutChart data={vm.data.jobsByArea} />
            <ModalityDonutChart data={vm.data.workModality} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function FiltersSection({ vm }: { vm: DashboardViewModel }) {
  return (
    <div className="dashboard-filters">
      <ZevSelect
        label="Período"
        options={periodOptions}
        value={vm.filters.period || '30d'}
        onSelectChange={vm.handlePeriodChange}
      />
      <ZevSelect
        label="Nível"
        options={levelOptions}
        value={vm.filters.level || 'ALL'}
        onSelectChange={vm.handleLevelChange}
      />
    </div>
  )
}

function SummaryCards({ vm }: { vm: DashboardViewModel }) {
  if (!vm.data) return null

  const { summary } = vm.data

  return (
    <div className="dashboard-summary">
      <ZevStatCard value={String(summary.totalActive)} label="Vagas Ativas" />
      <ZevStatCard value={`${summary.remotePercentage}%`} label="Remotas" />
      <ZevStatCard value={summary.topTechnology || '—'} label="Tecnologia #1" />
      <ZevStatCard
        value={summary.topArea ? AREA_LABELS[summary.topArea] || summary.topArea : '—'}
        label="Área com Mais Vagas"
      />
    </div>
  )
}

function TechBarChart({ data }: { data: Array<{ name: string; count: number }> }) {
  if (data.length === 0) return null

  return (
    <div className="dashboard-chart-card dashboard-chart-card--full">
      <h3 className="dashboard-chart-title">Tecnologias Mais Pedidas</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13 }} />
          <Tooltip
            formatter={(value) => [`${value} vagas`, 'Quantidade']}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
          <Bar dataKey="count" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AreaDonutChart({ data }: { data: Array<{ area: string; count: number }> }) {
  if (data.length === 0) return null

  const chartData = data.map(d => ({
    name: AREA_LABELS[d.area] || d.area,
    value: d.count,
  }))

  return (
    <div className="dashboard-chart-card">
      <h3 className="dashboard-chart-title">Vagas por Área</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} vagas`, 'Quantidade']}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function ModalityDonutChart({ data }: { data: Array<{ modality: string; count: number }> }) {
  if (data.length === 0) return null

  const chartData = data.map(d => ({
    name: d.modality,
    value: d.count,
  }))

  return (
    <div className="dashboard-chart-card">
      <h3 className="dashboard-chart-title">Modalidade de Trabalho</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} vagas`, 'Quantidade']}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="dashboard-summary">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dashboard-skeleton-card">
            <ZevLoader size="md" />
          </div>
        ))}
      </div>
      <div className="dashboard-charts-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`dashboard-skeleton-card ${i === 0 ? 'dashboard-chart-card--full' : ''}`}>
            <ZevLoader size="lg" />
          </div>
        ))}
      </div>
    </>
  )
}
