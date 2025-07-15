import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <label className="block w-full">
    {label && <span className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
    <input
      className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-150 ${className}`}
      {...props}
    />
  </label>
); 