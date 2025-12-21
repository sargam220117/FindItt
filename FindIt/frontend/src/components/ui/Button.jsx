import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-gradient-to-r from-electric-500 to-electric-600 text-white hover:shadow-lg hover:shadow-electric-500/30 focus:ring-electric-500 active:scale-95',
    secondary: 'bg-gradient-to-r from-vivid-500 to-vivid-600 text-white hover:shadow-lg hover:shadow-vivid-500/30 focus:ring-vivid-500 active:scale-95',
    outline: 'border-2 border-vivid-500 text-vivid-600 hover:bg-vivid-50 focus:ring-vivid-500 active:scale-95',
    ghost: 'text-slate-600 hover:bg-vivid-50 focus:ring-vivid-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && !loading && <Icon className="w-5 h-5" />}
      {loading && (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
