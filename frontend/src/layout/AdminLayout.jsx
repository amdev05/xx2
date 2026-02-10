import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar - Fixed */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[var(--sidebar-width,16rem)]">
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
