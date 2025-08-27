# Legal Billing Calculator

A React-based web application for managing legal matters, tracking time entries, and calculating billing summaries. Built with TypeScript and SQLite for local data persistence.

## Features

### Matter Management
- Create new legal matters with client information
- Track matter numbers and descriptions
- Set matter status (active, closed, on hold)
- View all existing matters

### Timekeeper Setup
- Add lawyers and staff with different rate tiers
- Set standard hourly rates for each timekeeper
- Support for partner, senior associate, junior associate, and paralegal tiers

### Time Entry
- Record time spent on matters with detailed descriptions
- Choose between 0.1 hour and 0.25 hour increments using quick-add buttons
- Support for both billable and non-billable time tracking
- Override standard rates per entry when needed
- Real-time calculation preview showing rate and total amount

### Billing Summary
- Generate comprehensive billing summaries by matter
- View total billable/non-billable hours and amounts
- Detailed timekeeper breakdown with individual rates and totals
- Export basic invoice summaries as text files

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd /Users/averybrust/projects/legal-billing-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

### First Time Setup

1. **Add Timekeepers**: Start by adding lawyers and staff in the "Timekeeper Setup" section
2. **Create Matters**: Add your legal matters in the "Matter Management" section
3. **Record Time**: Use the "Time Entry" section to log work performed
4. **View Billing**: Check the "Billing Summary" for invoicing information

## Usage Guide

### Creating a Matter
1. Go to "Matter Management"
2. Click "New Matter"
3. Fill in client name, matter number, description, and status
4. Click "Create Matter"

### Adding Timekeepers
1. Go to "Timekeeper Setup"
2. Click "New Timekeeper"
3. Enter name, select rate tier, and set hourly rate
4. Click "Add Timekeeper"

### Recording Time
1. Go to "Time Entry"
2. Click "New Time Entry"
3. Select date, timekeeper, and matter
4. Enter hours (or use quick-add buttons for 0.1/0.25 increments)
5. Add work description
6. Choose billable/non-billable status
7. Optionally override the standard rate
8. Click "Add Time Entry"

### Generating Billing Summaries
1. Go to "Billing Summary"
2. Select a matter from the dropdown
3. Review the summary with totals and timekeeper breakdown
4. Click "Generate Invoice" to download a basic invoice file

## Database Schema

The application uses SQLite with the following tables:
- `matters`: Client matters and case information
- `timekeepers`: Lawyers and staff with their rates
- `time_entries`: Individual time records with descriptions
- `matter_rates`: Per-matter rate overrides for specific timekeepers

## File Structure

```
src/
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   ├── MatterManagement.tsx    # Matter creation and listing
│   ├── TimekeeperSetup.tsx     # Timekeeper management
│   ├── TimeEntry.tsx           # Time recording interface
│   └── BillingSummary.tsx      # Billing calculations and summaries
├── database.ts                 # SQLite database configuration and operations
├── App.tsx                     # Main application component
└── App.css                     # Application styles
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (not recommended)

## Technical Details

- **Frontend**: React 18 with TypeScript
- **Database**: SQLite3 with Node.js bindings
- **Styling**: Inline CSS for simplicity and learning
- **State Management**: React hooks (useState, useEffect)

## Learning Notes

This project demonstrates:
- React component structure and state management
- TypeScript interfaces and type safety
- SQLite database operations with async/await
- Form handling and validation
- File generation and download
- Real-time calculations and data presentation

## Future Enhancements

Potential improvements for learning:
- Add client management separate from matters
- Implement matter rate overrides per timekeeper
- Add time entry editing and deletion
- Create more detailed invoice templates
- Add date range filtering for billing summaries
- Implement data import/export functionality
- Add user authentication and multi-user support

## Troubleshooting

**Database Issues**: The SQLite database file (`billing.db`) is created automatically in the project root. If you encounter database errors, try deleting this file and restarting the application.

**Development Server**: If the development server doesn't start, ensure all dependencies are installed with `npm install` and that port 3000 is available.

**TypeScript Errors**: This project uses strict TypeScript settings. All components are properly typed, which helps catch errors during development.
