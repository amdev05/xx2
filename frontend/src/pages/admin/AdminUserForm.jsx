import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: isEdit ? "John Doe" : "",
    email: isEdit ? "john.doe@example.com" : "",
    phone: isEdit ? "081234567890" : "",
    role: isEdit ? "customer" : "customer",
    status: isEdit ? "active" : "active",
    password: "",
    confirm_password: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password match
    if (!isEdit && formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    
    console.log("Saving user:", formData);
    navigate("/admin/users");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/users" className="text-gray-600 hover:text-gray-950 flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Users
        </Link>
        <h1 className="text-gray-950 text-2xl font-bold">{isEdit ? "Edit" : "Add"} User</h1>
        <p className="text-sm text-gray-600 mt-1">Manage user account information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-gray-950 text-lg font-bold">Personal Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                placeholder="081234567890"
                required
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-gray-950 text-lg font-bold">Account Settings</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-gray-950 block text-sm font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        {!isEdit && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <h2 className="text-gray-950 text-lg font-bold">Password</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="text-gray-950 block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter password"
                  required={!isEdit}
                  minLength="8"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-gray-950 block text-sm font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                  className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Confirm password"
                  required={!isEdit}
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">Password must be at least 8 characters long</p>
          </div>
        )}

        {isEdit && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-400">
              <strong>Note:</strong> To change password, please use the "Reset Password" feature from the user profile.
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {isEdit ? "Update" : "Create"} User
          </button>
          <Link
            to="/admin/users"
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-950 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
