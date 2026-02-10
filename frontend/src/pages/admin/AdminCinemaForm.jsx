import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function AdminCinemaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: isEdit ? "Summarecon Mall Bandung XX2" : "",
    address: isEdit ? "Jl. Bulevar Barat No. 75-89, Summarecon Bandung, Cisaranten Kidul, Gedebage, Kota Bandung, Jawa Barat 40295." : "",
    image: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving cinema:", formData);
    navigate("/admin/cinemas");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/cinemas" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Cinemas
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} Cinema</h1>
        <p className="text-sm text-gray-600 mt-1">Fill in the cinema details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Cinema Name */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Cinema Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            placeholder="e.g., Summarecon Mall Bandung XX2"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-24"
            placeholder="Enter full address"
            required
          />
        </div>

        {/* Image Upload Placeholder */}
        <div>
          <label className="text-gray-950 block text-sm font-medium mb-2">Cinema Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-600">
            <p>Upload cinema image</p>
            <p className="text-xs mt-1">(File upload coming soon)</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> After creating the cinema, you can add studios from the cinema detail page.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {isEdit ? "Update" : "Create"} Cinema
          </button>
          <Link
            to="/admin/cinemas"
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
