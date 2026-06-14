import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../store/services/authApi";
import { clearCredentials } from "../store/slices/authSlice";
import {
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  Calendar,
  Mail,
  BadgeCheck,
  Loader2,
} from "lucide-react";

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white font-semibold mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

export default function UserDashboard() {
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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-white">User Dashboard</span>
          </div>
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
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome banner */}
        <div className="bg-linear-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome, {user?.first_name || user?.username}!
              </h1>
              <p className="text-indigo-300 text-sm">You&apos;re logged in as a regular user.</p>
            </div>
          </div>
        </div>

        {/* Profile grid */}
        <h2 className="text-slate-300 font-semibold mb-4">Your Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <StatCard
            label="Full name"
            value={`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "—"}
            Icon={User}
            color="bg-indigo-600"
          />
          <StatCard label="Email" value={user?.email} Icon={Mail} color="bg-violet-600" />
          <StatCard label="Username" value={`@${user?.username}`} Icon={BadgeCheck} color="bg-sky-600" />
          <StatCard label="Role" value={user?.role?.toUpperCase()} Icon={ShieldCheck} color="bg-emerald-600" />
          <StatCard
            label="Member since"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            Icon={Calendar}
            color="bg-amber-600"
          />
        </div>

        {/* Session info */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Session info
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your session is secured with{" "}
            <span className="text-indigo-300 font-medium">HttpOnly cookies</span>. The access
            token (15 min) and refresh token (7 days) are stored server-side and automatically
            rotated. They are never accessible from JavaScript.
          </p>
        </div>
      </main>
    </div>
  );
}