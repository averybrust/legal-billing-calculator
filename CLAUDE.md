# Legal Billing Calculator - Claude Context

## Project Overview
React + TypeScript web app for legal time tracking and billing. Professional UI with Clio-inspired design system.

**Current Status**: Professional UI transformation complete - navigation, cards, and primary buttons done
**Last Updated**: 2025-09-03

## Architecture
- **Frontend**: React 19.1.1 + TypeScript + CSS
- **Data**: localStorage via custom Database class
- **Testing**: Jest + React Testing Library (29 passing tests)
- **Build**: Create React App

### Key Components
```
src/
├── App.tsx                 # Main routing
├── database.ts             # localStorage persistence  
└── components/
    ├── MatterManagement    # Advanced search/filtering/CRUD
    ├── TimeEntry           # Full CRUD time tracking
    ├── BillingSummary      # Rate calculations
    └── [Modals/Utils]      # EditTimeEntryModal, etc.
```

## Core Features
1. **Matter Management**: Search, collapsible sections, auto-numbering "[0000] - Name"
2. **Time Entry**: Full CRUD with rate overrides, billable/non-billable toggle
3. **Billing**: Rate precedence (entry > matter > standard), timekeeper breakdown
4. **Professional UI**: Clio-inspired cards, gradients, shadows, animations

## Data Model
```typescript
Matter: id, client_name, matter_number, matter_name, status
Timekeeper: id, name, rate_tier, standard_rate  
TimeEntry: id, matter_id, timekeeper_id, hours, is_billable, override_rate?
MatterRate: id, matter_id, timekeeper_id, override_rate
```

## Testing Strategy
- **Always test after**: Database changes, billing calculations, CRUD operations
- **Test patterns**: Mock localStorage, regex matching for split DOM text, role-based selectors
- **29 tests**: Database (19), Integration (3), UI features (7)
- **Run**: `npm test`

## Current Session Status
✅ **Complete**: Professional navigation, card system, primary buttons
🔄 **In Progress**: Button system (secondary/utility buttons pending)
📂 **Assets**: `/screenshots/` for documentation, `/clio-button-system.js` for reusable styles

## Next Priorities
1. **UI Completion**: Finish button system, form inputs, modals
2. **Export/Import**: Data backup functionality
3. **Responsive**: Mobile-friendly design
4. **Refactoring**: Break up large components

## Commands
```bash
npm start    # Dev server
npm test     # Run tests  
npm build    # Production build
```