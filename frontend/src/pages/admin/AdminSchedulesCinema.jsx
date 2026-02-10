import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import scheduleService from "../../services/scheduleService";
import cinemaService from "../../services/cinemaService";
import movieService from "../../services/movieService";

export default function AdminSchedulesCinema() {
  const { cinemaId } = useParams();

  const [cinema, setCinema] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterMovie, setFilterMovie] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterStudio, setFilterStudio] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date, time, movie

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cinema info
      const cinemaResponse = await cinemaService.getById(cinemaId);
      setCinema(cinemaResponse.data);

      // Fetch schedules for this cinema
      const schedulesResponse = await scheduleService.getAll({ id_cabang: cinemaId });
      setSchedules(schedulesResponse.data || []);

      // Fetch all movies for filter dropdown
      const moviesResponse = await movieService.getAll();
      setMovies(moviesResponse.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch schedules");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  }, [cinemaId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesMovie = filterMovie === "all" || schedule.film?.id_film === parseInt(filterMovie);

    // Format schedule date to YYYY-MM-DD for comparison
    let scheduleDate = "";
    if (schedule.date) {
      try {
        const date = new Date(schedule.date);
        scheduleDate = date.toISOString().split("T")[0];
      } catch (e) {
        scheduleDate = schedule.date;
      }
    }

    const matchesDate = !filterDate || scheduleDate === filterDate;
    const matchesStudio = filterStudio === "all" || schedule.studio?.id === parseInt(filterStudio);

    return matchesMovie && matchesDate && matchesStudio;
  });

  // Sort schedules
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    if (sortBy === "date") {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      // If same date, sort by time
      return a.startTime.localeCompare(b.startTime);
    } else if (sortBy === "time") {
      return a.startTime.localeCompare(b.startTime);
    } else if (sortBy === "movie") {
      return (a.film?.title || "").localeCompare(b.film?.title || "");
    }
    return 0;
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        await scheduleService.delete(id);
        await fetchSchedules(); // Refresh list
      } catch (err) {
        alert(`Failed to delete schedule: ${err.message}`);
        console.error("Error deleting schedule:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchSchedules} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/admin/schedules" className="text-gray-600 hover:text-gray-950 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" />
          </svg>{" "}
          Back to Schedules
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-950 text-2xl font-bold">{cinema?.name} - Schedules</h1>
          <p className="text-sm text-gray-600 mt-1">{cinema?.address}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/admin/schedules/cinema/${cinemaId}/bulk`} className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors font-medium flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15.5 2v3m-9-3v3M11 2v3m8 8v-2.5c0-3.3 0-4.95-1.025-5.975S15.3 3.5 12 3.5h-2c-3.3 0-4.95 0-5.975 1.025S3 7.2 3 10.5V15c0 3.3 0 4.95 1.025 5.975S6.7 22 10 22h3m-6-7h4m-4-4h8m6 8h-3m0 0h-3m3 0v3m0-3v-3"
              />
            </svg>
            Bulk Schedule
          </Link>
          <Link to={`/admin/schedules/new?cinema=${cinemaId}`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            + Add Single
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Movie Filter */}
          <select
            value={filterMovie}
            onChange={(e) => setFilterMovie(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Movies</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>

          {/* Studio Filter */}
          <select
            value={filterStudio}
            onChange={(e) => setFilterStudio(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Studios</option>
            {cinema?.studios?.map((studio) => (
              <option key={studio.id} value={studio.id}>
                Studio {studio.studioNumber} - {studio.studioType}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Filter by date"
          />

          {/* Sort By */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary">
            <option value="date">Sort by Date</option>
            <option value="time">Sort by Time</option>
            <option value="movie">Sort by Movie</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={() => {
              setFilterMovie("all");
              setFilterStudio("all");
              setFilterDate("");
              setSortBy("date");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {(filterMovie !== "all" || filterStudio !== "all" || filterDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Active filters:</span>
            {filterMovie !== "all" && <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Movie: {movies.find((m) => m.id === parseInt(filterMovie))?.title}</span>}
            {filterStudio !== "all" && (
              <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Studio: {cinema?.studios?.find((s) => s.id === parseInt(filterStudio))?.studioNumber}</span>
            )}
            {filterDate && <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Date: {new Date(filterDate).toLocaleDateString("id-ID")}</span>}
          </div>
        )}
      </div>

      {/* Schedules Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Movie</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Studio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">End Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Seats</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedules.map((schedule) => {
                const film = schedule.film || {};
                const studio = schedule.studio || {};
                const studioType = studio.tipeStudio || {};
                const seatAvailability = schedule.seatAvailability || {};

                return (
                  <tr key={schedule.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-950">
                      <div className="flex items-center gap-3">
                        {film.poster && <img src={film.poster} alt={film.title} className="w-10 h-14 object-cover rounded" />}
                        <div>
                          <p className="text-sm text-gray-950 font-medium">{film.title || "-"}</p>
                          <p className="text-xs text-gray-600">{film.duration ? `${film.duration} min` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-950">
                      <div>
                        <p className="text-sm text-gray-700">Studio {studio.number || schedule.studioNumber || "-"}</p>
                        <p className="text-xs text-gray-600">{studioType.nama_tipe || schedule.studioType || "-"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(schedule.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{schedule.startTime}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{schedule.endTime || "-"}</td>
                    <td className="py-3 px-4 text-sm font-medium text-primary">{schedule.price ? `Rp ${Number(schedule.price).toLocaleString("id-ID")}` : "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-950">
                      <span
                        className={`font-medium ${
                          seatAvailability.available < seatAvailability.total * 0.2 ? "text-red-500" : seatAvailability.available < seatAvailability.total * 0.5 ? "text-yellow-500" : "text-green-500"
                        }`}
                      >
                        {seatAvailability.available || 0}/{seatAvailability.total || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-950">
                      <div className="flex gap-2">
                        <Link to={`/admin/schedules/${schedule.id}/edit`} className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(schedule.id)} className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedSchedules.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No schedules found for this cinema</p>
            {(filterMovie !== "all" || filterStudio !== "all" || filterDate) && <p className="text-sm mt-2">Try adjusting your filters</p>}
          </div>
        )}
      </div>
    </div>
  );
}
