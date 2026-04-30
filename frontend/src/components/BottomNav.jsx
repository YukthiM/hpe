import { NavLink } from 'react-router-dom';
import { Home, Search, Briefcase, User, Grid, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${
        isActive
          ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-500/10'
          : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
      }`
    }
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const WorkerNav = () => (
  <>
    <NavItem to="/dashboard"       icon={<Home size={21} />}         label="Home" />
    <NavItem to="/worker-bookings" icon={<CalendarCheck size={21} />} label="Bookings" />
    <NavItem to="/jobs"            icon={<Briefcase size={21} />}    label="Jobs" />
    <NavItem to="/verify-id"       icon={<Grid size={21} />}         label="Verify" />
    <NavItem to="/edit-profile"    icon={<User size={21} />}         label="Profile" />
  </>
);

const ClientNav = () => (
  <>
    <NavItem to="/discover"    icon={<Home size={21} />}         label="Home" />
    <NavItem to="/my-bookings" icon={<CalendarCheck size={21} />} label="Bookings" />
    <NavItem to="/search"      icon={<Search size={21} />}       label="Search" />
    <NavItem to="/edit-profile" icon={<User size={21} />}        label="Profile" />
  </>
);

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="bottom-nav bg-white/95 dark:bg-surface-2/95 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {user.role === 'worker' ? <WorkerNav /> : <ClientNav />}
        <ThemeToggle />
      </div>
    </nav>
  );
}

