import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Briefcase, User, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WorkerNav = () => (
  <>
    <NavItem to="/dashboard" icon={<Home size={22} />} label="Home" />
    <NavItem to="/jobs" icon={<Briefcase size={22} />} label="Jobs" />
    <NavItem to="/search" icon={<Search size={22} />} label="Search" />
    <NavItem to="/verify-id" icon={<Grid size={22} />} label="Verify" />
    <NavItem to="/edit-profile" icon={<User size={22} />} label="Profile" />
  </>
);

const ClientNav = () => (
  <>
    <NavItem to="/discover" icon={<Home size={22} />} label="Home" />
    <NavItem to="/search" icon={<Search size={22} />} label="Search" />
    <NavItem to="/edit-profile" icon={<User size={22} />} label="Profile" />
  </>
);

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
        isActive
          ? 'text-primary-400 bg-primary-500/10'
          : 'text-white/40 hover:text-white/70'
      }`
    }
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="bottom-nav bg-surface-2/95 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {user.role === 'worker' ? <WorkerNav /> : <ClientNav />}
      </div>
    </nav>
  );
}
