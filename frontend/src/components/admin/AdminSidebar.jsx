import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="m22 10.5l-9.117-7.678a1.37 1.37 0 0 0-1.765 0L2 10.5" />
            <path d="M20.5 5v10.5c0 2.828 0 4.243-.879 5.121c-.878.879-2.293.879-5.121.879h-5c-2.828 0-4.243 0-5.121-.879C3.5 19.743 3.5 18.328 3.5 15.5v-6" />
            <path d="M10.5 11.5h-1v1h1zm4 0h-1v1h1zm-4 4h-1v1h1zm4 0h-1v1h1z" />
          </g>
        </svg>
      ),
      exact: true,
    },
    {
      path: "/admin/movies",
      label: "Movies",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5Z" />
            <path stroke-linejoin="round" d="M7 21.5v-19m10 19v-19" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 12H7m0 4H3m4-8H3m18 8h-4m4-8h-4" />
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/cinemas",
      label: "Cinemas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linejoin="round" d="m16 10l2.15.645c1.373.412 2.06.618 2.455 1.15c.395.53.395 1.248.395 2.681V22" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9h3m-3 4h3" />
            <path stroke-linejoin="round" d="M12 22v-3c0-.943 0-1.414-.293-1.707S10.943 17 10 17H9c-.943 0-1.414 0-1.707.293S7 18.057 7 19v3" />
            <path stroke-linecap="round" d="M2 22h20" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 22V6.717c0-2.51 0-3.766.791-4.389s1.956-.284 4.287.392l5 1.451c1.406.408 2.109.612 2.515 1.169C16 5.896 16 6.653 16 8.169V22" />
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/studio-types",
      label: "Studio Types",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.5"
            d="M17.58 9.71a6 6 0 0 0-7.16 3.58m7.16-3.58A6 6 0 1 1 12 19.972M17.58 9.71a6 6 0 1 0-11.16 0m4 3.58A6 6 0 0 0 10 15.5c0 1.777.773 3.374 2 4.472m-1.58-6.682a6.01 6.01 0 0 1-4-3.58m0 0A6 6 0 1 0 12 19.972"
          />
        </svg>
      ),
    },
    {
      path: "/admin/pricing-policy",
      label: "Pricing Policy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5">
            <path
              stroke-linecap="round"
              d="M20.943 16.835a15.76 15.76 0 0 0-4.476-8.616c-.517-.503-.775-.754-1.346-.986C14.55 7 14.059 7 13.078 7h-2.156c-.981 0-1.472 0-2.043.233c-.57.232-.83.483-1.346.986a15.76 15.76 0 0 0-4.476 8.616C2.57 19.773 5.28 22 8.308 22h7.384c3.029 0 5.74-2.227 5.25-5.165"
            />
            <path d="M7.257 4.443c-.207-.3-.506-.708.112-.8c.635-.096 1.294.338 1.94.33c.583-.009.88-.268 1.2-.638C10.845 2.946 11.365 2 12 2s1.155.946 1.491 1.335c.32.37.617.63 1.2.637c.646.01 1.305-.425 1.94-.33c.618.093.319.5.112.8l-.932 1.359c-.4.58-.599.87-1.017 1.035S13.837 7 12.758 7h-1.516c-1.08 0-1.619 0-2.036-.164S8.589 6.38 8.189 5.8z" />
            <path
              stroke-linecap="round"
              d="M13.627 12.919c-.216-.799-1.317-1.519-2.638-.98s-1.53 2.272.467 2.457c.904.083 1.492-.097 2.031.412c.54.508.64 1.923-.739 2.304c-1.377.381-2.742-.214-2.89-1.06m1.984-5.06v.761m0 5.476v.764"
            />
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/schedules",
      label: "Schedules",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18" />
            <path d="M10 18.5v-4.653c0-.191-.137-.347-.305-.347H9m5 4.998l1.486-4.606a.3.3 0 0 0-.286-.392H13" />
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/bookings",
      label: "Bookings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5">
            <path d="M22 8.879c-.067-1.542-.254-2.546-.78-3.34a4.7 4.7 0 0 0-1.109-1.174C18.945 3.5 17.3 3.5 14.008 3.5H9.993c-3.291 0-4.937 0-6.103.865c-.432.32-.807.717-1.11 1.174c-.525.794-.712 1.798-.78 3.34c-.01.263.216.465.465.465c1.386 0 2.51 1.189 2.51 2.656s-1.124 2.656-2.51 2.656c-.249 0-.476.202-.464.466c.067 1.541.254 2.545.78 3.34a4.7 4.7 0 0 0 1.109 1.173c1.166.865 2.812.865 6.103.865h4.015c3.291 0 4.937 0 6.103-.865c.432-.32.807-.717 1.11-1.174c.525-.794.712-1.798.779-3.34z" />
            <path stroke-linecap="round" d="M13 12h4m-8 4h8" />
          </g>
        </svg>
      ),
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M13 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a4 4 0 0 0 0-8" />
            <path stroke-linejoin="round" d="M11 14H7a5 5 0 0 0-5 5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2a5 5 0 0 0-5-5Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 14a5 5 0 0 1 5 5a2 2 0 0 1-2 2h-1.5" />
          </g>
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/admin/login");
    }
  };

  // Update CSS variable when collapsed state changes
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "4rem" : "16rem");
  }, [isCollapsed]);

  return (
    <>
      {/* Sidebar - Fixed */}
      <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50 ${isCollapsed ? "w-18" : "w-64"} hidden lg:flex`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && <h1 className="text-gray-950 text-xl font-bold">XX2 Admin</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 12c0-3.69 0-5.534.814-6.841a4.8 4.8 0 0 1 1.105-1.243C5.08 3 6.72 3 10 3h4c3.28 0 4.919 0 6.081.916c.43.338.804.759 1.105 1.243C22 6.466 22 8.31 22 12s0 5.534-.814 6.841a4.8 4.8 0 0 1-1.105 1.243C18.92 21 17.28 21 14 21h-4c-3.28 0-4.919 0-6.081-.916a4.8 4.8 0 0 1-1.105-1.243C2 17.534 2 15.69 2 12Z" />
                  <path stroke-linejoin="round" d="M9.5 3v18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 7h1m-1 3h1" />
                </g>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5">
                  <path d="M2 12c0-3.75 0-5.625.955-6.939A5 5 0 0 1 4.06 3.955C5.375 3 7.251 3 11 3h2c3.75 0 5.625 0 6.939.955a5 5 0 0 1 1.106 1.106C22 6.375 22 8.251 22 12s0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C18.625 21 16.749 21 13 21h-2c-3.75 0-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C2 17.625 2 15.749 2 12Zm7.5-8.5v17" />
                  <path stroke-linecap="round" d="M5 7h1.5M5 11h1.5M17 10l-1.226 1.057c-.516.445-.774.667-.774.943s.258.498.774.943L17 14" />
                </g>
              </svg>
            )}
          </button>
        </div>

        {/* User Info */}
        {user && !isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="text-gray-950 font-medium text-sm truncate">{user.email}</p>
            <p className="text-xs text-primary truncate">{user.nama_admin}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive ? "bg-primary text-white" : "text-gray-800 hover:bg-gray-100"}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200">
          {/* Back to User Site */}
          <div className="p-2">
            <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors">
              <span className="text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linejoin="round" d="M8 12c0 6 4 10 4 10s4-4 4-10s-4-10-4-10s-4 4-4 10Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 15H3m18-6H3" />
                  </g>
                </svg>
              </span>
              {!isCollapsed && <span className="font-medium">User Site</span>}
            </NavLink>
          </div>

          {/* Logout Button */}
          <div className="p-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <span className="text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M14.5 6c-.047-1.093-.185-1.79-.598-2.326a3 3 0 0 0-.554-.554c-.81-.62-1.985-.62-4.335-.62h-.501c-2.834 0-4.251 0-5.132.879c-.88.878-.88 2.293-.88 5.121v7c0 2.828 0 4.243.88 5.121s2.298.879 5.132.879h.5c2.351 0 3.526 0 4.336-.62q.314-.241.554-.554c.413-.536.551-1.233.598-2.326m6-6h-12m9.5 3.5s3.5-2.578 3.5-3.5S18 8.5 18 8.5"
                  />
                </svg>
              </span>
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Coming later if needed */}
    </>
  );
}
