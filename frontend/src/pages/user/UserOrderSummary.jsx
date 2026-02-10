import { Link, useNavigate, useLocation } from "react-router-dom";
import arrowLeftIcon from "../../assets/icons/arrowLeftIcon.svg";
import { OrderSummaryCard } from "../../components/ui/Card";
import { useState, useEffect } from "react";
import { getPaymentMethods, createOrder, processPayment } from "../../services/ticketService";

function UserOrderSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { schedule, selectedSeats } = location.state || {};

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    if (!schedule || !selectedSeats) {
      navigate("/");
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        console.log("Payment Methods Response:", response);
        if (response.success) {
          setPaymentMethods(response.data);
          console.log("Payment Methods Data:", response.data);
          // Auto select first one if available
          if (response.data.length > 0) {
            setSelectedPaymentId(response.data[0].id_metode_pembayaran);
          }
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError("Gagal memuat metode pembayaran");
      }
    };

    fetchPaymentMethods();

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Waktu pembayaran habis");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule, selectedSeats, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCheckout = async () => {
    if (!selectedPaymentId) {
      setError("Pilih metode pembayaran");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("=== CHECKOUT DEBUG ===");
      console.log("Schedule:", schedule);
      console.log("Selected Seats:", selectedSeats);
      console.log("Selected Payment ID:", selectedPaymentId);

      // 1. Create Order
      const orderData = {
        tickets: selectedSeats.map((seat) => ({
          id_jadwal: schedule.id,
          id_kursi: seat.seat_id,
        })),
      };

      console.log("Order Data:", orderData);

      const orderResponse = await createOrder(orderData);
      console.log("Order Response:", orderResponse);

      if (orderResponse.success) {
        const orderId = orderResponse.data.id_order;

        // 2. Process Payment (Initiate)
        const paymentResponse = await processPayment({
          id_order: orderId,
          id_metode_pembayaran: selectedPaymentId,
        });

        console.log("Payment Response:", paymentResponse);

        if (paymentResponse.success) {
          // 3. Navigate to Payment Page with transaction details
          navigate("/payment", {
            state: {
              paymentData: paymentResponse.data,
              orderId: orderId,
            },
          });
        } else {
          setError(paymentResponse.message || "Gagal memproses pembayaran");
        }
      } else {
        setError(orderResponse.message || "Gagal membuat pesanan");
      }
    } catch (err) {
      console.error("=== CHECKOUT ERROR ===");
      console.error("Error:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      let errorMessage = "Terjadi kesalahan saat checkout";

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || err.response.statusText || errorMessage;
        console.error("Server error status:", err.response.status);
        console.error("Server error data:", err.response.data);
      } else if (err.request) {
        // Request made but no response
        errorMessage = "Tidak dapat terhubung ke server";
        console.error("No response received");
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!schedule || !selectedSeats) return null;

  // Format data for OrderSummaryCard
  const summaryData = {
    seats: selectedSeats,
    studio_type: schedule.studio.tipeStudio.nama_tipe,
    price: schedule.price,
    fee: 2500, // Backend uses 2500 per order (not per ticket)
    title: schedule.film.title,
    cinema: schedule.studio.cabang.nama_cabang,
    date: new Date(schedule.date),
    start_time: schedule.startTime,
    poster: schedule.film.poster,
  };

  return (
    <div className="max-w-300 mx-auto pt-5 lg:pt-10 flex flex-col items-center  lg:items-start lg:flex-row lg:justify-center lg:gap-x-8">
      <div className="w-full">
        <h1 className=" my-container flex items-center gap-5">
          <Link to={-1} className="flex items-center">
            <img src={arrowLeftIcon} alt="icon" />
          </Link>
          Ringkasan Order
        </h1>

        <div className="my-container ">
          <div className="bg-light/25 text-center text-sm py-5 rounded-myrad border border-light/25 mt-5 text-[#FF7B7B]">Selesaikan pembayaran anda dalam {formatTime(timeLeft)}</div>

          {error && <div className="bg-red-500/20 text-red-200 text-center text-sm py-3 rounded-myrad mt-4 border border-red-500/50">{error}</div>}
        </div>

        <div className="my-container mt-6 md:mt-8 md:flex gap-x-10 space-y-10">
          <div className="md:flex-1">
            <h2 className="text-sm font-semibold">Metode Pembayaran</h2>
            {paymentMethods.length === 0 ? (
              <div className="mt-4 p-5 bg-card-dark/50 rounded-myrad text-center text-tx-light/50">
                <p>Memuat metode pembayaran...</p>
              </div>
            ) : (
              <ul className="flex flex-col mt-4">
                {paymentMethods.map((pm, index) => (
                  <li className="" key={pm.id_metode_pembayaran}>
                    <label
                      htmlFor={`pm-${pm.id_metode_pembayaran}`}
                      className={`flex justify-between items-center gap-5 p-5 cursor-pointer rounded-myrad transition-colors ${selectedPaymentId === pm.id_metode_pembayaran ? "bg-card-dark border border-primary" : "hover:bg-card-dark/50"}`}
                    >
                      <div className="flex gap-5 items-center text-sm font-medium">
                        <div className="w-15 h-10 px-2 rounded-[7px] flex justify-center items-center bg-white">
                          {/* Assuming image path handling or placeholder */}
                          <img
                            src={`http://localhost:3000${pm.image}`}
                            alt={pm.metode_pembayaran}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className="max-w-full max-h-full object-contain"
                          />
                          <span className="text-black text-xs" style={{ display: "none" }}>
                            {pm.metode_pembayaran}
                          </span>
                        </div>
                        {pm.metode_pembayaran}
                      </div>
                      <input
                        type="radio"
                        name="payment_method"
                        id={`pm-${pm.id_metode_pembayaran}`}
                        checked={selectedPaymentId === pm.id_metode_pembayaran}
                        onChange={() => setSelectedPaymentId(pm.id_metode_pembayaran)}
                      />
                    </label>
                    {index < paymentMethods.length - 1 && <hr className="border-light/25 my-2" />}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="">
            <OrderSummaryCard data={summaryData} onClick={handleCheckout} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserOrderSummary;
