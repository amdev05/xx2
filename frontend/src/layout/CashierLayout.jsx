import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCashier } from "../contexts/CashierContext";
import { useEffect } from "react";

export default function CashierLayout() {
  const { user, logout, loading } = useAuth();
  const { selectedCinema, setSelectedCinema, cinemas } = useCashier();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to load before checking
    if (!loading && !user) {
      navigate("/cashier/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/cashier/login", { replace: true });
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                  <polyline points="17 2 12 7 7 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">XX2 Cinema</h1>
                <p className="text-sm text-gray-600">Cashier POS</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => navigate("/cashier")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/cashier") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/cashier/transactions")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/cashier/transactions") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                Transaksi
              </button>

              {/* Cinema Selector */}
              <div className="ml-4 pl-4 border-l border-gray-200">
                <select
                  value={selectedCinema}
                  onChange={(e) => setSelectedCinema(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Semua Cabang</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
              </div>
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-950">{user.nama_pelanggan || user.name || "Kasir"}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
