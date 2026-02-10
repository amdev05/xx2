import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TicketCard } from "../../components/ui/Card";
import { getUserOrders } from "../../services/ticketService";

function UserTicket() {
  const [tabActive, setTabActive] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Show success message if coming from payment
    if (location.state?.message) {
      alert(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }

    fetchOrders();
  }, [location]);

  // Check and expire orders that passed deadline
  useEffect(() => {
    if (orders.length === 0) return;

    const checkExpiredOrders = async () => {
      const now = new Date();
      const expiredOrders = orders.filter((order) => {
        if (order.status_order !== "PENDING") return false;
        if (!order.expired_at) return false;
        return new Date(order.expired_at) < now;
      });

      // Auto-expire orders that passed deadline
      for (const order of expiredOrders) {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/payment/order/${order.id_order}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log(`Order ${order.id_order} auto-expired`);
        } catch (err) {
          console.error(`Failed to expire order ${order.id_order}:`, err);
        }
      }

      // Refresh orders if any were expired
      if (expiredOrders.length > 0) {
        fetchOrders();
      }
    };

    checkExpiredOrders();
    // Check every 30 seconds
    const interval = setInterval(checkExpiredOrders, 30000);

    return () => clearInterval(interval);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUserOrders();
      console.log("Orders Response:", response);

      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError(response.message || "Gagal memuat tiket");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  // Filter active orders
  // Active = belum melewati tanggal & endtime ATAU status PENDING (menunggu pembayaran)
  const activeOrders = orders.filter((order) => {
    // PENDING orders are always active (waiting for payment)
    if (order.status_order === "PENDING") return true;

    // PAID orders are active if schedule hasn't passed
    if (order.status_order === "PAID") {
      // Check if any ticket has a future schedule (before end time)
      return order.tikets?.some((ticket) => {
        try {
          const scheduleDate = new Date(ticket.jadwal.tanggal);
          const endTime = new Date(ticket.jadwal.jam_selesai);

          // Combine date and end time
          const scheduleEndDateTime = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate(), endTime.getHours(), endTime.getMinutes());

          // Active if end time hasn't passed yet
          return scheduleEndDateTime > new Date();
        } catch (e) {
          console.error("Error parsing schedule date:", e);
          return false;
        }
      });
    }

    // EXPIRED, CANCELLED, or other statuses are not active
    return false;
  });

  if (loading) {
    return (
      <div className="max-w-175 mx-auto pt-5 md:pt-10">
        <div className="my-container text-center py-20">
          <p>Memuat tiket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-175 mx-auto pt-5 md:pt-10">
        <div className="my-container text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-primary rounded-myrad">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-175 mx-auto pt-5 md:pt-10">
      <div className="my-container">
        <p className="text-lg font-semibold space-x-6">
          <span className={`cursor-pointer ${tabActive == 0 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(0)}>
            Aktif ({activeOrders.length})
          </span>
          <span className={`cursor-pointer ${tabActive == 1 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(1)}>
            Riwayat ({orders.length})
          </span>
        </p>
      </div>

      {tabActive == 0 && (
        <section className="my-container mt-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-20 text-tx-light/50">
              <p>Belum ada tiket aktif</p>
              <p className="text-sm mt-2">Pesan tiket untuk menonton film favorit Anda!</p>
            </div>
          ) : (
            activeOrders.map((order) => <TicketCard data={order} key={order.id_order} />)
          )}
        </section>
      )}

      {tabActive == 1 && (
        <section className="my-container mt-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-tx-light/50">
              <p>Belum ada riwayat pemesanan</p>
            </div>
          ) : (
            orders.map((order) => <TicketCard data={order} key={order.id_order} />)
          )}
        </section>
      )}
    </div>
  );
}

export default UserTicket;
