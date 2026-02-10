import screenLine from "../../assets/images/screenLine.svg";
import arrowLeftIcon from "../../assets/icons/arrowLeftIcon.svg";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SeatsLayout } from "../../components/user/SeatsLayout";
import { SeatSelectionCard } from "../../components/ui/Card";
import { useState, useEffect } from "react";
import scheduleService from "../../services/scheduleService";

function UserSeatSelection() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await scheduleService.getById(scheduleId);

        if (response.success && response.data) {
          const scheduleData = response.data;
          setSchedule(scheduleData);

          console.log("Schedule Data:", scheduleData);

          // Check if studio and kursis exist
          if (!scheduleData.studio || !scheduleData.studio.kursis) {
            console.error("Studio or kursis data missing:", scheduleData);
            setSeats([]);
            return;
          }

          // Create a map of seat status from statusKursis
          const seatStatusMap = {};
          if (scheduleData.statusKursis && Array.isArray(scheduleData.statusKursis)) {
            scheduleData.statusKursis.forEach((statusKursi) => {
              // status_kursi: "TERSEDIA" | "DIPESAN" | "TERJUAL"
              // Map to: 0 = available, 1 = occupied
              const isOccupied = statusKursi.status_kursi !== "TERSEDIA";
              seatStatusMap[statusKursi.id_kursi] = isOccupied ? 1 : 0;
            });
          }

          console.log("Seat Status Map:", seatStatusMap);

          // Map seats data for SeatsLayout with actual status
          const mappedSeats = scheduleData.studio.kursis.map((kursi) => {
            const status = seatStatusMap[kursi.id_kursi] !== undefined ? seatStatusMap[kursi.id_kursi] : 0;
            return {
              seat_id: kursi.id_kursi,
              row: kursi.row_kursi,
              number: kursi.no_kursi,
              status: status, // 0 = available, 1 = occupied
            };
          });

          console.log("Mapped Seats:", mappedSeats);
          console.log("Available seats:", mappedSeats.filter((s) => s.status === 0).length);
          console.log("Occupied seats:", mappedSeats.filter((s) => s.status === 1).length);

          setSeats(mappedSeats);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  function handleSelect(seat) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.seat_id === seat.seat_id);
      if (exists) {
        return prev.filter((s) => s.seat_id !== seat.seat_id);
      } else {
        // Limit max selection if needed (e.g. 6 seats)
        if (prev.length >= 6) {
          alert("Maksimal pilih 6 kursi");
          return prev;
        }
        return [...prev, seat];
      }
    });
  }

  const handleProceed = () => {
    if (selected.length === 0) {
      alert("Silakan pilih minimal 1 kursi");
      return;
    }

    // Navigate to order summary with selected data
    navigate("/ordersummary", {
      state: {
        schedule,
        selectedSeats: selected,
      },
    });
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading...</div>;
  }

  if (!schedule) {
    return <div className="text-center py-20 text-white">Jadwal tidak ditemukan</div>;
  }

  // Format data for SeatSelectionCard
  const cardData = {
    title: schedule.film.title,
    studio: schedule.studio.tipeStudio.nama_tipe,
    price: schedule.price,
    time: `${schedule.startTime} - ${schedule.endTime}`,
    date: new Date(schedule.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    cinema: schedule.studio.cabang.nama_cabang,
    studio_type: schedule.studio.tipeStudio.nama_tipe,
    start_time: schedule.startTime,
    poster: schedule.film.poster,
  };

  return (
    <div className="max-w-300 mx-auto pt-5 lg:pt-10 flex flex-col items-center  lg:items-start lg:flex-row lg:justify-center lg:gap-x-8">
      <div className="">
        <h1 className=" my-container flex items-center gap-5">
          <Link to={-1} className="flex items-center">
            <img src={arrowLeftIcon} alt="icon" />
          </Link>
          Pilih Kursi
        </h1>

        <div className="max-w-dvw mt-4 mx-auto">
          <div className="overflow-x-auto px-4.5 lg:px-0">
            <div className="w-2xl">
              <img src={screenLine} alt="" className="" />
              <p className="text-xs text-center -mt-4">LAYAR BIOSKOP</p>
            </div>

            <div className="mt-16">
              <SeatsLayout seats={seats} scheduleId={schedule.id} selected={selected} onSelect={handleSelect} />
            </div>
          </div>
        </div>
        <div className="text-xs flex gap-x-8 justify-center mt-8">
          <div className="flex items-center gap-x-2">
            <span className="size-6 inline-block bg-light/50 opacity-50 rounded"></span>
            <span>Terisi</span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="size-6 inline-block bg-[#273e7b] rounded"></span>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="size-6 inline-block bg-[#396eff] rounded"></span>
            <span>Pilihanmu</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4.5 lg:px-0 mt-8">
        <SeatSelectionCard data={cardData} selected={selected} onClick={handleProceed} />
      </div>
    </div>
  );
}

export default UserSeatSelection;
