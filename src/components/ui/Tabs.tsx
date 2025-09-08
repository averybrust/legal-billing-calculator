import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import './Tabs.css';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    style={{
      display: 'inline-flex',
      height: '3rem',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--gray-100)',
      padding: 'var(--space-1)'
    }}
    className={className}
    {...props}
  />
));

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: React.ReactNode;
  }
>(({ className = '', icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      borderRadius: 'calc(var(--radius) - 2px)',
      padding: 'var(--space-2) var(--space-4)',
      fontSize: 'var(--text-sm)',
      fontWeight: '500',
      transition: 'all 0.2s',
      color: 'var(--gray-600)',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer'
    }}
    className={className}
    {...props}
  >
    {icon && <span style={{ marginRight: 'var(--space-2)' }}>{icon}</span>}
    {children}
  </TabsPrimitive.Trigger>
));

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    style={{
      marginTop: 'var(--space-6)'
    }}
    className={className}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };