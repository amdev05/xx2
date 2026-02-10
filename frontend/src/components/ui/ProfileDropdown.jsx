import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";
import profileOutlineIcon from "../../assets/icons/profileOutlineIcon.svg";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout: contextLogout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check both AuthContext and authService for authentication
  const isLoggedIn = isAuthenticated || authService.isAuthenticated();

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Logout from both contexts
    authService.logout();
    if (contextLogout) {
      contextLogout();
    }
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none" aria-label="Profile menu">
        <img src={profileOutlineIcon} alt="profileIcon" className="size-6.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card-dark border border-light/20 rounded-[var(--radius-myrad)] shadow-lg overflow-hidden z-50">
          {isLoggedIn ? (
            <>
              <Link to="/tickets" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-tx-light hover:bg-light/10 transition-colors duration-200">
                Tiket Saya
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-light/10 transition-colors duration-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-tx-light hover:bg-light/10 transition-colors duration-200">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-tx-light hover:bg-light/10 transition-colors duration-200">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
