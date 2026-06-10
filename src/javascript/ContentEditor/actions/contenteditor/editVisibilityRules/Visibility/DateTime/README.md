# DateTime Component Refactoring

This folder has been refactored to split the original monolithic `DateTime.jsx` file into smaller, more maintainable modules.

## File Structure

### Components
- **DateTime.jsx** - Main component that orchestrates the visibility rules UI
- **AddNewRule.jsx** - Component for adding a new visibility rule
- **EditRule.jsx** - Component for editing an existing rule
- **NewRule.jsx** - Component that renders the form fields for a rule
- **DatatableRules.jsx** - Component that displays rules using Moonstone DataTable
- **SaveEditedRuleButton.jsx** - Button component for saving edited rules

### Utilities
- **ButtonRenderers.jsx** - Collection of button renderer components (EditButton, DeleteButton, RefreshButton, ButtonRenderer)
- **utils.js** - Utility functions and constants:
  - `jmixConditionalVisibility` - Constant for the mixin name
  - `filterRegularFieldSets()` - Filters fieldsets for visibility
  - `getStatus()` - Returns status information for rules
  - `getConditionLabel()` - Returns human-readable label for condition types

### Exports
- **index.js** - Barrel export file for convenient importing

## Usage

Import the main component:
```javascript
import {DateTime} from './DateTime';
```

Or import specific components/utilities:
```javascript
import {AddNewRule, getConditionLabel} from './DateTime';
```

## Benefits of This Structure

1. **Separation of Concerns** - Each file has a single, clear responsibility
2. **Better Maintainability** - Easier to locate and modify specific functionality
3. **Reusability** - Components and utilities can be imported individually
4. **Testing** - Individual components can be tested in isolation
5. **Code Navigation** - Smaller files are easier to navigate and understand

