import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-gray-950 text-3xl font-bold mb-2 flex gap-2 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 19.5c0-1.178 0-1.768.44-2.134C2.878 17 3.585 17 5 17s2.121 0 2.56.366s.44.956.44 2.134s0 1.768-.44 2.134C7.122 22 6.415 22 5 22s-2.121 0-2.56-.366S2 20.678 2 19.5Zm14 0c0-1.178 0-1.768.44-2.134C16.878 17 17.585 17 19 17s2.121 0 2.56.366s.44.956.44 2.134s0 1.768-.44 2.134C21.122 22 20.415 22 19 22s-2.121 0-2.56-.366S16 20.678 16 19.5Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 17c0-2.482-.744-3-4.308-3H9.308C5.744 14 5 14.518 5 17" />
                  <path stroke-linecap="round" d="M12 6.5L13 5m3.5 1.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0Z" />
                </g>
              </svg>{" "}
              Admin Login
            </h1>
            <p className="text-gray-600">Access the cinema management system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-3 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="admin@xx2.com"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-4 py-3 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
