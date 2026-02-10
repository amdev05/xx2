import { Link } from "react-router-dom";
import { useState } from "react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Backend doesn't have user management endpoints yet
  const users = [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-950 text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage customers and admin users</p>
        </div>
        <Link to="/admin/users/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Add User
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Bookings</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Join Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm text-gray-950 font-medium">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{user.phone}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${user.role === "admin" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-950">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${user.status === "active" ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-600"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{user.totalBookings}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{user.joinDate}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex gap-2">
                      <Link to={`/admin/users/${user.id}/edit`} className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                        Edit
                      </Link>
                      <button
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          user.status === "active" ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30" : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        }`}
                      >
                        {user.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No users available</p>
          </div>
        )}
      </div>
    </div>
  );
}
