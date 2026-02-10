import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import HeroMovie from "../../components/user/HeroMovie";
import { DateSlider } from "../../components/user/DateSlider";
import { SearchFilter } from "../../components/ui/Search";
import CinemaScheduleCard from "../../components/user/CinemaScheduleCard";
import MovieDetail from "../../components/layout/user/MovieDetail";

// Services
import movieService from "../../services/movieService";
import scheduleService from "../../services/scheduleService";

function UserMovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActive, setTabActive] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchMovieDetail();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchSchedules();
    }
  }, [id, selectedDate]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      const response = await movieService.getById(id);

      // Transform for components
      const movieData = {
        id: response.data.id,
        title: response.data.title,
        thumbnail: response.data.thumbnail,
        logo: response.data.logo,
        poster: response.data.thumbnail,
        trailer: response.data.trailer,
        genre: response.data.genres?.join(", ") || "",
        age: response.data.ageRating,
        ageRating: response.data.ageRating,
        duration: response.data.duration,
        synopsis: response.data.synopsis,
        releaseDate: response.data.releaseDate,
        cast: response.data.cast || [],
        crew: response.data.crew || [],
        production: response.data.production || null,
      };

      setData(movieData);
    } catch (err) {
      setError(err.message || "Failed to load movie details");
      console.error("Error fetching movie:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await scheduleService.getAll({
        id_film: id,
        tanggal: dateStr,
      });

      // Group schedules by cinema (cabang)
      const groupedSchedules = {};

      response.data.forEach((schedule) => {
        const cinemaId = schedule.studio.cabang.id_cabang;
        const cinemaName = schedule.studio.cabang.nama_cabang;
        const studioType = schedule.studio.tipeStudio.nama_tipe;

        if (!groupedSchedules[cinemaId]) {
          groupedSchedules[cinemaId] = {
            id: cinemaId,
            name: cinemaName,
            studioTypes: {},
          };
        }

        if (!groupedSchedules[cinemaId].studioTypes[studioType]) {
          groupedSchedules[cinemaId].studioTypes[studioType] = [];
        }

        groupedSchedules[cinemaId].studioTypes[studioType].push({
          id: schedule.id,
          time: schedule.startTime,
          price: schedule.price,
          available: schedule.seatAvailability?.available || 0,
        });
      });

      setSchedules(Object.values(groupedSchedules));
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleTimeSelect = (scheduleId) => {
    navigate(`/seat-selection/${scheduleId}`);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading movie details</p>
          <p className="text-tx-light/50 text-sm">{error}</p>
          <button onClick={fetchMovieDetail} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="w-full h-[80dvh] md:h-auto md:aspect-video">
        <HeroMovie data={data} isActive={true} detail={true} />
      </section>

      <div className="max-w-175 mx-auto mt-13 md:mt-10">
        <div className="my-container space-y-3">
          <p className="text-lg font-semibold space-x-6">
            <span className={`cursor-pointer ${tabActive == 0 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(0)}>
              Jadwal
            </span>
            <span className={`cursor-pointer ${tabActive == 1 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(1)}>
              Detail
            </span>
          </p>
          <hr className="border-light/25" />
        </div>

        {tabActive == 0 && (
          <section id="" className="my-container py-5 space-y-5 md:space-y-6">
            <DateSlider selectedDate={selectedDate} onDateChange={handleDateChange} />

            <SearchFilter searchValue={searchValue} filterValue={filterValue} onSearchValue={setSearchValue} onFilterValue={setFilterValue} />

            <div className="">
              {schedules.length > 0 ? (
                schedules
                  .filter((cinema) => !searchValue || cinema.name.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((cinema) => <CinemaScheduleCard key={cinema.id} cinema={cinema} onTimeSelect={handleTimeSelect} />)
              ) : (
                <div className="text-center py-10 text-tx-light/50">
                  <p>Tidak ada jadwal tersedia untuk tanggal ini</p>
                </div>
              )}
            </div>
          </section>
        )}

        {tabActive == 1 && <MovieDetail data={data} />}
      </div>
    </>
  );
}

export default UserMovieDetail;
