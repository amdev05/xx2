import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

import menuIcon from "../../../assets/icons/menuIcon.svg";
import mapsIcon from "../../../assets/icons/mapsIcon.svg";
import searchIcon from "../../../assets/icons/searchIcon.svg";
import ProfileDropdown from "../../ui/ProfileDropdown";
import { useAuth } from "../../../contexts/AuthContext";
import authService from "../../../services/authService";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [authCheck, setAuthCheck] = useState(0);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthCheck((prev) => prev + 1); // Force re-render
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  // Check both AuthContext and authService for authentication
  const isLoggedIn = isAuthenticated || authService.isAuthenticated();

  return (
    <>
      <header className="bg-header w-full sticky top-0 z-20">
        {/* mobile */}
        <div className="relative bg-header h-11 md:h-13 flex lg:hidden justify-between items-center my-container z-60">
          <img src={menuIcon} alt="menuIcon" className="w-4" onClick={() => setIsMenuOpen((open) => !open)} />

          <Link to="/" className="font-bold">
            XX2
          </Link>

          {isLoggedIn ? (
            <ProfileDropdown />
          ) : (
            <Link to="/login" className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary/90 transition-colors">
              Login
            </Link>
          )}
        </div>

        <div
          className={`lg:hidden fixed top-0 bg-black w-full h-screen my-container  border-light/25 py-16 space-y-4 transition-all ${isMenuOpen ? "" : "-translate-y-full"}`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex items-center gap-2">
            <img src={mapsIcon} alt="menuIcon" className="w-3" />
            <p className="font-bold text-xs text-tx-light/75">Kota Bandung</p>
          </div>

          <div className="flex items-center px-2 border border-light rounded-full">
            <img src={searchIcon} alt="" className="w-3" />
            <input type="text" className="focus:outline-none text-xs p-1.5" placeholder="Search" />
          </div>

          <nav className="flex flex-col space-y-2">
            <NavLink to="/" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Beranda
            </NavLink>
            <NavLink to="/movies" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Film
            </NavLink>
            <NavLink to="/cinemas" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Bioskop
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/tickets" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
                Tiket
              </NavLink>
            )}
          </nav>
        </div>

        {/* desktop */}
        <div className="hidden h-13 lg:flex justify-between items-center my-container">
          <div className="flex gap-8 items-center">
            <Link to="/" className="font-bold">
              XX2
            </Link>

            <div className="flex items-center gap-2">
              <img src={mapsIcon} alt="menuIcon" className="w-3" />
              <p className="font-bold text-xs text-tx-light/75">Kota Bandung</p>
            </div>
          </div>

          <nav className="space-x-8">
            <NavLink to="/" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Beranda
            </NavLink>
            <NavLink to="/movies" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Film
            </NavLink>
            <NavLink to="/cinemas" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
              Bioskop
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/tickets" className={({ isActive }) => `font-medium  ${isActive ? "text-tx-light" : "text-tx-light/50"}`}>
                Tiket
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3 ">
            <div className="flex items-center px-2 border border-light rounded-full">
              <img src={searchIcon} alt="" className="w-3" />
              <input type="text" className="focus:outline-none text-xs p-1.5" placeholder="Search" />
            </div>

            {isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
