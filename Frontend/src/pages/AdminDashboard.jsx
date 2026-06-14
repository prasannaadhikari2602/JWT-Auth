import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../store/services/authApi";
import { clearCredentials } from "../store/slices/authSlice";
import {
  Shield,
  LogOut,
  Users,
  Activity,
  Key,
  Settings,
  Database,
  Loader2,
} from "lucide-react";

const DEMO_STATS = [
  { label: "Total Users", value: "1,284", change: "+12%", Icon: Users, color: "bg-indigo-600" },
  { label: "Active Sessions", value: "48", change: "+3", Icon: Activity, color: "bg-emerald-600" },
  { label: "JWT Tokens Issued", value: "9,310", change: "today", Icon: Key, color: "bg-violet-600" },
  { label: "DB Records", value: "42,891", change: "total", Icon: Database, color: "bg-amber-600" },
];

const JWT_DETAILS = [
  ["Access token", "15 min · HttpOnly cookie"],
  ["Refresh token", "7 days · HttpOnly cookie"],
  ["Rotation", "New refresh issued on every refresh"],
  ["Blacklisting", "Old refresh tokens blacklisted in DB"],
  ["Transport", "Cookies — never exposed to JS"],
];

const QUICK_ACTIONS = [
  { label: "Manage users", Icon: Users },
  { label: "View audit logs", Icon: Activity },
  { label: "Token blacklist", Icon: Key },
  { label: "System settings", Icon: Settings },
];

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearCredentials());
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">Admin Panel</span>
            <span className="ml-2 text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">
              {user?.first_name || user?.username}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 disabled:opacity-60 transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Banner */}
        <div className="bg-linear-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-violet-300 text-sm">
            Full system access · Logged in as{" "}
            <span className="font-semibold text-white">{user?.email}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {DEMO_STATS.map(({ label, value, change, Icon, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">{label}</p>
                <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* JWT summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              JWT Token Strategy
            </h2>
            <ul className="space-y-3 text-sm text-slate-400">
              {JWT_DETAILS.map(([k, v]) => (
                <li key={k} className="flex items-start gap-2">
                  <span className="text-violet-400 font-medium w-28 shrink-0">{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-400" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ label, Icon }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2.5 rounded-lg transition text-left"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}