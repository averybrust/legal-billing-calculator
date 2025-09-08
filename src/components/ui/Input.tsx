import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className = '', icon, ...props }) => {
  const baseStyles = 'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  if (icon) {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input 
          className={`${baseStyles} pl-10 ${className}`} 
          {...props} 
        />
      </div>
    );
  }
  
  const classes = `${baseStyles} ${className}`;
  
  return <input className={classes} {...props} />;
};

export default Input;