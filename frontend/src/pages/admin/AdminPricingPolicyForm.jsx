import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function AdminPricingPolicyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Mock data for editing
  const existingPolicy = id
    ? {
        cinema_id: "1",
        studio_type: "Regular",
        week_type: "weekday",
        price: "40000",
      }
    : null;

  const [formData, setFormData] = useState(
    existingPolicy || {
      cinema_id: "",
      studio_type: "",
      week_type: "weekday",
      price: "",
    }
  );

  const cinemas = [
    { id: 1, name: "Summarecon Mall Bandung" },
    { id: 2, name: "Trans Studio Mall Bandung" },
  ];

  const studioTypes = ["Regular", "Premiere", "Max", "IMAX"];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement save logic
    console.log("Saving pricing policy:", formData);
    navigate("/admin/pricing-policy");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link to="/admin/pricing-policy" className="text-gray-600 hover:text-gray-950">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back
          </Link>
        </div>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} Pricing Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Set ticket price based on cinema, studio type, and day type</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
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

        {/* Studio Type Selection */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Studio Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.studio_type}
            onChange={(e) => handleChange("studio_type", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
          >
            <option value="">Select Studio Type</option>
            {studioTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Week Type Selection */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Day Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="text-gray-950 flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="week_type"
                value="weekday"
                checked={formData.week_type === "weekday"}
                onChange={(e) => handleChange("week_type", e.target.value)}
                className="w-4 h-4"
              />
              <span>Weekday (Mon-Thu)</span>
            </label>
            <label className="text-gray-950 flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="week_type"
                value="weekend"
                checked={formData.week_type === "weekend"}
                onChange={(e) => handleChange("week_type", e.target.value)}
                className="w-4 h-4"
              />
              <span>Weekend (Fri-Sun)</span>
            </label>
          </div>
          <p className="text-xs text-gray-600 mt-2">Weekend includes Friday, Saturday, and Sunday</p>
        </div>

        {/* Price Input */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Price (IDR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">Rp</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full pl-12 pr-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Enter the ticket price for this combination</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> This pricing will be automatically applied to all schedules matching this cinema, studio type,
            and day type combination.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {isEdit ? "Update" : "Create"} Pricing Policy
          </button>
          <Link
            to="/admin/pricing-policy"
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
