import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import studioService from "../../services/studioService";
import studioTypeService from "../../services/studioTypeService";
import cinemaService from "../../services/cinemaService";

export default function AdminStudioForm() {
  const { cinemaId, id: studioId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!studioId;

  const [formData, setFormData] = useState({
    studio_number: "",
    studio_type_id: "",
    rows: "",
    seats_per_row: "",
  });

  const [studioTypes, setStudioTypes] = useState([]);
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch studio types and cinema data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch studio types
        const typesResponse = await studioTypeService.getAll();
        setStudioTypes(typesResponse.data || []);

        // Fetch cinema details
        const cinemaResponse = await cinemaService.getById(cinemaId);
        setCinema(cinemaResponse.data);

        // If edit mode, fetch studio data
        if (isEdit) {
          const studioResponse = await studioService.getById(studioId);
          const studio = studioResponse.data;

          // Calculate rows and seats from existing seats
          const seats = studio.seats || [];
          const uniqueRows = [...new Set(seats.map((s) => s.row))].sort();
          const seatsInFirstRow = seats.filter((s) => s.row === uniqueRows[0]).length;

          setFormData({
            studio_number: studio.studioNumber || "",
            studio_type_id: studio.studioTypeId || "",
            rows: uniqueRows.length.toString() || "",
            seats_per_row: seatsInFirstRow.toString() || "",
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cinemaId, studioId, isEdit]);

  const totalCapacity = formData.rows && formData.seats_per_row ? parseInt(formData.rows) * parseInt(formData.seats_per_row) : 0;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        id_cabang: parseInt(cinemaId),
        no_studio: formData.studio_number,
        id_tipe_studio: parseInt(formData.studio_type_id),
      };

      if (isEdit) {
        // Update existing studio
        await studioService.update(studioId, payload);
        alert("Studio updated successfully!");
      } else {
        // Create new studio and seats
        const createResponse = await studioService.create(payload);
        const newStudioId = createResponse.data.id;

        // Create seats if rows and seats_per_row are specified
        if (formData.rows && formData.seats_per_row) {
          await studioService.createSeats({
            id_studio: newStudioId,
            rows: parseInt(formData.rows),
            seatsPerRow: parseInt(formData.seats_per_row),
          });
        }

        alert("Studio created successfully!");
      }

      navigate(`/admin/cinemas/${cinemaId}`);
    } catch (err) {
      setError(err.message || "Failed to save studio");
      alert(`Failed to save studio: ${err.message}`);
      console.error("Error saving studio:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate seat layout preview
  const generateSeatPreview = () => {
    if (!formData.rows || !formData.seats_per_row) return null;

    const rows = parseInt(formData.rows);
    const seatsPerRow = parseInt(formData.seats_per_row);

    if (rows > 26 || seatsPerRow > 30) return null; // Limit preview size

    const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

    return (
      <div className="space-y-1">
        <div className="text-center text-xs text-gray-600 mb-4 pb-2 border-b-2 border-gray-300">SCREEN</div>
        {rowLetters.map((letter) => (
          <div key={letter} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-4">{letter}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: seatsPerRow }, (_, i) => (
                <div key={i} className="w-4 h-4 bg-primary/30 rounded-sm flex items-center justify-center" title={`${letter}${i + 1}`}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !cinema) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">{error}</p>
        <Link to="/admin/cinemas" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Back to Cinemas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link to={`/admin/cinemas/${cinemaId}`} className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Cinema Detail
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">
          {isEdit ? "Edit" : "Add"} Studio - {cinema?.name}
        </h1>
        <p className="text-sm text-gray-600 mt-1">Configure studio details and seat layout</p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <h2 className="text-gray-950 text-lg font-bold">Studio Information</h2>

            {/* Studio Number */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Studio Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.studio_number}
                onChange={(e) => handleChange("studio_number", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="1"
                min="1"
                required
              />
            </div>

            {/* Studio Type */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Studio Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studio_type_id}
                onChange={(e) => handleChange("studio_type_id", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="">Select Studio Type</option>
                {studioTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-gray-200" />

            <h3 className="text-gray-950 text-md font-bold">Seat Configuration</h3>

            {/* Number of Rows */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Number of Rows <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.rows}
                onChange={(e) => handleChange("rows", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="10"
                min="1"
                max="26"
                required
                disabled={isEdit}
              />
              <p className="text-xs text-gray-600 mt-2">{isEdit ? "Seat configuration cannot be changed in edit mode" : "Rows will be labeled A-Z (max 26 rows)"}</p>
            </div>

            {/* Seats per Row */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Seats per Row <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.seats_per_row}
                onChange={(e) => handleChange("seats_per_row", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="16"
                min="1"
                max="30"
                required
                disabled={isEdit}
              />
              <p className="text-xs text-gray-600 mt-2">{isEdit ? "Seat configuration cannot be changed in edit mode" : "Number of seats in each row (max 30)"}</p>
            </div>

            {/* Total Capacity */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Capacity:</span>
                <span className="text-2xl font-bold text-primary">{totalCapacity} seats</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
              {submitting ? "Saving..." : isEdit ? "Update" : "Create"} Studio
            </button>
            <Link to={`/admin/cinemas/${cinemaId}`} className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
              Cancel
            </Link>
          </div>
        </div>

        {/* Right Column - Seat Layout Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-gray-950 text-lg font-bold mb-4">Seat Layout Preview</h2>

          {totalCapacity > 0 ? (
            <div className="bg-gray-100 rounded-lg p-6 overflow-auto max-h-96">{generateSeatPreview()}</div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
              <p className="text-sm text-gray-950">Enter rows and seats per row to see preview</p>
            </div>
          )}

          {totalCapacity > 0 && (
            <div className="mt-4 text-xs text-gray-600">
              <p>• Each seat is represented by a small square</p>
              <p>• Rows are labeled from A to {String.fromCharCode(64 + parseInt(formData.rows || 0))}</p>
              <p>• Seats are numbered from 1 to {formData.seats_per_row}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
