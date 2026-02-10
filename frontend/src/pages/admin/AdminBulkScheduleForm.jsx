import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import scheduleService from "../../services/scheduleService";
import movieService from "../../services/movieService";
import cinemaService from "../../services/cinemaService";

export default function AdminBulkScheduleForm() {
  const { cinemaId } = useParams();
  const navigate = useNavigate();

  const [cinema, setCinema] = useState(null);
  const [movies, setMovies] = useState([]);
  const [studios, setStudios] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    movie_id: "",
    date: "",
  });

  const [scheduleItems, setScheduleItems] = useState([{ studio_id: "", time: "", id: 1 }]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cinemaRes, moviesRes, schedulesRes] = await Promise.all([cinemaService.getById(cinemaId), movieService.getAll(), scheduleService.getAll({ id_cabang: cinemaId })]);

        setCinema(cinemaRes.data);
        setMovies(moviesRes.data || []);
        setStudios(cinemaRes.data?.studios || []);
        setExistingSchedules(schedulesRes.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cinemaId]);
  const selectedMovie = movies.find((m) => m.id === parseInt(formData.movie_id));

  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { studio_id: "", time: "", id: Date.now() }]);
  };

  const removeScheduleItem = (id) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== id));
  };

  const updateScheduleItem = (id, field, value) => {
    setScheduleItems(scheduleItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Calculate end time with buffer
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration + 10; // +10 min buffer
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  // Generate time options in 5-minute intervals (12:00 - 21:00)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 12; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  // Get available times for a specific studio (excluding conflicts)
  const getAvailableTimesForStudio = (studioId, currentItemId) => {
    if (!studioId || !formData.date || !selectedMovie) {
      return generateTimeOptions();
    }

    const allTimes = generateTimeOptions();

    return allTimes.filter((time) => {
      const [newHours, newMinutes] = time.split(":").map(Number);
      const newStart = newHours * 60 + newMinutes;
      const newEnd = newStart + selectedMovie.duration + 10;

      // Check against existing schedules
      const hasExistingConflict = existingSchedules.some((existing) => {
        if (existing.studioId !== parseInt(studioId)) return false;

        const existingDate = new Date(existing.date).toISOString().split("T")[0];
        if (existingDate !== formData.date) return false;

        const [existHours, existMinutes] = existing.startTime.split(":").map(Number);
        const existStart = existHours * 60 + existMinutes;
        const existEnd = existStart + (existing.movieDuration || existing.film?.duration || 120) + 10;

        return newStart < existEnd && newEnd > existStart;
      });

      // Check against other items in current form (except current item)
      const hasNewConflict = scheduleItems.some((item) => {
        if (item.id === currentItemId) return false; // Skip current item
        if (item.studio_id !== studioId || !item.time) return false;

        const [itemHours, itemMinutes] = item.time.split(":").map(Number);
        const itemStart = itemHours * 60 + itemMinutes;
        const itemEnd = itemStart + selectedMovie.duration + 10;

        return newStart < itemEnd && newEnd > itemStart;
      });

      return !hasExistingConflict && !hasNewConflict;
    });
  };

  // Check for conflicts
  // Check for conflicts
  const checkConflict = (studioId, time) => {
    if (!formData.date || !time || !selectedMovie) return false;

    const [newHours, newMinutes] = time.split(":").map(Number);
    const newStart = newHours * 60 + newMinutes;
    const newEnd = newStart + selectedMovie.duration + 10;

    // Check against existing schedules
    const hasExistingConflict = existingSchedules.some((existing) => {
      if (existing.studioId !== parseInt(studioId)) return false;

      // Format dates for comparison
      const existingDate = new Date(existing.date).toISOString().split("T")[0];
      if (existingDate !== formData.date) return false;

      const [existHours, existMinutes] = existing.startTime.split(":").map(Number);
      const existStart = existHours * 60 + existMinutes;
      const existEnd = existStart + (existing.movieDuration || existing.film?.duration || 120) + 10;

      return newStart < existEnd && newEnd > existStart;
    });

    // Check against other items in current form
    const hasNewConflict = scheduleItems.some((item) => {
      if (item.studio_id !== studioId || item.time === time) return false;
      if (!item.time) return false;

      const [itemHours, itemMinutes] = item.time.split(":").map(Number);
      const itemStart = itemHours * 60 + itemMinutes;
      const itemEnd = itemStart + selectedMovie.duration + 10;

      return newStart < itemEnd && newEnd > itemStart;
    });

    return hasExistingConflict || hasNewConflict;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out items without both studio and time
    const validItems = scheduleItems.filter((item) => item.studio_id && item.time);

    if (validItems.length === 0) {
      alert("Please add at least one schedule with studio and time");
      return;
    }

    // Check for conflicts
    const conflictItems = validItems.filter((item) => checkConflict(item.studio_id, item.time));

    if (conflictItems.length > 0) {
      if (!confirm(`${conflictItems.length} schedule(s) have conflicts. Create only non-conflicting schedules?`)) {
        return;
      }
    }

    const nonConflictingItems = validItems.filter((item) => !checkConflict(item.studio_id, item.time));

    if (nonConflictingItems.length === 0) {
      alert("All schedules have conflicts. Please adjust the times.");
      return;
    }

    try {
      // Create schedules one by one
      for (const item of nonConflictingItems) {
        const endTime = calculateEndTime(item.time, selectedMovie.duration);

        const scheduleData = {
          movieId: parseInt(formData.movie_id),
          studioId: parseInt(item.studio_id),
          date: formData.date,
          startTime: item.time,
          endTime: endTime, // Add endTime
        };

        await scheduleService.create(scheduleData);
      }

      alert(`Successfully created ${nonConflictingItems.length} schedule(s)`);
      navigate(`/admin/schedules/cinema/${cinemaId}`);
    } catch (err) {
      alert(`Failed to create schedules: ${err.message}`);
      console.error("Error creating schedules:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to={`/admin/schedules/cinema/${cinemaId}`} className="text-gray-600 hover:text-gray-950 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" />
          </svg>{" "}
          Back to {cinema?.name} Schedules
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-gray-950 text-2xl font-bold flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15.5 2v3m-9-3v3M11 2v3m8 8v-2.5c0-3.3 0-4.95-1.025-5.975S15.3 3.5 12 3.5h-2c-3.3 0-4.95 0-5.975 1.025S3 7.2 3 10.5V15c0 3.3 0 4.95 1.025 5.975S6.7 22 10 22h3m-6-7h4m-4-4h8m6 8h-3m0 0h-3m3 0v3m0-3v-3"
            />
          </svg>{" "}
          Bulk Schedule Creation
        </h1>
        <p className="text-sm text-gray-600 mt-1">Create multiple showtimes at once for {cinema?.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-gray-950 text-lg font-bold">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Movie Selection */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Movie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.movie_id}
                onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="">Select Movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title} ({movie.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {selectedMovie && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-400">
                <strong>Auto-calculation:</strong> Movie duration is {selectedMovie.duration} minutes. A 10-minute buffer will be added after each show.
              </p>
            </div>
          )}
        </div>

        {/* Schedule Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-950 text-lg font-bold">Showtimes</h2>
            <button type="button" onClick={addScheduleItem} className="px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 text-sm" disabled={!formData.movie_id || !formData.date}>
              + Add Showtime
            </button>
          </div>

          {!formData.movie_id || !formData.date ? (
            <p className="text-sm text-gray-600 text-center py-8">Select movie and date first to add showtimes</p>
          ) : (
            <div className="space-y-3">
              {scheduleItems.map((item, index) => {
                const hasConflict = item.studio_id && item.time && checkConflict(item.studio_id, item.time);
                const endTime = item.time && selectedMovie ? calculateEndTime(item.time, selectedMovie.duration) : "";

                return (
                  <div key={item.id} className={`grid md:grid-cols-12 gap-3 p-4 rounded-lg border ${hasConflict ? "border-red-500/50 bg-red-500/5" : "border-gray-200 bg-gray-100"}`}>
                    <div className="md:col-span-1 flex items-center">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    </div>

                    <div className="md:col-span-4">
                      <select
                        value={item.studio_id}
                        onChange={(e) => updateScheduleItem(item.id, "studio_id", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm text-tx-dark"
                      >
                        <option value="">Select Studio</option>
                        {studios.map((studio) => (
                          <option key={studio.id} value={studio.id}>
                            Studio {studio.studioNumber} ({studio.studioType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <select
                        value={item.time}
                        onChange={(e) => updateScheduleItem(item.id, "time", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm text-tx-dark"
                        disabled={!item.studio_id || !formData.date || !selectedMovie}
                      >
                        <option value="">Select Time</option>
                        {getAvailableTimesForStudio(item.studio_id, item.id).map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-center">
                      {endTime && (
                        <span className="text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="inline-block">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 6s6 4.419 6 6s-6 6-6 6" />
                          </svg>{" "}
                          <span className="text-gray-950">{endTime}</span>
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-center">
                      {hasConflict ? (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded">⚠️ Conflict</span>
                      ) : item.studio_id && item.time ? (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">✓ OK</span>
                      ) : null}
                    </div>

                    <div className="md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeScheduleItem(item.id)}
                        className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                        disabled={scheduleItems.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview Summary */}
        {formData.movie_id && formData.date && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-gray-950 text-lg font-bold mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Showtimes</p>
                <p className="text-2xl text-gray-950 font-bold text-primary">{scheduleItems.filter((i) => i.studio_id && i.time).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conflicts Detected</p>
                <p className="text-2xl text-gray-950 font-bold text-red-500">{scheduleItems.filter((i) => i.studio_id && i.time && checkConflict(i.studio_id, i.time)).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Will Be Created</p>
                <p className="text-2xl text-gray-950 font-bold text-green-500">{scheduleItems.filter((i) => i.studio_id && i.time && !checkConflict(i.studio_id, i.time)).length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            disabled={!formData.movie_id || !formData.date || scheduleItems.every((i) => !i.studio_id || !i.time)}
          >
            Create Schedules
          </button>
          <Link to={`/admin/schedules/cinema/${cinemaId}`} className="flex-1 px-6 py-3 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
