import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Search for items...',
  value = '',
  onChange,
  onSubmit,
  loading = false,
  className = ''
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-vivid-500 to-electric-500 rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-vivid-500 dark:hover:border-vivid-400 transition-all duration-300 focus-within:shadow-lg focus-within:border-vivid-500 dark:focus-within:border-vivid-400">
          <Search className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />

          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base"
          />

          {loading && (
            <svg className="absolute right-4 w-5 h-5 text-vivid-500 dark:text-vivid-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Press Enter to search</p>
    </div>
  );
};

export default SearchBar;
