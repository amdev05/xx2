import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Backend integration pending
      setOrders([]);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.kode_order?.toLowerCase().includes(searchQuery.toLowerCase()) || order.pelanggan?.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = filterPaymentStatus === "all" || order.pembayaran?.status_pembayaran === filterPaymentStatus;
    const matchesOrder = filterOrderStatus === "all" || order.status_order === filterOrderStatus;
    return matchesSearch && matchesPayment && matchesOrder;
  });

  const getPaymentStatusBadge = (status) => {
    const colors = {
      SUCCESS: "bg-green-500/20 text-green-500",
      PENDING: "bg-yellow-500/20 text-yellow-500",
      FAILED: "bg-red-500/20 text-red-500",
    };
    return colors[status] || colors.PENDING;
  };

  const getOrderStatusBadge = (status) => {
    const colors = {
      PAID: "bg-green-500/20 text-green-500",
      PENDING: "bg-yellow-500/20 text-yellow-500",
      EXPIRED: "bg-gray-500/20 text-gray-600",
      CANCELLED: "bg-red-500/20 text-red-500",
    };
    return colors[status] || colors.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-950 text-2xl font-bold">Bookings Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all bookings and ticket orders</p>
        </div>
        <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium">Export to CSV</button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by booking code or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Payment Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={filterOrderStatus}
            onChange={(e) => setFilterOrderStatus(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Order Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Movie</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cinema</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date & Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Seats</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const firstTicket = order.tikets?.[0];
                const film = firstTicket?.jadwal?.film;
                const studio = firstTicket?.jadwal?.studio;
                const cabang = studio?.cabang;

                return (
                  <tr key={order.id_order} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{order.kode_order}</td>
                    <td className="py-3 px-4 text-gray-950">
                      <div>
                        <p className="text-sm text-gray-950 font-medium">{order.pelanggan?.nama_pelanggan}</p>
                        <p className="text-xs text-gray-600">{order.pelanggan?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{film?.nama_film || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cabang?.nama_cabang || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {firstTicket?.jadwal?.tanggal ? new Date(firstTicket.jadwal.tanggal).toLocaleDateString("id-ID") : "-"} {firstTicket?.jadwal?.jam_mulai || ""}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.tikets?.map((t) => `${t.kursi?.row_kursi}${t.kursi?.no_kursi}`).join(", ") || "-"}</td>
                    <td className="py-3 px-4 text-sm font-medium">Rp {Number(order.grand_total).toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-gray-950">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${getPaymentStatusBadge(order.pembayaran?.status_pembayaran)}`}>
                        {order.pembayaran?.status_pembayaran || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-950">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${getOrderStatusBadge(order.status_order)}`}>{order.status_order}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-950">
                      <Link to={`/admin/bookings/${order.id_order}`} className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No bookings available</p>
          </div>
        )}
      </div>
    </div>
  );
}
