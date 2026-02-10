// ICONS
import starOutlineIcon from "../../assets/icons/starOutlineIcon.svg";
import starFillIcon from "../../assets/icons/starFillIcon.svg";
import Button from "./Button";

// UTILS
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDuration } from "../../utils/formatDuration";
import { formatDateTime } from "../../utils/formatDateTime";
import { TICKET_STATUS } from "../../utils/ticketStatus";

export const MovieCard = ({ data, index, ...props }) => {
  // Check if movie is released or not
  const releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
  const today = new Date();
  const isReleased = releaseDate ? releaseDate <= today : true;

  // Format release date
  const formatReleaseDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  console.log(data);

  return (
    <Link to={`/movie/${data.id}`} className="relative rounded-myrad inline-block overflow-hidden aspect-2/3" {...props}>
      <img src={data.image} alt="poster" className="w-full h-full object-cover" />

      {index && (
        <div className="absolute top-3 left-3.5 ">
          <span className="text-4xl font-semibold">{index + 1}</span>
        </div>
      )}
      <div className="absolute top-3.5 right-3.5 rounded-full bg-dark/50 px-2 border border-light/50 text-[10px] py-0.5">
        <span className="font-medium opacity-75">{isReleased ? "Tayang" : formatReleaseDate(releaseDate)}</span>
      </div>

      <div className="absolute bottom-0 left-0 w-full text-xs px-3.5 pb-2 pt-5 space-x-2 bg-linear-to-t from-black to-black/0 text-tx-light/75 font-medium">
        <span>{formatDuration(data.duration)}</span>
        <span>{data.age}</span>
        <span>{data.genre[0]}</span>
      </div>
    </Link>
  );
};

export const CinemaCard = ({ data, ...props }) => {
  const [isFavorite, setIsFavorite] = useState(data.favorite | false);

  const handleFavorite = () => {
    setIsFavorite((fav) => !fav);
  };

  return (
    <div className="relative border-b border-light/25" {...props}>
      <Link to={`/cinema/${data.id}`} className="not-visited:w-full inline-block p-5 transition hover:bg-card-dark rounded-myrad">
        <p className="text-sm md:text-base font-bold">{data.name}</p>
        <p className="text-[10px] md:text-xs text-tx-light/75 mr-5">{data.address}</p>

        <div className="text-xs text-tx-light/75 font-medium flex gap-2 mt-4 md:mt-6">
          {data.studio_type.map((st, index) => (
            <p className="space-x-2" key={index}>
              <span>{st}</span>
              {index < data.studio_type.length - 1 && <span>|</span>}
            </p>
          ))}
        </div>
      </Link>

      <img src={isFavorite ? starFillIcon : starOutlineIcon} alt="favorite" className="w-3.5 absolute top-5 right-5 cursor-pointer" onClick={handleFavorite} />
    </div>
  );
};

export const CinemaScheduleCard = ({ data, ...props }) => {
  return (
    <div className="relative border-t border-light/25" {...props}>
      <div className="rounded-myrad p-5 pb-12">
        <div className="space-y-5">
          <div className="flex">
            <p className="text-sm md:text-base font-semibold cursor-pointer">Summarecon Mall Bandung</p>
          </div>

          {data.map((j, index) => (
            <div className="" key={index}>
              <p className="text-xs md:text-sm text-tx-light/75 font-semibold">{j.studio_type}</p>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {j.start_time.map((st, index) => (
                  <span className="border text-center py-3 rounded-myrad text-xs md:text-sm font-bold  border-light/25 cursor-pointer" key={index}>
                    {st}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <img src={starOutlineIcon} alt="" className="absolute top-6 right-5 cursor-pointer" />
    </div>
  );
};

export const MovieScheduleCard = ({ data, ...props }) => {
  return (
    <div className="p-5 pb-10 space-y-5 border-t border-light/25" {...props}>
      <div className="flex gap-x-5">
        <div className="">
          <img src={data.poster} alt={data.title} className="aspect-2/3 w-20 object-cover rounded-myrad border border-light/25" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm md:text-base font-semibold">{data.title}</p>
          <div className="mt-2 flex gap-x-2 text-[11px] md:text-xs">
            {(Array.isArray(data.genre) ? data.genre : data.genre?.split(",").map((g) => g.trim())).map((g, index) => (
              <p className="space-x-2" key={index}>
                <span>{g}</span>
                {index < data.genre.length - 1 && <span>·</span>}
              </p>
            ))}
          </div>
          <p className="mt-1 text-[11px] md:text-xs">{formatDuration(data.duration)}</p>
          <p className="mt-1 text-[11px] md:text-xs">{data.age}</p>
        </div>
      </div>

      <div className="space-y-5">
        {data.schedule.map((sc, index) => (
          <div className="" key={index}>
            <div className="flex justify-between items-end">
              <p className="text-xs md:text-sm font-medium">{sc.studio_type}</p>
              <p className="text-[11px] md:text-xs text-tx-light/75">Rp{sc.price.toLocaleString("id-ID")}</p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-2 md:mt-3">
              {sc.start_time.map((st, index) => (
                <span className={`border border-light/25 text-center rounded-myrad py-3 text-xs font-bold cursor-pointer`} key={index}>
                  {st}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CastCard = ({ data, ...props }) => {
  return (
    <div className="w-24 md:w-28 shrink-0" {...props}>
      {data.image ? (
        <img src={data.image} className="size-22 md:size-25 mx-auto aspect-auto rounded-full object-cover" />
      ) : (
        <div className="size-22 mx-auto aspect-square rounded-full flex justify-center items-center bg-[#9FA5B1] text-4xl font-semibold">AM</div>
      )}
      <div className="text-center mt-2">
        <p className="text-xs">{data.name}</p>
        <p className="text-[11px] text-tx-light/75 mt-0.5">{data.role}</p>
      </div>
    </div>
  );
};

export const TicketCard = ({ data, ...props }) => {
  // Map backend order data to component format
  const firstTicket = data.tikets?.[0];
  if (!firstTicket) return null;

  const orderStatus = data.status_order; // PENDING, PAID, EXPIRED, CANCELLED
  const paymentStatus = data.pembayaran?.status_pembayaran || "PENDING"; // PENDING, SUCCESS, FAILED

  // Determine display status
  let statusDisplay = { label: "Menunggu Pembayaran", className: "text-yellow-400" };
  if (orderStatus === "PAID" && paymentStatus === "SUCCESS") {
    statusDisplay = { label: "Aktif", className: "text-green-400" };
  } else if (orderStatus === "EXPIRED") {
    statusDisplay = { label: "Kadaluarsa", className: "text-red-400" };
  } else if (orderStatus === "CANCELLED") {
    statusDisplay = { label: "Dibatalkan", className: "text-gray-400" };
  } else if (paymentStatus === "FAILED") {
    statusDisplay = { label: "Gagal", className: "text-red-400" };
  }

  const scheduleDate = new Date(firstTicket.jadwal.tanggal);
  const scheduleTime = firstTicket.jadwal.jam_mulai;

  // Get film data - handle both nested and direct structure
  const filmData = firstTicket.jadwal.film || {};
  const studioData = firstTicket.jadwal.studio || {};
  const cabangData = studioData.cabang || {};

  return (
    <Link to={`/ticket/${data.id_order}`} className="border-t border-light/25 flex gap-x-5 p-5" {...props}>
      <div className="">
        <img src={filmData.poster_url || "/placeholder-poster.jpg"} alt={filmData.nama_film || "Film"} className="w-23 aspect-2/3 rounded-myrad object-cover" />
      </div>
      <div className="">
        <p className="text-sm font-semibold">{filmData.nama_film || "Film"}</p>
        <p className="text-[11px] text-tx-light/75 mt-2">{cabangData.nama_cabang || "Cinema"}</p>
        <p className="text-[11px] text-tx-light/75">Tiket ({data.tikets?.length || 0})</p>
        <p className="text-[11px] text-tx-light/75">{formatDateTime(scheduleDate, scheduleTime)}</p>
        <p className={`text-[11px] font-medium mt-4 ${statusDisplay.className}`}>{statusDisplay.label}</p>
      </div>
    </Link>
  );
};

export const TicketDetailCard = ({ data, ...props }) => {
  const paymentStatus = TICKET_STATUS[data.payment_status];

  return (
    <div className="flex gap-x-5 p-5" {...props}>
      <div className="">
        <img src={data.poster} alt="" className="w-23 aspect-2/3 rounded-myrad object-cover" />
      </div>
      <div className="">
        <p className="text-sm font-semibold">{data.title}</p>
        <p className="text-[11px] text-tx-light/75 mt-2">{data.cinema}</p>
        <p className="text-[11px] text-tx-light/75">
          {data.studio_type}, {data.studio_number}
        </p>
        <p className="text-[11px] text-tx-light/75">{formatDateTime(data.date, data.start_time)}</p>
        <p className={`text-[11px] font-medium mt-4 ${paymentStatus.className}`}>{paymentStatus.label}</p>
      </div>
    </div>
  );
};

export const SeatSelectionCard = ({ data, selected = [], onClick, ...props }) => {
  return (
    <div className="mx-auto max-w-sm p-5 space-y-5 bg-card-dark rounded-[20px]" {...props}>
      <div className="">
        <div className="">
          <p className="text-sm font-medium text-tx-light/75">Nomor Kursi</p>
          <div className="flex gap-2 mt-2 min-h-8 flex-wrap">
            {selected.map((s) => (
              <button className="w-9 h-8 bg-primary rounded text-xs font-semibold" disabled={true} key={s.seat_id}>
                {s.row}
                {s.number}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-5">
          <p className="text-sm font-medium text-tx-light/75">Total Harga</p>
          <p className="font-medium">Rp{(data.price * selected.length).toLocaleString("id-ID")}</p>
        </div>
      </div>

      <hr className="border-light/25" />

      <div className="flex gap-x-5 items-center">
        <div className="">
          <img src={data.poster} alt="" className="w-20 aspect-2/3 rounded-myrad object-cover" />
        </div>
        <div className="">
          <p className="text-sm font-semibold">{data.title}</p>
          <p className="text-[11px] text-tx-light/75 mt-2">{data.cinema}</p>
          <p className="text-[11px] text-tx-light/75">{data.studio_type}</p>
          <p className="text-[11px] text-tx-light/75">{formatDateTime(data.date, data.start_time)}</p>
        </div>
      </div>

      <Button classname={"w-full"} onClick={onClick}>
        Lanjut Transaksi
      </Button>
    </div>
  );
};

export const OrderSummaryCard = ({ data, onClick, disabled, ...props }) => {
  const subtotal = data.price * data.seats.length;
  const totalWithFee = subtotal + data.fee; // Fee is per order, not per ticket

  return (
    <div className="mx-auto max-w-sm lg:w-sm p-5 space-y-5 bg-card-dark rounded-[20px]" {...props}>
      <div className="">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-tx-light/75">{data.seats.length} Tiket</p>
          <p className="text-sm font-medium text-tx-light">{data.seats.map((s, index) => s.row + s.number + (index < data.seats.length - 1 ? ", " : ""))}</p>
        </div>
        <div className="flex justify-between mt-5">
          <p className="text-sm font-medium text-tx-light/75">Tiket {data.studio_type}</p>
          <p className="text-sm font-medium text-tx-light">
            Rp{data.price.toLocaleString("id-ID")} <span className="text-tx-light/75 font-light">x {data.seats.length}</span>
          </p>
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-sm font-medium text-tx-light/75">Biaya Layanan</p>
          <p className="text-sm font-medium text-tx-light">Rp{data.fee.toLocaleString("id-ID")}</p>
        </div>
        <div className="flex justify-between mt-5">
          <p className="text-sm font-medium text-tx-light/75">Total Harga</p>
          <p className="font-medium">Rp{totalWithFee.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <hr className="border-light/25" />

      <div className="flex gap-x-5 items-center">
        <div className="">
          <img src={data.poster} alt="" className="w-20 aspect-2/3 rounded-myrad object-cover" />
        </div>
        <div className="">
          <p className="text-sm font-semibold">{data.title}</p>
          <p className="text-[11px] text-tx-light/75 mt-2">{data.cinema}</p>
          <p className="text-[11px] text-tx-light/75">{data.studio_type}</p>
          <p className="text-[11px] text-tx-light/75">{formatDateTime(data.date, data.start_time)}</p>
        </div>
      </div>

      <Button classname={"w-full"} onClick={onClick} disabled={disabled}>
        {disabled ? "Memproses..." : "Lanjut Transaksi"}
      </Button>
    </div>
  );
};
