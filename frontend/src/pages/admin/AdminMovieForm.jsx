import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import movieService from "../../services/movieService";

export default function AdminMovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    duration: "",
    age_rating: "",
    release_date: "",
    poster_url: "",
    thumbnail_url: "",
    logo_url: "",
    trailer_url: "",
    genres: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch movie data if editing
  useEffect(() => {
    if (isEdit) {
      const fetchMovie = async () => {
        try {
          setLoading(true);
          const response = await movieService.getById(id);
          const movie = response.data;
          setFormData({
            title: movie.title || "",
            synopsis: movie.synopsis || "",
            duration: movie.duration?.toString() || "",
            age_rating: movie.ageRating || "",
            release_date: movie.releaseDate || "",
            poster_url: movie.posterUrl || "",
            thumbnail_url: movie.thumbnailUrl || "",
            logo_url: movie.logoUrl || "",
            trailer_url: movie.trailerUrl || "",
            genres: movie.genres || [],
          });
        } catch (err) {
          setError(err.message || "Failed to fetch movie");
          console.error("Error fetching movie:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMovie();
    }
  }, [id, isEdit]);

  const availableGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  const ageRatings = ["SU", "13+", "17+", "21+"];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
    }));
  };

  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    
    // Store the file object in formData
    const urlField = `${fieldName}_url`;
    setFormData((prev) => ({
      ...prev,
      [urlField]: file, // Store File object for upload
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      // Use FormData for file uploads
      const data = new FormData();
      
      // Append text fields
      data.append('nama_film', formData.title);
      data.append('durasi', formData.duration);
      data.append('genre', formData.genres.join(', ')); // Convert array to comma-separated string
      data.append('batas_umur', formData.age_rating);
      if (formData.synopsis) data.append('synopsis', formData.synopsis);
      if (formData.release_date) data.append('tanggal_rilis', formData.release_date);

      // Append files if they are File objects (newly selected)
      if (formData.poster_url && typeof formData.poster_url === 'object') {
        data.append('poster', formData.poster_url);
      }
      if (formData.thumbnail_url && typeof formData.thumbnail_url === 'object') {
        data.append('thumbnail', formData.thumbnail_url);
      }
      if (formData.logo_url && typeof formData.logo_url === 'object') {
        data.append('logo', formData.logo_url);
      }
      if (formData.trailer_url && typeof formData.trailer_url === 'object') {
        data.append('trailer', formData.trailer_url);
      }

      const url = isEdit
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/films/${id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/films`;

      const method = isEdit ? 'PUT' : 'POST';

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data // Send FormData directly (don't set Content-Type, browser will set it with boundary)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save movie');
      }

      alert(isEdit ? 'Movie updated successfully!' : 'Movie created successfully!');
      navigate("/admin/movies");
    } catch (err) {
      setError(err.message || "Failed to save movie");
      alert(`Failed to save movie: ${err.message}`);
      console.error("Error saving movie:", err);
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/movies" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Movies
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} Movie</h1>
        <p className="text-sm text-gray-600 mt-1">Fill in the movie details</p>
        {error && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-gray-950 text-lg font-bold">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter movie title"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="197"
                min="1"
                required
              />
            </div>

            {/* Age Rating */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Age Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.age_rating}
                onChange={(e) => handleChange("age_rating", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="">Select Age Rating</option>
                {ageRatings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            {/* Synopsis */}
            <div className="md:col-span-2">
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Synopsis <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => handleChange("synopsis", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-24"
                placeholder="Enter movie synopsis"
                required
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Release Date
              </label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) => handleChange("release_date", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Media Files */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-gray-950 text-lg font-bold">Media Files</h2>
          <p className="text-sm text-gray-600 -mt-2">Upload images and videos for the movie</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Poster Upload */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Poster Image (JPG/PNG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("poster", e.target.files[0])}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
              <p className="text-xs text-gray-600 mt-1">Main poster image (vertical, recommended 300x450)</p>
              {formData.poster_url && typeof formData.poster_url === 'string' && (
                <div className="mt-2">
                  <p className="text-xs text-primary">Current: <a href={formData.poster_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                  <img src={formData.poster_url} alt="Poster" className="mt-2 w-32 h-48 object-cover rounded border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              {formData.poster_url && typeof formData.poster_url === 'object' && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(formData.poster_url)} alt="Preview" className="w-32 h-48 object-cover rounded border border-gray-200" />
                  <p className="text-xs text-green-500 mt-1">New file selected: {formData.poster_url.name}</p>
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Thumbnail Image (JPG/PNG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("thumbnail", e.target.files[0])}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
              <p className="text-xs text-gray-600 mt-1">Thumbnail for list view (horizontal, recommended 400x225)</p>
              {formData.thumbnail_url && typeof formData.thumbnail_url === 'string' && (
                <div className="mt-2">
                  <p className="text-xs text-primary">Current: <a href={formData.thumbnail_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                  <img src={formData.thumbnail_url} alt="Thumbnail" className="mt-2 w-48 h-27 object-cover rounded border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              {formData.thumbnail_url && typeof formData.thumbnail_url === 'object' && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(formData.thumbnail_url)} alt="Preview" className="w-48 h-27 object-cover rounded border border-gray-200" />
                  <p className="text-xs text-green-500 mt-1">New file selected: {formData.thumbnail_url.name}</p>
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Logo Image (PNG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("logo", e.target.files[0])}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
              <p className="text-xs text-gray-600 mt-1">Movie logo (transparent PNG preferred)</p>
              {formData.logo_url && typeof formData.logo_url === 'string' && (
                <div className="mt-2">
                  <p className="text-xs text-primary">Current: <a href={formData.logo_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                  <img src={formData.logo_url} alt="Logo" className="mt-2 w-48 h-24 object-contain rounded border border-gray-200 bg-gray-100/50" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              {formData.logo_url && typeof formData.logo_url === 'object' && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(formData.logo_url)} alt="Preview" className="w-48 h-24 object-contain rounded border border-gray-200 bg-gray-100/50" />
                  <p className="text-xs text-green-500 mt-1">New file selected: {formData.logo_url.name}</p>
                </div>
              )}
            </div>

            {/* Trailer Upload */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Trailer Video (MP4)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange("trailer", e.target.files[0])}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
              <p className="text-xs text-gray-600 mt-1">Movie trailer (MP4 format)</p>
              {formData.trailer_url && typeof formData.trailer_url === 'string' && (
                <div className="mt-2">
                  <p className="text-xs text-primary">Current: <a href={formData.trailer_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                </div>
              )}
              {formData.trailer_url && typeof formData.trailer_url === 'object' && (
                <p className="text-xs text-green-500 mt-1">New file selected: {formData.trailer_url.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-gray-950 text-lg font-bold">Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableGenres.map((genre) => (
              <label key={genre} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.genres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-950">{genre}</span>
              </label>
            ))}
          </div>
        </div>



        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button 
            type="submit" 
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : (isEdit ? "Update" : "Create")} Movie
          </button>
          <Link to="/admin/movies" className="flex-1 px-6 py-3 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
