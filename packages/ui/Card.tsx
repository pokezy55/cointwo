import React from 'react';
 
export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = '', children }) => (
  <div className={`backdrop-blur-md bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
); 