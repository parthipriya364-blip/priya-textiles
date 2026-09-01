import { useState, useEffect, useMemo } from "react";
import { FaRupeeSign, FaChartLine, FaFire, FaLayerGroup, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import StatCard from "./components/StatCard";
import ChartCard from "./components/ChartCard";
import DataTable from "./components/DataTable";
import { getAllBookings } from "../services/paymentService";
import "./admin-forms.css";

export default function Revenue() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real statistics from bookings
  const stats = useMemo(() => {
    if (!bookings.length) return null;

    // Total revenue (only paid orders)
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.total, 0);

    // Revenue by month
    const monthlyRevenue = {};
    const categorySales = {};
    const productSales = {};

    bookings.forEach((booking) => {
      // Monthly revenue
      const date = new Date(booking.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = { label: monthLabel, value: 0, date: date };
      }
      if (booking.paymentStatus === "paid") {
        monthlyRevenue[monthKey].value += booking.total;
      }

      // Category sales
      booking.items.forEach((item) => {
        if (item.product?.categoryName) {
          const category = item.product.categoryName;
          categorySales[category] = (categorySales[category] || 0) + item.quantity;
        }
      });

      // Product sales
      booking.items.forEach((item) => {
        const productId = item.product?._id || item.product;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: item.name,
              image: item.image,
              price: item.price,
              soldCount: 0,
              revenue: 0,
            };
          }
          productSales[productId].soldCount += item.quantity;
          if (booking.paymentStatus === "paid") {
            productSales[productId].revenue += item.price * item.quantity;
          }
        }
      });
    });

    // Sort monthly revenue by date
    const monthlyRevenueArray = Object.values(monthlyRevenue)
      .sort((a, b) => a.date - b.date)
      .map(({ label, value }) => ({ label, value }));

    // Get last 7 days for weekly sales
    const today = new Date();
    const weeklySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString("en-IN", { weekday: "short" });
      
      const dayOrders = bookings.filter((b) => {
        const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bookingDate === dateKey;
      }).length;
      
      weeklySales.push({ label: dayLabel, value: dayOrders });
    }

    // Top selling products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    // Best month
    const bestMonth = monthlyRevenueArray.reduce(
      (max, month) => (month.value > max.value ? month : max),
      { label: "N/A", value: 0 }
    );

    // Category sales for donut chart
    const categorySalesArray = Object.entries(categorySales)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    // Weekly orders total
    const weeklyOrdersTotal = weeklySales.reduce((sum, day) => sum + day.value, 0);
    const previousWeekTotal = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 14);
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      return bookingDate >= weekAgo && bookingDate < twoWeeksAgo;
    }).length;
    
    const weeklyTrend = previousWeekTotal > 0 
      ? `${weeklyOrdersTotal >= previousWeekTotal ? '+' : ''}${weeklyOrdersTotal - previousWeekTotal} vs last week`
      : `${weeklyOrdersTotal} orders`;

    return {
      totalRevenue,
      monthlyRevenue: monthlyRevenueArray,
      weeklySales,
      categorySales: categorySalesArray,
      topProducts,
      bestMonth,
      weeklyOrdersTotal,
      weeklyTrend,
    };
  }, [bookings]);

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Revenue" subtitle="Loading revenue data..." />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FaSpinner className="spinner" style={{ fontSize: "32px", color: "#8B0000" }} />
        </div>
      </div>
    );
  }

  if (!stats || bookings.length === 0) {
    return (
      <div>
        <AdminPageHeader title="Revenue" subtitle="No revenue data available" />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>
            No orders have been placed yet. Revenue statistics will appear here once orders are made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Revenue" subtitle="Sales performance overview" />

      <div className="admin-grid cols-3" style={{ marginBottom: 24 }}>
        <StatCard
          icon={<FaRupeeSign />}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={`${bookings.filter(b => b.paymentStatus === 'paid').length} paid orders`}
          tone="gold"
        />
        <StatCard
          icon={<FaChartLine />}
          label="Best Month"
          value={`${stats.bestMonth.label} · ₹${stats.bestMonth.value.toLocaleString("en-IN")}`}
          tone="maroon"
        />
        <StatCard
          icon={<FaFire />}
          label="Weekly Orders"
          value={stats.weeklyOrdersTotal}
          trend={stats.weeklyTrend}
          tone="black"
        />
      </div>

      <div className="admin-grid cols-2" style={{ marginBottom: 24 }}>
        <ChartCard
          title="Monthly Revenue"
          subtitle={`${stats.monthlyRevenue.length} months of data`}
          type="line"
          data={stats.monthlyRevenue}
          formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
        />
        <ChartCard
          title="Weekly Orders"
          subtitle="Orders placed, last 7 days"
          type="bar"
          data={stats.weeklySales}
          formatValue={(v) => `${v} order${v !== 1 ? 's' : ''}`}
        />
      </div>

      <div className="admin-grid cols-2">
        {stats.categorySales.length > 0 && (
          <ChartCard
            title="Top Categories"
            subtitle="Share of total orders by items"
            type="donut"
            data={stats.categorySales}
          />
        )}

        <div>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 17, color: "var(--c-ink)", marginBottom: 14 }}>
            <FaLayerGroup style={{ marginRight: 8, color: "var(--c-gold-deep)" }} />
            Top Selling Products
          </h3>
          {stats.topProducts.length > 0 ? (
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Product",
                  render: (p) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img 
                        src={p.image} 
                        alt="" 
                        style={{ width: 34, height: 42, objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div>
                        <div>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          ₹{p.revenue.toLocaleString("en-IN")} revenue
                        </div>
                      </div>
                    </div>
                  ),
                },
                { 
                  key: "soldCount", 
                  label: "Sold",
                  render: (p) => `${p.soldCount} units`
                },
                { 
                  key: "price", 
                  label: "Price", 
                  render: (p) => `₹${p.price.toLocaleString("en-IN")}` 
                },
              ]}
              rows={stats.topProducts}
            />
          ) : (
            <p style={{ fontSize: "14px", color: "#666", padding: "20px" }}>
              No product sales data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
