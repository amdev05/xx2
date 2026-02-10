import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function AdminStudioTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: isEdit ? "Regular" : "",
    description: isEdit ? "Standard movie viewing experience with comfortable seating" : "",
    base_price: isEdit ? "35000" : "",
    features: isEdit ? ["Standard Screen", "Dolby Digital Sound", "Comfortable Seats"] : [],
  });

  const [newFeature, setNewFeature] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving studio type:", formData);
    navigate("/admin/studio-types");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/studio-types" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Studio Types
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} Studio Type</h1>
        <p className="text-sm text-gray-600 mt-1">Define studio type and its features</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Studio Type Name */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Studio Type Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            placeholder="e.g., Regular, Premiere, IMAX"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-20"
            placeholder="Describe the studio type experience"
            required
          />
        </div>

        {/* Base Price */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Base Price (IDR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">Rp</span>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => handleChange("base_price", e.target.value)}
              className="w-full pl-12 pr-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">This is the base price before pricing policy adjustments</p>
        </div>

        {/* Features */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">Features</label>
          
          {/* Feature List */}
          <div className="space-y-2 mb-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                <span className="flex-1 text-sm">✓ {feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.features.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-4">No features added yet</p>
            )}
          </div>

          {/* Add Feature */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              className="flex-1 px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter feature name"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {isEdit ? "Update" : "Create"} Studio Type
          </button>
          <Link
            to="/admin/studio-types"
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
