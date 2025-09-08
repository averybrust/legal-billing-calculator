import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { FileTextIcon, PersonIcon, ClockIcon, CardStackIcon, ReaderIcon } from '@radix-ui/react-icons';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'matters', label: 'Matters', icon: <FileTextIcon /> },
    { id: 'clients', label: 'Clients', icon: <ReaderIcon /> },
    { id: 'timekeepers', label: 'Team', icon: <PersonIcon /> },
    { id: 'time-entry', label: 'Time Entry', icon: <ClockIcon /> },
    { id: 'billing', label: 'Billing', icon: <CardStackIcon /> },
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--gray-200)',
      backgroundColor: 'white'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-8) var(--space-6) var(--space-8)'
      }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: '600',
          color: 'var(--gray-900)',
          margin: '0 0 var(--space-6) 0'
        }}>
          Legal Billing Calculator
        </h1>
        <Tabs value={currentView} onValueChange={onViewChange}>
          <TabsList>
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                icon={item.icon}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </nav>
  );
};

export default Navigation;