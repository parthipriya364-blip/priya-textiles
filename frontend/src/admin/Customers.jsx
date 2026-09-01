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
        const data = await getUsers();
        setCustomers(data.users || []);
      } catch (error) {
        console.error("Failed to load customers:", error);
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

  return (
    <div>
      <AdminPageHeader title="Customers" subtitle={`${customers.length} registered customers`} />

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
          { key: "orders", label: "Orders", render: () => "0" },
          {
            key: "totalPurchase",
            label: "Total Purchase",
            render: () => "₹0",
          },
        ]}
        rows={filtered}
        loading={loading}
      />
    </div>
  );
}
