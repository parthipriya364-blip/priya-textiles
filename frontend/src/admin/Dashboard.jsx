import {
  FaRupeeSign,
  FaShoppingBag,
  FaClipboardList,
  FaBoxOpen,
  FaUsers,
  FaStar,
  FaExclamationTriangle,
  FaBolt,
} from "react-icons/fa";
import StatCard from "./components/StatCard";
import ChartCard from "./components/ChartCard";
import DataTable from "./components/DataTable";
import AdminPageHeader from "./components/AdminPageHeader";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productService";
import { getUsers } from "../services/authService";
import { getCategories } from "../services/categoryService";
import { getAllBookings } from "../services/paymentService";
import "./admin-forms.css";
import "./Dashboard.css";

const statusBadge = (status) => {
  const map = {
    confirmed: "badge-gold",
    shipped: "badge-blue",
    delivered: "badge-green",
    cancelled: "badge-maroon",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
};

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsData, usersData, categoriesData, bookingsData] = await Promise.all([
        getProducts(),
        getUsers(),
        getCategories(),
        getAllBookings(),
      ]);
      
      setProducts(productsData.products || []);
      setCustomers(usersData.users || []);
      setCategories(categoriesData.categories || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive);
    const totalStock = activeProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    
    // Calculate real revenue from paid bookings
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.total, 0);
    
    // Total orders count
    const totalOrders = bookings.length;
    const shippedOrders = bookings.filter(b => b.orderStatus === 'shipped').length;
    const confirmedOrders = bookings.filter(b => b.orderStatus === 'confirmed').length;
    
    return {
      products: activeProducts.length,
      totalProducts: products.length,
      customers: customers.length,
      reviews: products.reduce((total, product) => total + (product.reviewsCount || 0), 0),
      lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
      outOfStock: products.filter((product) => product.stock === 0).length,
      totalStock,
      featuredProducts: products.filter(p => p.isFeatured).length,
      newProducts: products.filter(p => p.isNew).length,
      totalRevenue,
      totalOrders,
      shippedOrders,
      confirmedOrders,
    };
  }, [customers, products, bookings]);

  const categoryData = useMemo(() => {
    if (products.length === 0) return [];
    
    return categories
      .map((category) => {
        const count = products.filter((product) => product.categoryName === category.name).length;
        return {
          label: category.name,
          count,
          value: Math.round((count / products.length) * 100),
        };
      })
      .filter((category) => category.count > 0);
  }, [categories, products]);

  const recentCustomers = useMemo(() => 
    customers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [customers]
  );

  const totalProductValue = useMemo(() => 
    products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0),
    [products]
  );

  const recentOrders = useMemo(() =>
    bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [bookings]
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back — here's how Priya Textiles is performing."
      />

      <div className="admin-grid cols-3 stat-grid">
        <StatCard
          icon={<FaRupeeSign />}
          label="Total Revenue"
          value={loading ? "..." : `₹${stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={stats.totalOrders > 0 ? `${bookings.filter(b => b.paymentStatus === 'paid').length} paid orders` : "No revenue yet"}
          tone="gold"
        />
        <StatCard
          icon={<FaShoppingBag />}
          label="Total Orders"
          value={loading ? "..." : stats.totalOrders}
          trend={stats.shippedOrders > 0 ? `${stats.shippedOrders} shipped` : "No shipped orders"}
          tone="maroon"
        />
        <StatCard
          icon={<FaClipboardList />}
          label="Confirmed Orders"
          value={loading ? "..." : stats.confirmedOrders}
          trend={stats.totalOrders > 0 ? `${((stats.confirmedOrders / stats.totalOrders) * 100).toFixed(0)}% of total` : undefined}
          tone="black"
        />
        <StatCard
          icon={<FaBoxOpen />}
          label="Active Products"
          value={loading ? "..." : stats.products}
          trend={stats.totalProducts !== stats.products ? `${stats.totalProducts} total` : undefined}
          tone="gold"
        />
        <StatCard
          icon={<FaUsers />}
          label="Total Customers"
          value={loading ? "..." : stats.customers}
          trend={stats.customers > 0 ? "Registered users" : "No customers yet"}
          tone="maroon"
        />
        <StatCard
          icon={<FaBolt />}
          label="Featured Products"
          value={loading ? "..." : stats.featuredProducts}
          trend={stats.newProducts > 0 ? `${stats.newProducts} new arrivals` : undefined}
          tone="black"
        />
        <StatCard
          icon={<FaExclamationTriangle />}
          label="Low Stock Alert"
          value={loading ? "..." : stats.lowStock}
          trend={stats.lowStock > 0 ? "Needs restocking" : "All good"}
          tone="maroon"
        />
        <StatCard
          icon={<FaShoppingBag />}
          label="Out of Stock"
          value={loading ? "..." : stats.outOfStock}
          trend={stats.outOfStock > 0 ? "Needs attention" : "All in stock"}
          tone="gold"
        />
        <StatCard
          icon={<FaStar />}
          label="Total Reviews"
          value={loading ? "..." : stats.reviews}
          tone="black"
        />
      </div>

      <div className="admin-grid cols-2 chart-grid">
        <ChartCard
          title="Product Distribution"
          subtitle="Products by category"
          type="donut"
          data={categoryData}
        />

        <div className="dashboard-lists">
          <div className="dashboard-list-card">
            <h3>Recent Customers</h3>
            {loading ? (
              <p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p>
            ) : recentCustomers.length > 0 ? (
              <ul>
                {recentCustomers.map((c) => (
                  <li key={c._id}>
                    <div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{c.name}</strong>
                      <span>{c.email}</span>
                    </div>
                    <span className="customer-orders">
                      {c.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                No customers registered yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-grid cols-2 chart-grid">
        <div className="dashboard-list-card">
          <h3>Low Stock Products</h3>
          {loading ? (
            <p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p>
          ) : stats.lowStock > 0 ? (
            <ul>
              {products
                .filter((p) => p.stock > 0 && p.stock <= 5)
                .slice(0, 5)
                .map((p) => (
                  <li key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={p.image?.url} 
                      alt={p.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <span>{p.categoryName}</span>
                    </div>
                    <span style={{ 
                      color: 'var(--c-gold-deep)', 
                      fontWeight: 'bold',
                      fontSize: '0.875rem' 
                    }}>
                      {p.stock} left
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
              All products are well stocked
            </p>
          )}
        </div>

        <div className="dashboard-list-card">
          <h3>Featured Products</h3>
          {loading ? (
            <p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p>
          ) : stats.featuredProducts > 0 ? (
            <ul>
              {products
                .filter((p) => p.isFeatured)
                .slice(0, 5)
                .map((p) => (
                  <li key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={p.image?.url} 
                      alt={p.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <span>₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                    <span style={{ 
                      color: p.inStock ? 'var(--c-green)' : 'var(--c-maroon-deep)',
                      fontSize: '0.875rem'
                    }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
              No featured products yet
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-recent-orders">
        <h3>Recent Orders</h3>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
        ) : recentOrders.length > 0 ? (
          <DataTable
            columns={[
              {
                key: "id",
                label: "Order ID",
                render: (b) => `#${b._id.slice(-8).toUpperCase()}`,
              },
              {
                key: "customer",
                label: "Customer",
                render: (b) => (
                  <div>
                    <div style={{ fontWeight: 500 }}>{b.customer.name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{b.customer.email}</div>
                  </div>
                ),
              },
              {
                key: "items",
                label: "Items",
                render: (b) => `${b.items.length} item${b.items.length > 1 ? 's' : ''}`,
              },
              {
                key: "amount",
                label: "Amount",
                render: (b) => `₹${b.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              },
              {
                key: "payment",
                label: "Payment",
                render: (b) => (
                  <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-green' : 'badge-gold'}`}>
                    {b.paymentStatus.toUpperCase()}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (b) => statusBadge(b.orderStatus),
              },
              {
                key: "date",
                label: "Date",
                render: (b) => formatDate(b.createdAt),
              },
            ]}
            rows={recentOrders}
          />
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            No orders placed yet
          </p>
        )}
      </div>
    </div>
  );
}
