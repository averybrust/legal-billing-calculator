import React, { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import MatterManagement from './components/MatterManagement';
import TimekeeperSetup from './components/TimekeeperSetup';
import TimeEntry from './components/TimeEntry';
import BillingSummary from './components/BillingSummary';

function App() {
  const [currentView, setCurrentView] = useState('matters');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'matters':
        return <MatterManagement />;
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
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
