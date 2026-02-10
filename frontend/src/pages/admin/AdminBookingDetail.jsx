import { Link, useParams } from "react-router-dom";

export default function AdminBookingDetail() {
  const { id } = useParams();

  // Mock booking data
  const booking = {
    id: 1,
    booking_code: "BK20260122001",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "081234567890",
    movie_title: "Avatar Fire and Ash",
    cinema_name: "Summarecon Mall Bandung XX2",
    studio: "Studio 1",
    studio_type: "Regular",
    date: "2026-01-25",
    time: "14:00",
    seats: ["A1", "A2", "A3"],
    total_seats: 3,
    price_per_seat: 50000,
    total_price: 150000,
    payment_method: "Credit Card",
    payment_status: "paid",
    ticket_status: "active",
    booking_date: "2026-01-22 10:30:00",
  };

  const getPaymentStatusBadge = (status) => {
    const styles = {
      paid: "bg-green-500/20 text-green-500",
      pending: "bg-yellow-500/20 text-yellow-500",
      failed: "bg-red-500/20 text-red-500",
    };
    return styles[status] || styles.pending;
  };

  const getTicketStatusBadge = (status) => {
    const styles = {
      active: "bg-green-500/20 text-green-500",
      used: "bg-gray-500/20 text-gray-600",
      cancelled: "bg-red-500/20 text-red-500",
      expired: "bg-orange-500/20 text-orange-500",
    };
    return styles[status] || styles.active;
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/bookings" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Bookings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-950 text-2xl font-bold">Booking Detail</h1>
            <p className="text-sm text-gray-600 mt-1">Booking Code: {booking.booking_code}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPaymentStatusBadge(booking.payment_status)}`}>
              {booking.payment_status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getTicketStatusBadge(booking.ticket_status)}`}>
              {booking.ticket_status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-gray-950 text-lg font-bold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-gray-950 font-medium">{booking.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-950 font-medium">{booking.customer_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-950 font-medium">{booking.customer_phone}</p>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-gray-950 text-lg font-bold mb-4">Booking Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Booking Date</p>
              <p className="text-gray-950 font-medium">{booking.booking_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-gray-950 font-medium">{booking.payment_method}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movie & Schedule Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-gray-950 text-lg font-bold mb-4">Movie & Schedule</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Movie</p>
              <p className="text-gray-950 font-medium text-lg">{booking.movie_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cinema</p>
              <p className="text-gray-950 font-medium">{booking.cinema_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Studio</p>
              <p className="text-gray-950 font-medium">
                {booking.studio} ({booking.studio_type})
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-gray-950 font-medium">{booking.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-gray-950 font-medium">{booking.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat & Payment Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-gray-950 text-lg font-bold mb-4">Seat & Payment</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Selected Seats</p>
            <div className="flex gap-2 flex-wrap">
              {booking.seats.map((seat) => (
                <span key={seat} className="px-3 py-1 bg-primary/20 text-primary rounded font-medium">
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Price per Seat</span>
              <span className="font-medium">Rp {booking.price_per_seat.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Total Seats</span>
              <span className="font-medium">{booking.total_seats} seats</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total Payment</span>
              <span className="text-primary">Rp {booking.total_price.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-gray-950 text-lg font-bold mb-4">Actions</h2>
        <div className="flex gap-3">
          {booking.ticket_status === "active" && (
            <>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors">
                Mark as Used
              </button>
              <button className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors">
                Cancel Booking
              </button>
            </>
          )}
          <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Send Email Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
