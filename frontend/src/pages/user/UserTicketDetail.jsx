import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import domtoimage from "dom-to-image-more";
import arrowLeftIcon from "../../assets/icons/arrowLeftIcon.svg";
import { TicketDetailCard } from "../../components/ui/Card";
import { getUserOrders } from "../../services/ticketService";
import finishedIcon from "../../assets/icons/finished.svg";

function UserTicketDetail() {
  const { id } = useParams(); // This is order ID
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // Countdown timer for PENDING orders
  useEffect(() => {
    if (!order || order.status_order !== "PENDING" || !order.expired_at) {
      return;
    }

    const updateCountdown = async () => {
      const now = new Date().getTime();
      const expiry = new Date(order.expired_at).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setCountdown("Waktu habis");

        // Auto-expire the order
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/payment/order/${order.id_order}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log(`Order ${order.id_order} auto-expired`);

          // Refresh order data
          setTimeout(() => {
            fetchOrderDetail();
          }, 1000);
        } catch (err) {
          console.error(`Failed to expire order:`, err);
        }

        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders();
      console.log("Orders Response:", response);

      if (response.success) {
        // Find the specific order by ID
        const foundOrder = response.data.find((order) => order.id_order === parseInt(id));
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
      } else {
        setError(response.message || "Failed to load order");
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err.message || "Failed to load order detail");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVA = () => {
    const vaNumber = order.pembayaran?.nomor_va || order.pembayaran?.virtual_account;
    if (vaNumber) {
      navigator.clipboard.writeText(vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/payment/order/${order.id_order}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Pesanan berhasil dibatalkan");
        // Refresh order data
        fetchOrderDetail();
      } else {
        const result = await response.json();
        alert(result.message || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      console.error("Error canceling order:", err);
      alert("Terjadi kesalahan saat membatalkan pesanan");
    }
  };

  const handleDownloadTicket = async (e) => {
    const ticketElement = document.getElementById("ticket-container");
    if (!ticketElement) {
      alert("Element tiket tidak ditemukan");
      return;
    }

    const button = e?.currentTarget;
    const originalHTML = button?.innerHTML;

    try {
      // Show loading state
      if (button) {
        button.innerHTML = "<span>Mengunduh...</span>";
        button.disabled = true;
      }

      // Clone the element to modify without affecting the original
      const clone = ticketElement.cloneNode(true);

      // Remove all borders, hr, and buttons from clone
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.border = "none";
        el.style.borderTop = "none";
        el.style.borderBottom = "none";
        el.style.borderLeft = "none";
        el.style.borderRight = "none";
      });

      // Remove hr and button elements
      clone.querySelectorAll("hr, button").forEach((el) => el.remove());

      // Temporarily add clone to document (hidden)
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);

      // Capture the clone
      const dataUrl = await domtoimage.toPng(clone, {
        quality: 1,
        bgcolor: "#0a0a0a",
        width: clone.offsetWidth * 2,
        height: clone.offsetHeight * 2,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
          width: clone.offsetWidth + "px",
          height: clone.offsetHeight + "px",
        },
      });

      // Remove clone
      document.body.removeChild(clone);

      // Download the image
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tiket-${order.kode_booking || order.kode_order}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset button
      if (button) {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }
    } catch (err) {
      console.error("Error downloading ticket:", err);
      alert(`Gagal mengunduh tiket: ${err.message}`);
      // Reset button on error
      if (button) {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-175 mx-auto my-container pt-5 md:pt-10">
        <h1 className="flex items-center gap-5">
          <Link to={-1} className="flex items-center">
            <img src={arrowLeftIcon} alt="icon" />
          </Link>
          Detail Tiket
        </h1>
        <p className="text-sm text-tx-light/75 mt-4">Loading...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-175 mx-auto my-container pt-5 md:pt-10">
        <h1 className="flex items-center gap-5">
          <Link to={-1} className="flex items-center">
            <img src={arrowLeftIcon} alt="icon" />
          </Link>
          Detail Tiket
        </h1>
        <p className="text-sm text-red-500 mt-4">Error: {error || "Order not found"}</p>
        <button onClick={fetchOrderDetail} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  const firstTicket = order.tikets[0];
  const orderStatus = order.status_order;
  const paymentStatus = order.pembayaran?.status_pembayaran || "PENDING";
  const isActive = orderStatus === "PAID" && paymentStatus === "SUCCESS";

  // Get film and studio data
  const filmData = firstTicket.jadwal.film || {};
  const studioData = firstTicket.jadwal.studio || {};
  const cabangData = studioData.cabang || {};
  const tipeStudioData = studioData.tipeStudio || {};

  // Transform for TicketDetailCard
  const cardData = {
    poster: filmData.poster_url || "/placeholder-poster.jpg",
    title: filmData.nama_film || "Film",
    cinema: cabangData.nama_cabang || "Cinema",
    studio_type: tipeStudioData.tipe_studio || "Studio",
    studio_number: `Studio ${studioData.no_studio || ""}`,
    date: new Date(firstTicket.jadwal.tanggal),
    start_time: firstTicket.jadwal.jam_mulai,
    payment_status: isActive ? 2 : orderStatus === "PENDING" ? 1 : 0,
  };

  return (
    <div className="max-w-175 mx-auto my-container pt-5 md:pt-10">
      <h1 className="flex items-center gap-5">
        <Link to={-1} className="flex items-center">
          <img src={arrowLeftIcon} alt="icon" />
        </Link>
        Detail Tiket
      </h1>

      <hr className="border-light/25 mt-4" />

      <section id="ticket-container" className="">
        <div className="">
          <TicketDetailCard data={cardData} />
        </div>

        <hr className="border-light/25" />

        <div className="p-5 flex justify-between items-center">
          {/* For PENDING orders - show VA info */}
          {orderStatus === "PENDING" ? (
            <div className="flex-1">
              <div className="space-y-3">
                {/* Virtual Account with Copy Button */}
                <div>
                  <p className="text-xs text-tx-light/75 mb-2">Nomor Virtual Account</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-tx-light font-mono bg-card-dark px-3 py-2 rounded-lg flex-1">{order.pembayaran?.nomor_va || order.pembayaran?.virtual_account || "-"}</p>
                    <button onClick={handleCopyVA} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                  <p className="text-xs text-tx-light/75">Metode Pembayaran</p>
                  <p className="text-xs text-tx-light">{order.pembayaran?.metodePembayaran?.metode_pembayaran || "N/A"}</p>
                  <p className="text-xs text-tx-light/75">{order.tikets.length} Tiket</p>
                  <p className="text-xs text-tx-light">
                    {order.tikets.map((t, i) => {
                      const kursiData = t.kursi || {};
                      return `${kursiData.row_kursi || ""}${kursiData.no_kursi || ""}${i < order.tikets.length - 1 ? ", " : ""}`;
                    })}
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-400 font-medium">Batas Waktu Pembayaran</p>
                    <p className="text-xs text-tx-light/75 mt-1">
                      {order.expired_at
                        ? new Date(order.expired_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400 font-mono">{countdown}</p>
                    <p className="text-[10px] text-tx-light/75">HH:MM:SS</p>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="mt-4">
                <button onClick={handleCancelOrder} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30">
                  Batalkan Pesanan
                </button>
              </div>
            </div>
          ) : orderStatus === "EXPIRED" || orderStatus === "CANCELLED" ? (
            /* For EXPIRED/CANCELLED orders - show minimal info */
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                <p className="text-xs text-tx-light/75">{order.tikets.length} Tiket</p>
                <p className="text-xs text-tx-light">
                  {order.tikets.map((t, i) => {
                    const kursiData = t.kursi || {};
                    return `${kursiData.row_kursi || ""}${kursiData.no_kursi || ""}${i < order.tikets.length - 1 ? ", " : ""}`;
                  })}
                </p>
                <p className="text-xs text-tx-light/75">Status</p>
                <p className="text-xs text-red-400 font-medium">{orderStatus === "EXPIRED" ? "Kadaluarsa" : "Dibatalkan"}</p>
              </div>
            </div>
          ) : (
            /* For PAID orders - show QR code above booking info */
            <div className="flex-1 flex flex-col items-center">
              {/* QR Code or Finished Icon - centered at top */}
              {isActive ? (
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG value={order.kode_booking || order.kode_order} size={200} level="H" includeMargin={false} />
                </div>
              ) : (
                <div className="mb-4">
                  <img src={finishedIcon} alt="" className="size-32" />
                </div>
              )}

              {/* Booking Info - below QR */}
              <div className="w-full grid grid-cols-2 gap-x-10 gap-y-2">
                <p className="text-xs text-tx-light/75">Kode Booking</p>
                <p className="text-xs text-tx-light">{order.kode_booking || order.kode_order}</p>
                <p className="text-xs text-tx-light/75">{order.tikets.length} Tiket</p>
                <p className="text-xs text-tx-light">
                  {order.tikets.map((t, i) => {
                    const kursiData = t.kursi || {};
                    return `${kursiData.row_kursi || ""}${kursiData.no_kursi || ""}${i < order.tikets.length - 1 ? ", " : ""}`;
                  })}
                </p>
              </div>

              {/* Instruction text */}
              {isActive && <p className="text-xs text-tx-light/75 text-center mt-4">Tunjukkan QR code ini kepada petugas</p>}
            </div>
          )}
        </div>

        <hr className="border-light/25" />

        <div className="p-5">
          <div className="flex justify-between mt-2">
            <p className="text-xs text-tx-light/75">Nomor Order</p>
            <p className="text-xs font-medium">{order.kode_order}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-tx-light/75">Waktu Order</p>
            <p className="text-xs font-medium">
              {new Date(order.waktu_order).toLocaleString("id-ID", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {order.pembayaran?.waktu_pembayaran && (
            <div className="flex justify-between mt-2">
              <p className="text-xs text-tx-light/75">Waktu Pembayaran</p>
              <p className="text-xs font-medium">
                {new Date(order.pembayaran.waktu_pembayaran).toLocaleString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <div className="flex justify-between mt-8">
            <p className="text-xs text-tx-light/75">Subtotal Tiket</p>
            <p className="text-xs font-medium">Rp{Number(order.total_harga).toLocaleString("id-ID")}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-tx-light/75">Biaya Layanan</p>
            <p className="text-xs font-medium">Rp{Number(order.biaya_layanan).toLocaleString("id-ID")}</p>
          </div>
          {order.pembayaran && (
            <div className="flex justify-between mt-2">
              <p className="text-xs text-tx-light/75">Metode Pembayaran</p>
              <p className="text-xs font-medium">{order.pembayaran.metodePembayaran?.metode_pembayaran || "N/A"}</p>
            </div>
          )}
          <div className="flex justify-between items-end mt-8">
            <p className="text-xs text-tx-light/75">Total Pembayaran</p>
            <p className="text-sm font-medium">Rp{Number(order.grand_total).toLocaleString("id-ID")}</p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 text-center">
            {orderStatus === "PAID" && <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">✓ Pembayaran Berhasil</span>}
            {orderStatus === "PENDING" && <span className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">⏳ Menunggu Pembayaran</span>}
            {orderStatus === "EXPIRED" && <span className="inline-block px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">✕ Kadaluarsa</span>}
            {orderStatus === "CANCELLED" && <span className="inline-block px-4 py-2 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">✕ Dibatalkan</span>}
          </div>

          {/* Download Button - only for PAID orders */}
          {orderStatus === "PAID" && (
            <div className="mt-4">
              <button
                onClick={handleDownloadTicket}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Unduh Tiket</span>
              </button>
            </div>
          )}
        </div>

        <hr className="border-light/25" />
      </section>
    </div>
  );
}

export default UserTicketDetail;
