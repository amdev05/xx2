import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import scheduleService from "../../services/scheduleService";
import movieService from "../../services/movieService";
import cinemaService from "../../services/cinemaService";

export default function AdminScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    movie_id: "",
    cinema_id: "",
    studio_id: "",
    date: "",
    time: "",
    price_override: "",
  });

  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [studios, setStudios] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get selected movie for duration calculation
  const selectedMovie = movies.find((m) => m.id === parseInt(formData.movie_id));

  // Calculate end time with buffer
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration + 10; // +10 min buffer
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, cinemasRes, schedulesRes] = await Promise.all([movieService.getAll(), cinemaService.getAll(), scheduleService.getAll()]);

        setMovies(moviesRes.data || []);
        setCinemas(cinemasRes.data || []);
        setExistingSchedules(schedulesRes.data || []);

        // If editing, fetch schedule data
        if (isEdit) {
          const scheduleRes = await scheduleService.getById(id);
          const schedule = scheduleRes.data;
          setFormData({
            movie_id: schedule.movieId || "",
            cinema_id: schedule.cinemaId || "",
            studio_id: schedule.studioId || "",
            date: schedule.date || "",
            time: schedule.startTime || "",
            price_override: schedule.price || "",
          });

          // Fetch studios for the cinema
          if (schedule.cinemaId) {
            const cinemaRes = await cinemaService.getById(schedule.cinemaId);
            setStudios(cinemaRes.data?.studios || []);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const filteredStudios = studios;

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

  // Check if a time slot has conflict
  const checkConflict = (studioId, date, time) => {
    if (!studioId || !date || !time || !selectedMovie) return false;

    const [newHours, newMinutes] = time.split(":").map(Number);
    const newStart = newHours * 60 + newMinutes;
    const newEnd = newStart + selectedMovie.duration + 10;

    return existingSchedules.some((existing) => {
      // Skip if different studio
      if (existing.studioId !== parseInt(studioId)) return false;

      // Skip if editing and this is the current schedule
      if (isEdit && existing.id === parseInt(id)) return false;

      // Format dates for comparison
      const existingDate = new Date(existing.date).toISOString().split("T")[0];
      if (existingDate !== date) return false;

      const [existHours, existMinutes] = existing.startTime.split(":").map(Number);
      const existStart = existHours * 60 + existMinutes;
      const existEnd = existStart + (existing.movieDuration || existing.film?.duration || 120) + 10;

      return newStart < existEnd && newEnd > existStart;
    });
  };

  // Get available times for selected studio and date
  const getAvailableTimes = () => {
    if (!formData.studio_id || !formData.date || !selectedMovie) {
      return generateTimeOptions();
    }

    return generateTimeOptions().filter((time) => {
      return !checkConflict(formData.studio_id, formData.date, time);
    });
  };

  const handleChange = async (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Fetch studios when cinema changes
    if (field === "cinema_id" && value) {
      try {
        const cinemaRes = await cinemaService.getById(value);
        setStudios(cinemaRes.data?.studios || []);
        setFormData((prev) => ({ ...prev, studio_id: "" }));
      } catch (err) {
        console.error("Error fetching studios:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for conflicts
    if (checkConflict(formData.studio_id, formData.date, formData.time)) {
      alert("This time slot conflicts with an existing schedule. Please choose a different time.");
      return;
    }

    try {
      const endTime = calculateEndTime(formData.time, selectedMovie.duration);

      const scheduleData = {
        movieId: parseInt(formData.movie_id),
        studioId: parseInt(formData.studio_id),
        date: formData.date,
        startTime: formData.time,
        endTime: endTime, // Add endTime
        priceOverride: formData.price_override ? parseFloat(formData.price_override) : null,
      };

      if (isEdit) {
        await scheduleService.update(id, scheduleData);
      } else {
        await scheduleService.create(scheduleData);
      }

      navigate("/admin/schedules");
    } catch (err) {
      alert(`Failed to save schedule: ${err.message}`);
      console.error("Error saving schedule:", err);
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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/schedules" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" />
          </svg>{" "}
          Back to Schedules
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} Schedule</h1>
        <p className="text-sm text-gray-600 mt-1">Create a movie showtime schedule</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Movie Selection */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Movie <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.movie_id}
            onChange={(e) => handleChange("movie_id", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
          >
            <option value="">Select Movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Cinema Selection */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Cinema <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.cinema_id}
            onChange={(e) => handleChange("cinema_id", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
          >
            <option value="">Select Cinema</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>
        </div>

        {/* Studio Selection */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Studio <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.studio_id}
            onChange={(e) => handleChange("studio_id", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
            disabled={!formData.cinema_id}
          >
            <option value="">{formData.cinema_id ? "Select Studio" : "Select Cinema First"}</option>
            {filteredStudios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                Studio {studio.studioNumber} ({studio.studioType})
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-950 block text-sm font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-gray-950 block text-sm font-medium mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              required
              disabled={!formData.studio_id || !formData.date || !formData.movie_id}
            >
              <option value="">{!formData.movie_id ? "Select Movie First" : !formData.studio_id ? "Select Studio First" : !formData.date ? "Select Date First" : "Select Time"}</option>
              {getAvailableTimes().map((time) => (
                <option key={time} value={time}>
                  {time}
                  {selectedMovie && ` - ${calculateEndTime(time, selectedMovie.duration)}`}
                </option>
              ))}
            </select>
            {formData.time && selectedMovie && <p className="text-xs text-gray-600 mt-2">End time: {calculateEndTime(formData.time, selectedMovie.duration)} (includes 10 min buffer)</p>}
          </div>
        </div>

        {/* Price Override */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">Price Override (Optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">Rp</span>
            <input
              type="number"
              value={formData.price_override}
              onChange={(e) => handleChange("price_override", e.target.value)}
              className="w-full pl-12 pr-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Leave empty to use pricing policy"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">If left empty, price will be calculated based on pricing policy (cinema + studio type + day type)</p>
        </div>

        {/* Info Box */}
        {selectedMovie && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>Movie Duration:</strong> {selectedMovie.duration} minutes + 10 minutes buffer = {selectedMovie.duration + 10} minutes total
            </p>
            <p className="text-sm text-blue-400 mt-1">Only available time slots (without conflicts) are shown in the dropdown.</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button type="submit" className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            {isEdit ? "Update" : "Create"} Schedule
          </button>
          <Link to="/admin/schedules" className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
