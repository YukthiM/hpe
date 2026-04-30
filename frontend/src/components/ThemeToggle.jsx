import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
        bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20
        light:bg-black/5 light:hover:bg-black/10 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-indigo-600" />
      )}
    </button>
  );
}
