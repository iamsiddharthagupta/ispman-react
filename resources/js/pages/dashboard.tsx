import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../layouts/dashboard-layout';

interface DashboardMetricData {
  activeCustomers: number;
  inactiveCustomers: number;
  todayPayments: number;
  newCustomers: number;
}

interface MonthlyMetric {
  month: string;
  label: string;
  payments: number;
  vendorRate: number;
  customers: number;
}

interface DashboardProps {
  metrics: DashboardMetricData;
  monthlyData: MonthlyMetric[];
}

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color,
  href,
  isCurrency = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
  color: string;
  href: string;
  isCurrency?: boolean;
}) {
  return (
    <Link href={href} className="dashboard-metric-link">
      <section className={`dashboard-metric-card dashboard-metric-${color}`}>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <p className="dashboard-metric-title">{title}</p>
            <p className="dashboard-metric-value">
              {isCurrency ? formatMoney(value) : value.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="dashboard-metric-icon" aria-hidden="true">
            <i className={`bi ${icon}`} />
          </span>
        </div>
        <div className="dashboard-metric-footer">
          <span>{description}</span>
          <i className="bi bi-arrow-up-right" aria-hidden="true" />
        </div>
      </section>
    </Link>
  );
}

function PaymentsChart({ data }: { data: MonthlyMetric[] }) {
  const width = 720;
  const height = 270;
  const left = 48;
  const right = 12;
  const top = 18;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const highestValue = Math.max(
    0,
    ...data.map((item) => Math.max(item.payments, item.vendorRate)),
  );
  const scaleMax = highestValue > 0 ? highestValue : 1;
  const groupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(13, groupWidth * 0.28);

  return (
    <div className="dashboard-chart-scroll">
      <svg
        className="dashboard-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Monthly payment collection compared with vendor rate for the last twelve months"
      >
        {[0, 1, 2, 3].map((step) => {
          const y = top + (chartHeight / 3) * step;
          const value = scaleMax * (1 - step / 3);

          return (
            <g key={step}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                className="dashboard-chart-grid"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="dashboard-chart-axis"
              >
                {compactMoneyFormatter.format(value)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const center = left + groupWidth * (index + 0.5);
          const paymentHeight = (item.payments / scaleMax) * chartHeight;
          const vendorHeight = (item.vendorRate / scaleMax) * chartHeight;

          return (
            <g key={item.month}>
              <title>
                {item.month}: collection {formatMoney(item.payments)}, vendor
                rate {formatMoney(item.vendorRate)}
              </title>
              <rect
                x={center - barWidth - 1}
                y={top + chartHeight - paymentHeight}
                width={barWidth}
                height={paymentHeight}
                rx="3"
                className="dashboard-chart-bar-primary"
              />
              <rect
                x={center + 1}
                y={top + chartHeight - vendorHeight}
                width={barWidth}
                height={vendorHeight}
                rx="3"
                className="dashboard-chart-bar-secondary"
              />
              <text
                x={center}
                y={height - 17}
                textAnchor="middle"
                className="dashboard-chart-axis"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CustomersChart({ data }: { data: MonthlyMetric[] }) {
  const width = 720;
  const height = 270;
  const left = 48;
  const right = 12;
  const top = 18;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const highestValue = Math.max(0, ...data.map((item) => item.customers));
  const scaleMax = highestValue > 0 ? highestValue : 1;
  const groupWidth = chartWidth / Math.max(data.length, 1);
  const points = data.map((item, index) => ({
    ...item,
    x: left + groupWidth * (index + 0.5),
    y: top + chartHeight - (item.customers / scaleMax) * chartHeight,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? left} ${top + chartHeight} L ${points[0]?.x ?? left} ${top + chartHeight} Z`;

  return (
    <div className="dashboard-chart-scroll">
      <svg
        className="dashboard-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="New customer registrations by month for the last twelve months"
      >
        {[0, 1, 2, 3].map((step) => {
          const y = top + (chartHeight / 3) * step;
          const value = Math.ceil(scaleMax * (1 - step / 3));

          return (
            <g key={step}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                className="dashboard-chart-grid"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="dashboard-chart-axis"
              >
                {value}
              </text>
            </g>
          );
        })}
        <path d={areaPath} className="dashboard-chart-area" />
        <path d={linePath} className="dashboard-chart-line" />
        {points.map((point) => (
          <g key={point.month}>
            <title>{`${point.month}: ${point.customers} new customers`}</title>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              className="dashboard-chart-point"
            />
            <text
              x={point.x}
              y={height - 17}
              textAnchor="middle"
              className="dashboard-chart-axis"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard({ metrics, monthlyData }: DashboardProps) {
  const currentMonth = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <AdminLayout>
      <Head title="Dashboard" />

      {/* <div className="app-content-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-sm-6">
              <h3 className="mb-1">Dashboard</h3>
              <p className="text-body-secondary mb-0">
                Your internet service at a glance.
              </p>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-end mb-0">
                <li className="breadcrumb-item">
                  <Link href="/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Dashboard
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div> */}

      <div className="app-content-header">
        <div className="container-fluid dashboard-content">
          <div className="dashboard-section-heading">
            <div>
              <h4>Overview</h4>
              <p>Key business metrics for {currentMonth}</p>
            </div>
            <span className="dashboard-period-badge">
              <i className="bi bi-calendar3 me-2" aria-hidden="true" />
              {currentMonth}
            </span>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <MetricCard
                title="Active customers"
                value={metrics.activeCustomers}
                description="Customers with a running plan"
                icon="bi-wifi"
                color="blue"
                href="/customers"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <MetricCard
                title="Inactive customers"
                value={metrics.inactiveCustomers}
                description="Plan expired 30+ days ago"
                icon="bi-person-x"
                color="amber"
                href="/customers"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <MetricCard
                title="Today's collection"
                value={metrics.todayPayments}
                description="Payments received today"
                icon="bi-currency-rupee"
                color="green"
                href="/customers"
                isCurrency
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <MetricCard
                title="New customers"
                value={metrics.newCustomers}
                description="Joined this month"
                icon="bi-person-plus"
                color="violet"
                href="/customers"
              />
            </div>
          </div>

          <div className="dashboard-section-heading dashboard-chart-heading">
            <div>
              <h4>Performance trends</h4>
              <p>Monthly activity over the last 12 months</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-xl-6">
              <section className="dashboard-panel h-100">
                <div className="dashboard-panel-header">
                  <div>
                    <h5>Payment collection</h5>
                    <p>Collection compared with vendor rate</p>
                  </div>
                  <span className="dashboard-panel-icon dashboard-panel-icon-blue">
                    <i className="bi bi-bar-chart-line" aria-hidden="true" />
                  </span>
                </div>
                <div className="dashboard-chart-legend">
                  <span>
                    <i className="dashboard-legend-dot dashboard-legend-blue" />
                    Collection
                  </span>
                  <span>
                    <i className="dashboard-legend-dot dashboard-legend-slate" />
                    Vendor rate
                  </span>
                </div>
                <PaymentsChart data={monthlyData} />
              </section>
            </div>
            <div className="col-12 col-xl-6">
              <section className="dashboard-panel h-100">
                <div className="dashboard-panel-header">
                  <div>
                    <h5>Customer growth</h5>
                    <p>New customer registrations by month</p>
                  </div>
                  <span className="dashboard-panel-icon dashboard-panel-icon-green">
                    <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                  </span>
                </div>
                <div className="dashboard-chart-legend">
                  <span>
                    <i className="dashboard-legend-dot dashboard-legend-green" />
                    New customers
                  </span>
                </div>
                <CustomersChart data={monthlyData} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
