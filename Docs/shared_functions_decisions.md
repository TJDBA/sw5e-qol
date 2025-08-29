# Shared Functions Architecture Decisions

## Organization Style: Option B - Granular Function Collections
**Rationale**: Smaller, focused scripts are easier to trace through and maintain. Each file contains a small set of specific tasks.

## 1. Dice Rolling System
**File Structure**: Multiple focused files
- `dice-parser.js` - formula parsing and validation
- `roll-builder.js` - building roll pools and executing rolls  
- `roll-modifiers.js` - advantage, rerolls, min dice, etc.

**Owns**: Formula parsing, roll execution, dice animations, roll mode handling

**Key Requirement**: Things that affect rolls must be done before `buildRollPool` as advantage/crits matter beyond that point

**Sample Functions**:
- `parseRollFormula(formula)` - validate and break down dice expressions
- `buildRollPool(formulaArray, modifiers)` - create roll objects
- `executeRolls(rollPool, rollMode)` - perform rolls with public/private/blind
- `applyRollAdvantage(rollPool, type)` - advantage/disadvantage mechanics
- `animateRolls(rollArray)` - trigger dice animations

## 2. Resource Management System  
**File Structure**: 
- `resource-validation.js` - checking availability
- `resource-consumption.js` - spending/refunding resources
- `resource-tracking.js` - getting current values

**Owns**: Resource validation, consumption tracking, custom field handling

**Simplified Functions**:
- `validateResources(actor, costs)` - check if resources are available
- `changeResources(actor, costs, operation)` - spend or refund resources
- `getCurrentResources(actor, resourceTypes)` - get current values

**Data Approach**: Resource data object stores specific information for all types, with config file defining object paths. Allows for updates if system paths change.

**Resource Types**: Force/Tech points, ammo, consumables, limited uses, superiority dice, 3 custom tracking fields

## 3. Target Management System
**File Structure**:
- `target-selection.js` - choosing and validating targets
- `target-templates.js` - AOE template handling  
- `target-modification.js` - changing targets post-generation
- `target-data.js` - retrieving target information

**Owns**: Target validation, selection changes, template handling, data retrieval

**Sample Functions**:
- `validateTargets(targetArray)` - check if targets still valid
- `replaceTargets(oldTargets, newTargets)` - swap target selection
- `handleAOETemplate(templateData)` - manage area effect targeting
- `organizeTargetsByType(targets)` - group targets for processing
- `retrieveTargetData(targetArray)` - gather additional target information
- `pingTargets(targetArray)` - visual target highlighting

## 4. Master State Object
**Implementation**: Class-based approach

**Storage**: Full state object stored on chat cards for workflow chaining

**Update Pattern**: Mixed approach - functions can modify state object directly based on scope, but should pass it back

**Structure Includes**:
- `rollData: {formula, results, mode, etc.}`
- `resourceData: {costs, available, consumed, etc.}`
- `targetData: {selected, validated, results, etc.}`
- `modifierData: {active, applied, sources, etc.}`
- `workflowState: {phase, chainData, undoState, etc.}`

## Action Specific Engines

### 1. D20 Roll Engine
**File Structure**: Single focused file - `d20-engine.js`

**Owns**: d20 vs target number resolution, shared modifiers, contested rolls

**Core Functions**:
- `executeD20Roll(formula, rollOptions)` - core d20 roll execution
- `calculateD20Results(rollResult, targetNumber, checkType)` - result determination with scalable check types
- `handleContestedRoll(participants)` - convenience function for contested scenarios  
- `applyD20Modifiers(baseRoll, modifiers)` - apply bonuses/penalties to d20

**Key Decisions**:
- **Critical Ranges**: Calculated from weapon stats + powers/features, stored in d20Check sub-object attached to master state
- **Contested Rolls**: Single roll each, contested function manages the workflow and calls other functions
- **Critical Failures**: Return as result only - no special mechanical handling beyond automatic failure
- **Check Types**: Parameter-driven results allow scaling for future degree-of-success mechanics

### 2. Damage/Healing Engine
**File Structure**: `damage-healing-engine.js`

**Owns**: Damage/healing application logic, type-specific calculations, resistance handling

**Core Functions**:
- `applyDamageTypes(damageArray, targetResistances)` - handle resistance/vulnerability/immunity
- `calculateHealingApplication(healAmount, target)` - temp HP first, then HP restoration
- `processDamageApplication(damage, target)` - apply damage with all modifiers
- `getDamageByType(rollData, damageType)` - retrieve specific damage type from roll data (shared with dice engine)

**Key Decisions**:
- **Damage Types**: Retrieved from roll data, accessible by any function needing type information
- **Healing Logic**: Temp HP first, then HP, potential 3rd category for effect-based HP
- **Critical Damage**: Handled by doubling dice in dice engine (per sample damage.js), not multiplication
- **Resistance Processing**: Handled in this engine along with damage application

**Integration**: Works closely with shared dice functions for damage type retrieval and processing

## Dialog System

### Template Structure & Component Reusability

**Main Functionality Areas**:
- **Template Management**: Load base templates, merge with components, handle caching
- **Component Library**: Reusable UI pieces that configure themselves from raw data  
- **Conditional Logic**: Analyze character at dialog build time to include relevant components
- **Configuration System**: Declarative config defines what gets included in each dialog type

**Key Decisions**:
- **Component Data**: Components receive raw data and handle their own formatting internally
- **Character Analysis**: Happens at dialog build time (not pre-cached) to account for leveling, items, effects changes
- **Template Approach**: Declarative configuration for template composition (updating config vs rewriting code)
- **Loading Strategy**: Foundry limitations may require different approach than on-demand loading

**Architecture Pattern**: 
- Base Templates (HBS/JS objects) + Component Library (JS functions) + Dynamic Features (conditional JS files)
- Hierarchical configuration system for defining dialog composition

## Card System

### Main Functionality Areas

**Card Creation & Management**:
- **Card Builder**: Create new cards for major workflow steps  
- **Card Updater**: Update existing cards post-resolution (damage rolled → damage applied)
- **Template System**: Config-driven templates consistent with dialog system approach
- **State Persistence**: Hidden condensed data storage on cards (flags or similar) that persists across sessions

**Sample Functions**:
- `buildCardFromTemplate(templateType, resultData, masterState)` - construct card from results
- `updateExistingCard(cardId, newData, updateType)` - modify cards based on workflow phase
- `handleCardActions(cardId, actionType)` - process user clicks on card buttons
- `chainToNextWorkflow(cardId, entryPoint, chainData)` - launch next workflow with carried data
- `condenseStateForStorage(masterState, workflowPhase)` - optimize state data for card storage
- `restoreStateFromCard(cardId)` - extract state data for workflow continuation/undo

**Card Template Types**:
- **Action Cards**: Spell casting, attack initiation (show options before execution)
- **Result Cards**: Attack results, damage results (show outcomes + next actions)  
- **Resolution Cards**: Updated versions showing final application (damage dealt, saves made)

**User Interaction Handling**:
- **Button Actions**: Workflow chaining (Damage, Save, Critical buttons)
- **Context Menus**: Right-click for rerolls, manual adjustments (scope TBD)
- **Target Management**: Change targets, ping targets, place templates
- **Result Modification**: Manual damage adjustment, override results

**Key Decisions**:
- **Update Strategy**: Workflow phase-driven (create new for major steps, update for resolutions)
- **Template Reusability**: Common patterns (actionBar, rollFormula, tags) as reusable components
- **State Storage**: Condensed version optimized for storage, not full master state
- **Undo Philosophy**: Cards retain minimal data for undo; full retry requires new action from that card

## Data Processing

### Main Functionality Areas

**Owns**: Data validation, sanitization, formatting, conflict detection, seed object construction

**Sample Functions**:
- `verifyDialogData(dialogData)` - validate required fields, check data types, detect conflicts
- `normalizeUserInput(rawData)` - sanitize and format user inputs (especially dice formulas)  
- `detectDataConflicts(inputData, masterState)` - check for known conflicts or invalid combinations
- `buildSeedObject(normalizedData, chainData, masterState)` - construct final seed object for engine
- `sanitizeDiceFormula(formula)` - clean and validate dice expressions
- `validateResourceRequirements(seedData, actor)` - ensure required resources are available

**Key Decisions**:
- **Verification Focus**: Business logic validation (resource availability, workflow requirements)
- **Formula Sanitization**: Invalid formula detection and prevention
- **Conflict Detection**: Target validation issues, workflow state conflicts
- **Seed Object Handling**: Modify existing seed object if passed in, rather than always creating new

## Configuration Management

### Main Functionality Areas

**Owns**: User preferences, module settings, dialog configurations, template definitions, feature flags

**Sample Functions**:
- `loadUserPreferences(userId)` - get user-specific settings
- `getDialogConfig(dialogType, actor)` - retrieve template configuration for specific dialog
- `updateConfiguration(configType, newSettings)` - save configuration changes
- `getFeatureFlags(actor)` - determine which features are enabled for character
- `validateConfiguration(configData)` - ensure config settings are valid

**Key Decisions**:
- **Configuration Scope**: User level, Actor level, World level with inheritance rules
- **Storage Strategy**: Mixed locations based on config type (user settings, flags, static JSON files, etc.)
- **Configuration Categories**: UI preferences, mechanical settings, template configurations (not performance settings)
- **Loading Strategy**: Depends on configuration type - some loaded at init, some on-demand

## Error Handling

### Main Functionality Areas

**Owns**: Error detection, user notification, recovery strategies, workflow rollback, graceful degradation

**Sample Functions**:
- `handleValidationError(errorType, errorData, recoveryOptions)` - manage data validation failures
- `executeErrorRecovery(errorContext, recoveryStrategy)` - implement recovery actions
- `rollbackWorkflow(masterState, rollbackPoint)` - return to previous safe state
- `notifyUser(errorType, message, actions)` - display error messages with options
- `gracefulDegradation(failedComponent, fallbackOptions)` - handle partial failures

**Key Decisions**:
- **Recovery Strategy**: Complete workflow cancellation for most errors, skip over only for specific minor issues
- **User Notification**: Popup dialogs and console logging, configurable in settings
- **Rollback Scope**: Return to last card interaction point
- **Graceful Degradation**: TBD - will determine based on specific error scenarios

## Technical Architecture Decisions

### 1. Module Structure & File Organization ✅
**Decision**: Functional area structure based on provided example
- `/core/` - shared functions (dice, state, actors, utils)
- `/workflow/` - action-specific engines  
- `/ui/` - dialog and card systems
- `/data/` - configuration management
- `/integrations/` - SW5E system adapter

### 2. Foundry Integration Strategy
**Approach**: Run parallel to SW5E native functionality
- **User Control**: Opt-in via settings page (attached to Foundry's configure settings)
- **Future Path**: May replace native dialogs as they're extremely basic
- **Hook Strategy**: Use `/workflow/hooks.js` for registration, `/integrations/sw5e-adapter.js` for system isolation
- **Self-Contained**: Keep core functionality system-agnostic where possible

### 3. Module Initialization & Loading
**Pattern**: Follow Foundry best practices
- `Hooks.once('init')` - Load configuration, register settings
- `Hooks.once('ready')` - Initialize workflows, register hooks, load templates, setup UI

### 4. Import/Export Strategy
**Decision**: ES6 modules throughout
- Clean import/export between files
- No global namespace complexity

### 5. State Management Architecture  
**Simplified Approach**: No central state tracking needed
- **State Flow**: Card-to-card through workflow chains
- **Master State Class**: Defined in `/core/state/manager.js` 
- **Instance Management**: Each workflow independent, state passes through cards
- **Persistence**: Card flag storage handles persistence via `/data/storage.js`

### 6. Integration Requirements
- **Foundry Compatibility**: Current versions only (no backwards compatibility)
- **Settings Interface**: Build settings page for Foundry's native configure interface
- **Hook Priority**: TBD - will determine during implementation