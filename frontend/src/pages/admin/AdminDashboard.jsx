import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import movieService from "../../services/movieService";
import cinemaService from "../../services/cinemaService";
import scheduleService from "../../services/scheduleService";
import reportService from "../../services/reportService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    feeRevenue: 0,
    bookingsToday: 0,
    revenueToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1week"); // 1week, 1month, 6months
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [revenueByCinema, setRevenueByCinema] = useState([]);
  const [tableFilter, setTableFilter] = useState("today"); // today, 1week, 1month

  // Generate dummy revenue data based on period
  const generateRevenueData = (period, cinemaId) => {
    const data = [];
    let days = 7;

    if (period === "1month") days = 30;
    else if (period === "6months") {
      // For 6 months, show monthly totals instead of daily
      const cinemaMultipliers = {
        all: 1,
        1: 1.2,
        2: 0.8,
        3: 1.0,
        4: 0.9,
      };

      const multiplier = cinemaMultipliers[cinemaId] || 1;

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        let revenue = 0;

        // Only current month has data, previous months are 0
        if (i === 0) {
          // Current month: generate revenue (sum of ~30 days)
          revenue = (150 + Math.random() * 100) * multiplier; // 150-250M per month
        }

        data.push({
          date: date.toISOString().split("T")[0],
          name: date.toLocaleDateString("en-US", { month: "short" }),
          revenue: parseFloat(revenue.toFixed(1)),
        });
      }

      return data;
    }

    // Base revenue multiplier per cinema (dummy)
    const cinemaMultipliers = {
      all: 1,
      1: 1.2,
      2: 0.8,
      3: 1.0,
      4: 0.9,
    };

    const multiplier = cinemaMultipliers[cinemaId] || 1;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      let revenue = 0;

      // Only generate revenue for last 7 days, rest is 0
      if (i < 7) {
        // Generate random revenue with some pattern
        const baseRevenue = 5 + Math.random() * 5;
        const weekendBonus = date.getDay() === 0 || date.getDay() === 6 ? 3 : 0;
        revenue = (baseRevenue + weekendBonus) * multiplier;
      }

      data.push({
        date: date.toISOString().split("T")[0],
        name: period === "1week" ? date.toLocaleDateString("en-US", { weekday: "short" }) : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: parseFloat(revenue.toFixed(1)),
      });
    }

    return data;
  };

  const revenueData = revenueChartData.length > 0 ? revenueChartData : generateRevenueData(selectedPeriod, selectedCinema);

  // Fetch revenue chart data when period or cinema changes
  useEffect(() => {
    const fetchRevenueChartData = async () => {
      try {
        let days = 7;
        if (selectedPeriod === "1month") days = 30;
        else if (selectedPeriod === "6months") days = 180;

        // For now, use dummy data since we need daily breakdown
        // In production, you'd need to modify the backend to return daily revenue
        const dummyData = generateRevenueData(selectedPeriod, selectedCinema);
        setRevenueChartData(dummyData);
      } catch (err) {
        console.error("Error fetching revenue chart data:", err);
        // Fallback to dummy data
        const dummyData = generateRevenueData(selectedPeriod, selectedCinema);
        setRevenueChartData(dummyData);
      }
    };

    fetchRevenueChartData();
  }, [selectedPeriod, selectedCinema]);

  // Fetch revenue by cinema when table filter changes
  useEffect(() => {
    const fetchRevenueByCinema = async () => {
      try {
        // Dummy data for Summarecon Mall XX2
        let dummyRevenue;

        if (tableFilter === "today") {
          dummyRevenue = [
            {
              name: "Summarecon Mall XX2",
              tickets: 45,
              revenue: 2250000,
              fee: 225000,
            },
          ];
        } else if (tableFilter === "1week") {
          dummyRevenue = [
            {
              name: "Summarecon Mall XX2",
              tickets: 312,
              revenue: 15600000,
              fee: 1560000,
            },
          ];
        } else if (tableFilter === "1month") {
          dummyRevenue = [
            {
              name: "Summarecon Mall XX2",
              tickets: 1248,
              revenue: 62400000,
              fee: 6240000,
            },
          ];
        }

        setRevenueByCinema(dummyRevenue);
      } catch (err) {
        console.error("Error fetching revenue by cinema:", err);
        setRevenueByCinema([]);
      }
    };

    fetchRevenueByCinema();
  }, [tableFilter]);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
  const minRevenue = Math.min(...revenueData.map((d) => d.revenue));

  // Add padding to Y-axis (20% padding on top and bottom)
  const padding = (maxRevenue - minRevenue) * 0.2;
  const chartMax = maxRevenue + padding;
  const chartMin = Math.max(0, minRevenue - padding);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch movies
        const moviesRes = await movieService.getAll();
        const movies = moviesRes.data || [];

        // Fetch cinemas
        const cinemasRes = await cinemaService.getAll();
        const cinemasData = cinemasRes.data || [];
        setCinemas(cinemasData);

        // Fetch revenue report (all time)
        const revenueRes = await reportService.getRevenue();
        const revenueData = revenueRes.data || {};
        const totalFee = revenueData.summary?.total_fee || 0;

        // Fetch today's schedules to count bookings (approximation)
        const today = new Date().toISOString().split("T")[0];
        let totalBookingsToday = 0;

        for (const cinema of cinemasData) {
          try {
            const schedulesRes = await scheduleService.getAll({ id_cabang: cinema.id });
            const todaySchedules = (schedulesRes.data || []).filter((s) => s.date === today);
            totalBookingsToday += todaySchedules.length;
          } catch (err) {
            console.error(`Error fetching schedules for cinema ${cinema.id}:`, err);
          }
        }

        // Fetch today's revenue
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayRevenueRes = await reportService.getRevenue({
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        });
        const todayRevenueData = todayRevenueRes.data || {};
        const todayRevenue = todayRevenueData.summary?.total_revenue || 0;

        setStats({
          totalMovies: movies.length,
          feeRevenue: totalFee,
          bookingsToday: totalBookingsToday,
          revenueToday: (todayRevenue / 1000000).toFixed(1), // Convert to millions
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "Total Movies Active",
      value: loading ? "..." : stats.totalMovies,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5Z" />
            <path stroke-linejoin="round" d="M7 21.5v-19m10 19v-19" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 12H7m0 4H3m4-8H3m18 8h-4m4-8h-4" />
          </g>
        </svg>
      ),
      trend: "Currently showing",
    },
    {
      title: "Bookings Today",
      value: loading ? "..." : stats.bookingsToday,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5">
            <path d="M22 8.879c-.067-1.542-.254-2.546-.78-3.34a4.7 4.7 0 0 0-1.109-1.174C18.945 3.5 17.3 3.5 14.008 3.5H9.993c-3.291 0-4.937 0-6.103.865c-.432.32-.807.717-1.11 1.174c-.525.794-.712 1.798-.78 3.34c-.01.263.216.465.465.465c1.386 0 2.51 1.189 2.51 2.656s-1.124 2.656-2.51 2.656c-.249 0-.476.202-.464.466c.067 1.541.254 2.545.78 3.34a4.7 4.7 0 0 0 1.109 1.173c1.166.865 2.812.865 6.103.865h4.015c3.291 0 4.937 0 6.103-.865c.432-.32.807-.717 1.11-1.174c.525-.794.712-1.798.779-3.34z" />
            <path stroke-linecap="round" d="M13 12h4m-8 4h8" />
          </g>
        </svg>
      ),
      trend: "Schedules today",
    },
    {
      title: "Revenue Today",
      value: loading ? "..." : `Rp ${stats.revenueToday}M`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
            <path stroke-linejoin="round" d="M19.745 13a7 7 0 1 0-12.072-1" />
            <path d="M14 6c-1.105 0-2 .672-2 1.5S12.895 9 14 9s2 .672 2 1.5s-.895 1.5-2 1.5m0-6c.87 0 1.612.417 1.886 1M14 6V5m0 7c-.87 0-1.612-.417-1.886-1M14 12v1" />
            <path
              stroke-linejoin="round"
              d="M3 14h2.395c.294 0 .584.066.847.194l2.042.988c.263.127.553.193.848.193h1.042c1.008 0 1.826.791 1.826 1.767c0 .04-.027.074-.066.085l-2.541.703a1.95 1.95 0 0 1-1.368-.124L5.842 16.75M12 16.5l4.593-1.411a1.985 1.985 0 0 1 2.204.753c.369.51.219 1.242-.319 1.552l-7.515 4.337a2 2 0 0 1-1.568.187L3 20.02"
            />
          </g>
        </svg>
      ),
      trend: "Estimated",
    },
    {
      title: "Fee Revenue",
      value: loading ? "..." : `Rp ${(stats.feeRevenue / 1000000).toFixed(1)}M`,
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
      trend: "Service fees",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-gray-950 text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, Admin!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <h3 className="text-gray-950 text-2xl font-bold mt-2">{stat.value}</h3>
                <p className="text-xs text-gray-600 mt-2">{stat.trend}</p>
              </div>
              <div className="text-3xl text-gray-800">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-950 text-lg font-bold">Revenue Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Track your revenue performance</p>
          </div>
          <div className="flex gap-2">
            {/* Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-950 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1week">1 Week</option>
              <option value="1month">1 Month</option>
              <option value="6months">6 Months</option>
            </select>

            {/* Cinema Filter */}
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-950 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Cinemas</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Chart with Recharts */}
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                interval={selectedPeriod === "1week" ? 0 : selectedPeriod === "1month" ? 4 : 0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `Rp ${value}M`}
                domain={["auto", "auto"]}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#111827", fontWeight: "600", marginBottom: "4px" }}
                itemStyle={{ color: "#3b82f6" }}
                formatter={(value) => [`Rp ${value}M`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-950 mt-1">Rp {revenueData.reduce((sum, item) => sum + item.revenue, 0).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per day</p>
              <p className="text-2xl font-bold text-gray-950 mt-1">Rp {(revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Revenue</p>
              <p className="text-2xl font-bold text-gray-950 mt-1">Rp {Math.max(...revenueData.map((d) => d.revenue)).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Cinema Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-950 text-lg font-bold">Revenue by Cinema</h2>
            <p className="text-sm text-gray-600 mt-1">Performance breakdown per location</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTableFilter("today")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tableFilter === "today" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Today
            </button>
            <button
              onClick={() => setTableFilter("1week")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tableFilter === "1week" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              1 Week
            </button>
            <button
              onClick={() => setTableFilter("1month")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tableFilter === "1month" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              1 Month
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cinema</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tickets Sold</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Fee Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCinema.length > 0 ? (
                revenueByCinema.map((cinema, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-950 font-medium">{cinema.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-950 text-right">{cinema.tickets.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-950 text-right font-medium">Rp {cinema.revenue.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-sm text-gray-950 text-right font-medium">Rp {cinema.fee.toLocaleString("id-ID")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm text-gray-500">
                    No revenue data available for this period
                  </td>
                </tr>
              )}
            </tbody>
            {revenueByCinema.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr className="border-t-2 border-gray-300">
                  <td className="py-3 px-4 text-sm text-gray-950 font-bold">Total</td>
                  <td className="py-3 px-4 text-sm text-gray-950 text-right font-bold">{revenueByCinema.reduce((sum, c) => sum + c.tickets, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-950 text-right font-bold">Rp {revenueByCinema.reduce((sum, c) => sum + c.revenue, 0).toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4 text-sm text-gray-950 text-right font-bold">Rp {revenueByCinema.reduce((sum, c) => sum + c.fee, 0).toLocaleString("id-ID")}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
