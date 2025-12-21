import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = true,
  gradient = false,
  neon = false,
  ...props
}) => {
  const baseStyles = 'bg-white dark:bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 border border-slate-100 dark:border-slate-700';

  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

  const shadowStyles = neon ? 'shadow-lg shadow-vivid-500/20 dark:shadow-vivid-500/30' : 'shadow-md';

  const gradientBg = gradient ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${shadowStyles} ${gradientBg} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
