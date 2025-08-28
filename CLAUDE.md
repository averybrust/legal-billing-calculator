# Legal Billing Calculator - Claude Context

## Project Overview
A React + TypeScript web application for legal time tracking and billing management. Built as a learning project with Create React App.

**Current Status**: Enhanced MVP with advanced matter management and time entry editing
**Last Updated**: 2025-08-28 (Session: Added search, collapsible sections, time entry editing)

## Architecture

### Tech Stack
- **Frontend**: React 19.1.1 + TypeScript
- **Data Storage**: localStorage (via custom Database class)
- **Styling**: CSS + inline styles
- **Build Tool**: Create React App / react-scripts

### Key Files & Structure
```
src/
├── App.tsx                      # Main app with view routing
├── database.ts                  # localStorage-based database layer
└── components/
    ├── Navigation.tsx           # Top navigation
    ├── MatterManagement.tsx     # Create/manage legal matters
    ├── TimekeeperSetup.tsx      # Add lawyers/staff with rates
    ├── TimeEntry.tsx            # Record billable/non-billable time
    ├── BillingSummary.tsx       # Calculate and display billing
    ├── EditMatterModal.tsx      # Matter editing interface
    ├── EditTimeEntryModal.tsx   # Time entry editing interface
    ├── ClientAutocomplete.tsx   # Client name autocomplete
    └── MatterMenu.tsx           # Matter dropdown/selection
```

## Core Features Implemented

### 1. Matter Management ⭐ **ENHANCED**
- Create matters with **separate matter name and auto-generated number**
- Matter format: **"[0000] - [Custom Name]"** (e.g., "0000 - Contract Review")
- **Advanced search**: Live search by client name or matter name
- **Collapsible status sections**: Active (expanded), On Hold, Closed (collapsed)
- **Search scope toggle**: "Active Only" vs "All Matters"
- **Sort options**: By recency or by client (alphabetical + matter number)
- **Expand/collapse all** functionality with smart button text
- **Section headers with counts**: "Active (3)", "On Hold (1)", etc.
- Edit existing matters via MatterMenu
- Client name autocomplete from existing matters
- Status tracking with color-coded badges

### 2. Timekeeper Setup  
- Add timekeepers with name, rate tier, standard rate
- Rate tiers: partner, senior_associate, junior_associate, paralegal
- Standard hourly rates for each timekeeper

### 3. Time Entry ⭐ **ENHANCED**
- Record time with date, hours, description
- **Full CRUD operations**: Create, edit, delete time entries
- **EditTimeEntryModal**: Complete editing interface with all fields
- **Delete confirmation**: Safe deletion with user confirmation
- Quick-add buttons for 0.1h and 0.25h increments
- Billable/non-billable toggle
- Rate override capability per entry
- Real-time rate/amount preview in both entry and edit modes
- Links timekeeper to matter
- Edit buttons on all time entry cards

### 4. Billing Summary
- Calculate total billable/non-billable hours and amounts
- Timekeeper breakdown with individual totals
- Rate precedence: entry override > matter rate > standard rate
- Matter-specific rate overrides (stored in matter_rates table)

## Data Model

### Core Interfaces ⭐ **UPDATED**
```typescript
Matter: id, client_name, matter_number, matter_name, description, status, created_at
  // matter_number is now just "0000", "0001" etc.
  // matter_name is the custom descriptive name
  // Display format: "[matter_number] - [matter_name]"
Timekeeper: id, name, rate_tier, standard_rate, created_at  
TimeEntry: id, matter_id, timekeeper_id, date, hours, description, is_billable, override_rate?, created_at
MatterRate: id, matter_id, timekeeper_id, override_rate, created_at
```

### Database Layer ⭐ **ENHANCED**
- Custom Database class in `database.ts`
- localStorage-based persistence (not SQLite as README suggests)
- Auto-incrementing IDs
- Async interface for future database migration
- Rich query methods with joins for reporting
- **New methods**: `updateTimeEntry()`, `deleteTimeEntry()`, `getTimeEntry()`
- **Enhanced**: `getTimeEntries()` now returns `matter_name` field
- **Matter numbering**: Sequential per-client (0000, 0001, etc.)

## Development Patterns & Conventions

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- async/await for database operations
- Inline CSS for styling (no external CSS framework)
- Props interfaces defined inline
- Error handling with try/catch and console.error

### State Management
- Local component state with useState
- useEffect for data loading
- Manual state synchronization between components
- No global state management (Redux/Context)

## Known Technical Debt & Areas for Improvement

### Testing
- **CRITICAL GAP**: No tests currently implemented
- Testing frameworks installed (@testing-library/*) but unused
- Need unit tests for Database class
- Need integration tests for user workflows
- Need to verify test runner works: `npm test`

### Data Persistence 
- localStorage has size/reliability limitations
- Consider migration to IndexedDB or actual backend
- No data backup/export functionality
- README incorrectly mentions SQLite

### UI/UX
- Basic styling, could benefit from component library
- No responsive design considerations
- Limited accessibility features
- Form validation is minimal

### Code Organization
- All business logic in Database class
- Some components are getting large (MatterManagement.tsx)
- No shared utilities/helpers
- Hard-coded styling values

## Development Commands
```bash
npm start        # Development server (http://localhost:3000)
npm test         # Run tests (need to verify this works)
npm run build    # Production build
npm run lint     # Need to check if linting is configured
```

## Testing Infrastructure ✅

### Current Testing Setup (2025-08-28) ⭐ **ENHANCED**
- **Unit Tests**: Comprehensive Database class testing (19 tests covering all core functionality)
- **Integration Tests**: End-to-end user workflow testing (complete billing cycle)
- **Feature Tests**: Complex UI interaction testing (search, collapsible sections, filtering)
- **Test Framework**: Jest + React Testing Library
- **Coverage**: All business logic, key user interactions, advanced UI features
- **Run Command**: `npm test`

### Test Files ⭐ **EXPANDED**
- `src/database.test.ts` - Unit tests for all Database methods (19 tests)
- `src/integration.test.tsx` - Integration tests for complete workflows (3 tests)
- `src/matter-management.test.tsx` - **NEW**: Complex UI feature testing (7 tests)
  - Search functionality (live search, scope toggle)
  - Collapsible sections (expand/collapse, counts)
  - Sort options and filtering
- `src/App.test.tsx` - Basic app rendering test

### Testing Approach & When to Add Tests

**🚨 CRITICAL: Add tests IMMEDIATELY when:**
1. **Adding new Database methods** - Always write unit tests first
2. **Modifying billing calculations** - Test all rate precedence scenarios
3. **Changing data persistence logic** - Test CRUD operations thoroughly
4. **Adding new user workflows** - Add integration test covering full flow

**⚠️ IMPORTANT: Add tests SOON when:**
1. **Adding form validation** - Test edge cases and error states  
2. **Implementing data export/import** - Test file format correctness
3. **Adding search/filtering** - Test various query scenarios ✅ **DONE**
4. **Creating new components** - Test key interactions and state changes

**📝 NICE TO HAVE: Add tests EVENTUALLY when:**
1. **UI improvements** - Test accessibility and responsive behavior
2. **Performance optimizations** - Add performance benchmarks
3. **Error handling improvements** - Test error boundary behavior

### Testing Best Practices Established ⭐ **ENHANCED**
- Mock localStorage for consistent test environment
- Test business logic separately from UI
- Use descriptive test names explaining expected behavior
- Test edge cases (empty data, invalid inputs, rate precedence)
- Clean localStorage between tests to avoid pollution
- **Complex UI Testing Patterns**:
  - Use regex text matching (`/Contract Review/`) for elements split across DOM nodes
  - Test search functionality with `userEvent.type()` for live search
  - Test collapsible sections with click events and visibility assertions
  - Create test data in beforeEach for consistent component state
  - Use `waitFor()` for async state updates in search/filter operations
  - Test UI controls (search scope, sort options) with `selectOptions()`

### When Claude Should Suggest Running Tests

**🔴 ALWAYS suggest `npm test` IMMEDIATELY after:**
1. **Any code changes to Database class** - Ensure business logic integrity
2. **Modifying billing calculations** - Verify rate precedence and math accuracy
3. **Changes to data persistence** - Confirm CRUD operations work correctly
4. **Refactoring existing functionality** - Ensure no regressions introduced
5. **Fixing reported bugs** - Verify the fix works and doesn't break other features

**🟡 SUGGEST `npm test` SOON after:**
1. **Adding new components** - Ensure they integrate properly with existing code
2. **Modifying form validation** - Check edge cases still work
3. **UI changes that affect data flow** - Verify data still flows correctly
4. **Adding new features** - Run full test suite to check for conflicts

**🟢 MENTION `npm test` as good practice after:**
1. **Completing a development session** - Good habit to run before stopping
2. **Before committing code** - Ensure clean commit with passing tests
3. **When user reports unexpected behavior** - Help diagnose if it's a regression

### Test Running Reminders for Claude
- **After any Database method changes**: "Let me run the tests to make sure the billing calculations are still working correctly."
- **After UI changes affecting data**: "I should run the tests to verify the data flow is still intact."
- **When debugging issues**: "Let's run the tests first to see if this reproduces the issue."
- **Before major feature additions**: "I'll run the existing tests to make sure we have a clean baseline."

### Never Suggest Tests When:
- User is just asking questions about the code
- Only reading/viewing files without changes  
- Making purely cosmetic changes (colors, spacing)
- Working on documentation only

## Next Steps & Opportunities

### High Priority
1. **Data export/import functionality** for backup
2. **Improved error handling and user feedback**
3. **Add tests for any new features** (see testing guidance above)

### Medium Priority
1. **UI/UX improvements** (component library, responsive design)
2. **Time entry editing/deletion** (currently create-only) - *Add unit tests for edit/delete operations*
3. **Advanced billing features** (date ranges, multiple invoice formats) - *Test calculation accuracy*
4. **Client management** (separate from matters) - *Test client-matter relationships*

### Low Priority
1. **Backend migration** (if needed for multi-user) - *Test data migration integrity*
2. **Performance optimizations** (currently not needed) - *Add performance benchmarks*
3. **Advanced reporting** (charts, analytics) - *Test report calculation accuracy*

## Development Notes & Decisions

### Previous Session Context
- Project was created and core functionality implemented
- Focus was on building a working MVP for learning React + TypeScript
- Used localStorage for simplicity rather than complex backend setup
- Chose inline styling to avoid additional dependencies

### Current Session (2025-08-28) - Major Enhancements
- **Matter Management Overhaul**: Added search, collapsible sections, advanced filtering
- **Time Entry Editing**: Full CRUD with modal interface and delete confirmation
- **Data Model Changes**: Separated matter name from matter number for better UX
- **Testing Expansion**: Added comprehensive UI interaction testing patterns
- **User Experience**: Significantly improved matter organization and discoverability

### Architecture Decisions
- **Database abstraction**: Created async interface even for localStorage to ease future migration
- **Component structure**: Each major feature as separate component with own state
- **Rate precedence**: Entry-level overrides take priority over matter rates over standard rates
- **Matter numbering**: Auto-generated sequential numbers per client for organization

### New Architecture Decisions (2025-08-28)
- **Search Architecture**: Real-time filtering with separate search/scope/sort state
- **UI State Management**: Complex local state for collapsible sections with smart defaults
- **Component Separation**: Modal components for editing operations (EditTimeEntryModal)
- **Data Enrichment**: Enhanced database queries to return computed fields (matter_name)
- **Filter Logic Separation**: Distinct functions for filtering, sorting, and grouping
- **Progressive Enhancement**: New features built on existing patterns without breaking changes

## Next Session Priorities & Context

### ✅ Recently Completed (2025-08-28)
- Matter management search and organization features
- Time entry editing (full CRUD)
- Comprehensive testing for complex UI interactions
- Matter name/number separation

### 🔧 Known Issues to Address
- Integration tests need updating for new matter format (currently 3 failing)
- React act() warnings in tests (non-breaking, cosmetic)
- Some components getting large (MatterManagement.tsx ~600 lines)

### 🚀 Potential Next Steps
1. **Fix integration tests** to work with new matter format
2. **Export/Import functionality** for data backup (high user value)
3. **Responsive design improvements** (mobile-friendly)
4. **Component refactoring** (extract search logic, break up large components)
5. **Advanced billing features** (date range filters, multiple invoice formats)

### 🎯 Development Best Practices Established
- Always run `npm test` after database or core feature changes
- Use regex text matching for complex UI element testing
- Create comprehensive test data in beforeEach hooks
- Document architectural decisions for future sessions

---

*This file will be updated as development progresses to capture new decisions, features, and context for future Claude sessions.*