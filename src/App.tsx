import React, { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import MatterManagement from './components/MatterManagement';
import ClientManagement from './components/ClientManagement';
import TimekeeperSetup from './components/TimekeeperSetup';
import TimeEntry from './components/TimeEntry';
import BillingSummary from './components/BillingSummary';

function App() {
  const [currentView, setCurrentView] = useState('matters');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'matters':
        return <MatterManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'timekeepers':
        return <TimekeeperSetup />;
      case 'time-entry':
        return <TimeEntry />;
      case 'billing':
        return <BillingSummary />;
      default:
        return <MatterManagement />;
    }
  };

  return (
    <div className="App">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--space-8)'
      }}>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
