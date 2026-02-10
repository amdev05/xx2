import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { CashierProvider } from "../contexts/CashierContext";
import ProtectedRoute from "../components/ProtectedRoute";
import RequireAuth from "../components/RequireAuth";

// LAYOUT
import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";

// USER PAGES
import UserHome from "../pages/user/UserHome";
import UserCinemas from "../pages/user/UserCinemas";
import UserMovies from "../pages/user/UserMovies";
import UserMovieDetail from "../pages/user/UserMovieDetail";
import UserCinemaDetail from "../pages/user/UserCinemaDetail";
import UserTicket from "../pages/user/UserTicket";
import UserTicketDetail from "../pages/user/UserTicketDetail";
import UserLogin from "../pages/user/UserLogin";
import UserRegister from "../pages/user/UserRegister";

// ADMIN PAGES
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMovies from "../pages/admin/AdminMovies";
import AdminMovieForm from "../pages/admin/AdminMovieForm";
import AdminCinemas from "../pages/admin/AdminCinemas";
import AdminCinemaForm from "../pages/admin/AdminCinemaForm";
import AdminCinemaDetail from "../pages/admin/AdminCinemaDetail";
import AdminStudioForm from "../pages/admin/AdminStudioForm";
import AdminStudioTypes from "../pages/admin/AdminStudioTypes";
import AdminStudioTypeForm from "../pages/admin/AdminStudioTypeForm";
import AdminPricingPolicy from "../pages/admin/AdminPricingPolicy";
import AdminPricingPolicyForm from "../pages/admin/AdminPricingPolicyForm";
import AdminSchedules from "../pages/admin/AdminSchedules";
import AdminSchedulesCinema from "../pages/admin/AdminSchedulesCinema";
import AdminScheduleForm from "../pages/admin/AdminScheduleForm";
import AdminBulkScheduleForm from "../pages/admin/AdminBulkScheduleForm";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminBookingDetail from "../pages/admin/AdminBookingDetail";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserForm from "../pages/admin/AdminUserForm";

// AUTH PAGES
import Login from "../pages/auth/Login";

// ERROR PAGES
import ErrorPage from "../pages/ErrorPage";
import NotFound from "../pages/NotFound";
import UserSeatSelection from "../pages/user/UserSeatSelection";
import UserOrderSummary from "../pages/user/UserOrderSummary";
import UserPayment from "../pages/user/UserPayment";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <UserHome /> },
      { path: "movies", element: <UserMovies /> },
      { path: "movie/:id", element: <UserMovieDetail /> },
      { path: "cinemas", element: <UserCinemas /> },
      { path: "cinema/:id", element: <UserCinemaDetail /> },
      { path: "tickets", element: <UserTicket /> },
      { path: "ticket/:id", element: <UserTicketDetail /> },
      {
        path: "seat-selection/:scheduleId",
        element: (
          <RequireAuth>
            <UserSeatSelection />
          </RequireAuth>
        ),
      },
      {
        path: "ordersummary",
        element: (
          <RequireAuth>
            <UserOrderSummary />
          </RequireAuth>
        ),
      },
      {
        path: "payment",
        element: (
          <RequireAuth>
            <UserPayment />
          </RequireAuth>
        ),
      },

      { path: "notfound", element: <NotFound /> },
    ],
  },

  // User Auth Routes (public, standalone)
  {
    path: "/login",
    element: <UserLogin />,
  },
  {
    path: "/register",
    element: <UserRegister />,
  },

  // Admin Login (public route)
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  // Admin Routes (protected)
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "movies", element: <AdminMovies /> },
      { path: "movies/new", element: <AdminMovieForm /> },
      { path: "movies/:id/edit", element: <AdminMovieForm /> },
      { path: "cinemas", element: <AdminCinemas /> },
      { path: "cinemas/new", element: <AdminCinemaForm /> },
      { path: "cinemas/:id/edit", element: <AdminCinemaForm /> },
      { path: "cinemas/:id", element: <AdminCinemaDetail /> },
      { path: "cinemas/:cinemaId/studios/new", element: <AdminStudioForm /> },
      { path: "cinemas/:cinemaId/studios/:id/edit", element: <AdminStudioForm /> },
      { path: "studio-types", element: <AdminStudioTypes /> },
      { path: "studio-types/new", element: <AdminStudioTypeForm /> },
      { path: "studio-types/:id/edit", element: <AdminStudioTypeForm /> },
      { path: "pricing-policy", element: <AdminPricingPolicy /> },
      { path: "pricing-policy/new", element: <AdminPricingPolicyForm /> },
      { path: "pricing-policy/:id/edit", element: <AdminPricingPolicyForm /> },
      { path: "schedules", element: <AdminSchedules /> },
      { path: "schedules/cinema/:cinemaId", element: <AdminSchedulesCinema /> },
      { path: "schedules/cinema/:cinemaId/bulk", element: <AdminBulkScheduleForm /> },
      { path: "schedules/new", element: <AdminScheduleForm /> },
      { path: "schedules/:id/edit", element: <AdminScheduleForm /> },
      { path: "bookings", element: <AdminBookings /> },
      { path: "bookings/:id", element: <AdminBookingDetail /> },
      { path: "users", element: <AdminUsers /> },
      { path: "users/new", element: <AdminUserForm /> },
      { path: "users/:id/edit", element: <AdminUserForm /> },
    ],
  },

  {
    path: "/auth",
    children: [{ path: "login", element: <Login /> }],
  },
]);

function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default AppRouter;
