import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "./components/AdminPageHeader";
import SearchBar from "./components/SearchBar";
import DataTable from "./components/DataTable";
import { getUsers } from "../services/authService";
import "./admin-forms.css";

export default function Customers() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        console.log('📊 Loading customers data...');
        const data = await getUsers();
        console.log('✅ Received customers:', data);
        console.log('   Count:', data.count);
        console.log('   Users array:', data.users);
        
        if (data.users && data.users.length > 0) {
          console.log('   Sample user data:', data.users[0]);
        }
        
        setCustomers(data.users || []);
      } catch (error) {
        console.error("❌ Failed to load customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        (c.address?.city || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [customers, query]);

  // Calculate total statistics
  const totalStats = useMemo(() => {
    const totalOrders = customers.reduce((sum, c) => sum + (c.orderCount || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchase || 0), 0);
    const avgOrderValue = totalRevenue / Math.max(totalOrders, 1);
    
    // Calculate percentage change (comparing avg order value to median customer purchase)
    const customerAverages = customers
      .filter(c => c.orderCount > 0)
      .map(c => (c.totalPurchase || 0) / (c.orderCount || 1))
      .sort((a, b) => a - b);
    
    const medianOrderValue = customerAverages.length > 0 
      ? customerAverages[Math.floor(customerAverages.length / 2)]
      : avgOrderValue;
    
    const avgOrderValueChange = medianOrderValue > 0 
      ? ((avgOrderValue - medianOrderValue) / medianOrderValue) * 100 
      : 0;
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      avgOrderValueChange,
    };
  }, [customers]);

  return (
    <div>
      <AdminPageHeader 
        title="Customers" 
        subtitle={`${customers.length} registered customers · ${totalStats.totalOrders} total orders · ₹${totalStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} total revenue`} 
      />

      {/* Customer Statistics */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{totalStats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">
            ₹{totalStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">
            ₹{totalStats.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`stat-change ${totalStats.avgOrderValueChange >= 0 ? 'positive' : 'negative'}`}>
            {totalStats.avgOrderValueChange >= 0 ? '↑' : '↓'} {Math.abs(totalStats.avgOrderValueChange).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <SearchBar value={query} onChange={setQuery} placeholder="Search customers..." />
        </div>
      </div>

      <DataTable
        emptyText="No customers match your search."
        columns={[
          { key: "name", label: "Customer" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "city", label: "City", render: (c) => c.address?.city || "-" },
          { 
            key: "orderCount", 
            label: "Orders", 
            render: (c) => c.orderCount || 0 
          },
          {
            key: "totalPurchase",
            label: "Total Purchase",
            render: (c) => `₹${(c.totalPurchase || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        ]}
        rows={filtered}
        loading={loading}
      />
    </div>
  );
}
