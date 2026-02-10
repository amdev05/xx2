import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import Button from "../../components/ui/Button";

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(formData);
      // Redirect back to the page user was trying to access
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-tx-light mb-2">XX2</h1>
          <p className="text-tx-light/60">Sign in to continue</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card-dark rounded-[var(--radius-myrad)] p-8 border border-light/10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-tx-light mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-light/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-tx-light placeholder-tx-light/40"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-tx-light mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-light/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-tx-light placeholder-tx-light/40"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <Button type="submit" variant="dark" disabled={loading} classname="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card-dark text-tx-light/50">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-tx-light/60">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-tx-light/50 hover:text-tx-light/80 transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
