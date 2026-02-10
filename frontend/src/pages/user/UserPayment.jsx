import { Link, useLocation, useNavigate } from "react-router-dom";
import arrowLeftIcon from "../../assets/icons/arrowLeftIcon.svg";
import qrcodeIcon from "../../assets/icons/qrcode.svg";
import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { confirmPayment } from "../../services/ticketService";

function UserPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData, orderId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds (same as order summary)

  useEffect(() => {
    if (!paymentData || !orderId) {
      navigate("/");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to tickets page when time expires
          navigate("/tickets");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData, orderId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await confirmPayment(paymentData.id_pembayaran);

      if (response.success) {
        // Navigate to tickets page with success message
        navigate("/tickets", {
          state: {
            message: "Pembayaran berhasil! Tiket Anda sudah aktif.",
          },
        });
      } else {
        setError(response.message || "Gagal mengkonfirmasi pembayaran");
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setError(err.message || "Terjadi kesalahan saat mengkonfirmasi pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    // Create a simple QR code download (placeholder)
    const qrData = paymentData?.kode_qr || paymentData?.nomor_va || `ORDER-${orderId}`;
    alert(`QR Code: ${qrData}\n\nFitur download akan segera tersedia.`);
  };

  if (!paymentData) return null;

  const paymentMethod = paymentData.metodePembayaran;
  const totalPayment = paymentData.jumlah_dibayar;
  const isQRPayment = paymentData.kode_qr !== null;
  const isVAPayment = paymentData.nomor_va !== null;

  return (
    <div className="max-w-300 mx-auto pt-5 lg:pt-10 flex flex-col items-center  lg:items-start lg:flex-row lg:justify-center lg:gap-x-8">
      <div className="w-full">
        <h1 className=" my-container flex items-center gap-5">
          <Link to={"/tickets"} className="flex items-center">
            <img src={arrowLeftIcon} alt="icon" />
          </Link>
          Menunggu Pembayaran
        </h1>

        <div className="my-container ">
          <div className="bg-light/25 text-center text-sm py-5 rounded-myrad border border-light/25 mt-5 text-[#FF7B7B]">Selesaikan pembayaran anda dalam {formatTime(timeLeft)}</div>

          {error && <div className="bg-red-500/20 text-red-200 text-center text-sm py-3 rounded-myrad mt-4 border border-red-500/50">{error}</div>}

          <div className="space-y-8 md:flex md:gap-x-10 mt-6 md:mt-8">
            <div className="flex-1 bg-light rounded-myrad flex flex-col items-center py-10">
              <div className="w-15 h-10 px-2 rounded-[7px] flex justify-center items-center bg-white mb-4">
                <img
                  src={`http://localhost:3000${paymentMethod.image}`}
                  alt={paymentMethod.metode_pembayaran}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <p className="text-tx-dark/75 text-sm mt-2.5">
                Total Pembayaran: <span className="text-tx-dark font-medium">Rp{totalPayment.toLocaleString("id-ID")}</span>
              </p>

              {isQRPayment && (
                <>
                  <div className="max-w-50 mt-4 bg-white p-4 rounded-lg">
                    <img src={qrcodeIcon} alt="QR Code" className="w-full" />
                    <p className="text-xs text-center text-tx-dark mt-2">{paymentData.kode_qr}</p>
                  </div>
                  <Button variant="dark" size="sm" classname={"mt-6"} onClick={handleDownloadQR}>
                    Unduh kode QR
                  </Button>
                </>
              )}

              {isVAPayment && (
                <div className="mt-4 bg-white p-4 rounded-lg w-full max-w-md">
                  <p className="text-xs text-tx-dark/75 text-center">Nomor Virtual Account</p>
                  <p className="text-lg font-bold text-tx-dark text-center mt-2 tracking-wider">{paymentData.nomor_va}</p>
                  <Button
                    variant="dark"
                    size="sm"
                    classname={"mt-4 w-full"}
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.nomor_va);
                      alert("Nomor VA berhasil disalin!");
                    }}
                  >
                    Salin Nomor VA
                  </Button>
                </div>
              )}

              {/* Simulate Payment Button (for testing) */}
              <Button variant="primary" size="sm" classname={"mt-6"} onClick={handleConfirmPayment} disabled={loading}>
                {loading ? "Memproses..." : "Simulasi Pembayaran Berhasil"}
              </Button>
              <p className="text-xs text-tx-dark/50 mt-2 text-center">(Klik tombol ini untuk simulasi pembayaran berhasil)</p>
            </div>

            <div className="flex-1">
              <h2 className="font-medium">Cara Pembayaran</h2>
              <ol className="text-sm mt-2 list-decimal list-inside space-y-2">
                {isQRPayment && (
                  <>
                    <li>Buka aplikasi mobile banking atau e-wallet Anda</li>
                    <li>Pilih menu Scan QR atau QRIS</li>
                    <li>Scan kode QR yang ditampilkan di layar</li>
                    <li>Periksa detail pembayaran dan konfirmasi</li>
                    <li>Pembayaran akan otomatis terverifikasi</li>
                  </>
                )}
                {isVAPayment && (
                  <>
                    <li>Buka aplikasi mobile banking atau ATM</li>
                    <li>Pilih menu Transfer atau Bayar</li>
                    <li>Pilih bank {paymentMethod.metode_pembayaran}</li>
                    <li>Masukkan nomor Virtual Account yang tertera</li>
                    <li>Periksa detail pembayaran dan konfirmasi</li>
                    <li>Simpan bukti pembayaran Anda</li>
                  </>
                )}
                {!isQRPayment && !isVAPayment && (
                  <>
                    <li>Ikuti instruksi pembayaran dari {paymentMethod.metode_pembayaran}</li>
                    <li>Selesaikan pembayaran sebelum waktu habis</li>
                    <li>Tiket akan otomatis aktif setelah pembayaran berhasil</li>
                  </>
                )}
              </ol>

              <div className="mt-6 p-4 bg-card-dark rounded-myrad">
                <h3 className="text-sm font-medium mb-2">Informasi Penting</h3>
                <ul className="text-xs space-y-1 text-tx-light/75">
                  <li>• Pembayaran harus diselesaikan dalam waktu yang ditentukan</li>
                  <li>• Setelah pembayaran berhasil, tiket akan otomatis aktif</li>
                  <li>• Anda dapat melihat tiket di menu "Tiket Saya"</li>
                  <li>• Simpan bukti pembayaran untuk keperluan klaim</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPayment;
