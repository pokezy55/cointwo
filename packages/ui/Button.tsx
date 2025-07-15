import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  let base = 'px-4 py-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none ';
  if (variant === 'primary') base += 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
  if (variant === 'secondary') base += 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50';
  if (variant === 'ghost') base += 'bg-transparent text-blue-600 hover:bg-blue-100';
  return (
    <button className={base + ' ' + className} {...props} />
  );
}; 