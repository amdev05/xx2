import { createContext, useContext, useState, useEffect } from "react";
import cinemaService from "../services/cinemaService";

const CashierContext = createContext(null);

export const useCashier = () => {
  const context = useContext(CashierContext);
  if (!context) {
    throw new Error("useCashier must be used within CashierProvider");
  }
  return context;
};

export const CashierProvider = ({ children }) => {
  const [selectedCinema, setSelectedCinema] = useState(() => {
    // Load from localStorage if exists
    return localStorage.getItem("cashier_selected_cinema") || "all";
  });
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCinemas();
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("cashier_selected_cinema", selectedCinema);
  }, [selectedCinema]);

  const fetchCinemas = async () => {
    try {
      const response = await cinemaService.getAll();
      setCinemas(response.data || []);
    } catch (err) {
      console.error("Error fetching cinemas:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedCinema,
    setSelectedCinema,
    cinemas,
    loading,
  };

  return <CashierContext.Provider value={value}>{children}</CashierContext.Provider>;
};
