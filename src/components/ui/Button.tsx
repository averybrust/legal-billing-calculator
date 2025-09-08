import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  asChild = false,
  className = '',
  ...props 
}) => {
  const Comp = asChild ? Slot : 'button';
  const classes = `btn btn--${variant} btn--${size} ${className}`;
  
  return <Comp className={classes} {...props} />;
};

export default Button;