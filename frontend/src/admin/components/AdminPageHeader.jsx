import "../style/AdminPageHeader.css";

export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="admin-page-header-action">{action}</div>}
    </div>
  );
}
