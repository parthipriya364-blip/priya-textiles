import "../style/StatCard.css";

export default function StatCard({ icon, label, value, trend, tone = "gold" }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {trend && (
          <span className={`stat-trend ${trend.startsWith("-") ? "down" : "up"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
