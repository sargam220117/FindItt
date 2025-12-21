import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 hover:text-vivid-600 dark:text-slate-300 dark:hover:text-electric-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-6 h-6" />
            ) : (
                <Sun className="w-6 h-6" />
            )}
        </button>
    );
};

export default DarkModeToggle;
