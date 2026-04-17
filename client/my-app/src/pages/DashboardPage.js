function MetricCard({ card }) {
  return (
    <div className={`metric-card theme-${card.theme}`}>
      <div className="metric-card-icon">
        <i className="bi bi-wallet2"></i>
      </div>
      <div className="metric-value">{card.value}</div>
      <div className="metric-title">{card.title}</div>
      <div className="metric-note">{card.note}</div>
    </div>
  );
}

function DonutChart({ stats }) {
  const gradient = stats
    .map((item, index) => {
      const start = stats
        .slice(0, index)
        .reduce((total, current) => total + current.percent, 0);
      const end = start + item.percent;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-core"></div>
      </div>
      <div className="legend-list">
        {stats.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-label">
              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
              {item.label}
            </span>
            <strong>{String(item.value).padStart(2, '0')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesBars({ salesTrend }) {
  const maxValue = Math.max(
    1,
    ...salesTrend.map((item) => Math.max(Number(item.total || 0), Number(item.converted || 0)))
  );

  return (
    <div className="sales-chart">
      {salesTrend.map((item) => (
        <div className="bar-group" key={item.day}>
          <div className="bar-pair">
            <div
              className="bar total"
              style={{ height: `${(item.total / maxValue) * 100}%` }}
            ></div>
            <div
              className="bar converted"
              style={{ height: `${(item.converted / maxValue) * 100}%` }}
            ></div>
          </div>
          <small>{item.day}</small>
        </div>
      ))}
    </div>
  );
}

function SupportBubbles({ items }) {
  return (
    <div className="support-bubbles">
      {items.map((item) => (
        <div
          key={item.label}
          className="support-bubble"
          style={{
            backgroundColor: item.color,
            width: `${item.value * 4.6}px`,
            height: `${item.value * 4.6}px`,
          }}
        >
          <strong>{item.value}</strong>
        </div>
      ))}
      <div className="legend-list">
        {items.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-label">
              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
              {item.label}
            </span>
            <strong>{String(item.value).padStart(2, '0')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage({ dashboard }) {
  const totalProjects =
    dashboard.overviewCards.find((card) => card.title === 'Total Projects')?.value ?? 0;
  const totalSales = dashboard.salesTrend.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalTickets = dashboard.supportSummary.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="content-stack">
      <div className="panel-card">
        <div className="section-heading">
          <div className="heading-left">
            <span className="section-icon">
              <i className="bi bi-bar-chart"></i>
            </span>
            <div>
              <h3>Overview</h3>
            </div>
          </div>
          <div className="heading-actions">
            <button className="icon-button sm" type="button">
              <i className="bi bi-sliders"></i>
            </button>
            <button className="icon-button sm" type="button">
              <i className="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
        <div className="metric-grid">
          {dashboard.overviewCards.map((card) => (
            <MetricCard card={card} key={card.title} />
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="panel-card h-100">
            <div className="section-heading">
              <div className="heading-left">
                <span className="section-icon">
                  <i className="bi bi-bullseye"></i>
                </span>
                <div>
                  <h3>Project Status</h3>
                  <p>Live breakdown from projects table</p>
                </div>
              </div>
              <strong className="headline-number">{totalProjects}</strong>
            </div>
            <DonutChart stats={dashboard.leadStats} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="panel-card h-100">
            <div className="section-heading">
              <div className="heading-left">
                <span className="section-icon">
                  <i className="bi bi-megaphone"></i>
                </span>
                <div>
                  <h3>Sales</h3>
                  <p>Static demo trend {totalSales}</p>
                </div>
              </div>
              <div className="mini-legend">
                <span className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: '#eb5c57' }}></span>
                  Total Sales
                </span>
                <span className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: '#66a16f' }}></span>
                  Converted
                </span>
              </div>
            </div>
            <SalesBars salesTrend={dashboard.salesTrend} />
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-heading">
          <div className="heading-left">
            <span className="section-icon">
              <i className="bi bi-headset"></i>
            </span>
            <div>
              <h3>Support Status</h3>
              <p>Live ticket totals {totalTickets}</p>
            </div>
          </div>
          <span className="week-tag">From database</span>
        </div>
        <SupportBubbles items={dashboard.supportSummary} />
      </div>
    </div>
  );
}
