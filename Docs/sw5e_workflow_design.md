# SW5E Module UI Design & Data Flow Analysis

## UI Component Patterns Analysis

### Reusable UI Components Identified

#### 1. **Modifier Row Component** (High Reuse Potential)
```javascript
// Pattern found in both attackDialog and damageDialog
{
  label: string,
  typePill?: string,           // "UNTYPED", "CIRCUMSTANCE", etc.
  value: string,               // "+5", "+1", etc.
  toggle?: {label: string, state: boolean},
  disabled?: boolean,
  icons?: string[]             // ["pencil"] for editable items
}
```
**Reuse Cases**: Attack modifiers, damage bonuses, save modifiers, any bonus/penalty system

#### 2. **Add New Item Row Component** (High Reuse Potential)
```javascript
// Pattern for adding modifiers/damage parts/etc.
{
  label: string,              // "Add extra modifier", "Add damage part"
  controls: [
    {kind: "select|stepper|text|button", ...config}
  ]
}
```
**Reuse Cases**: Adding attack modifiers, damage parts, save modifiers, custom effects

#### 3. **Roll Options Section** (Medium Reuse Potential)
```javascript
{
  name: "Roll options",
  rows: [
    {label: "Roll Mode", kind: "select", value: "Public Roll"},
    {label: "Always Show Dialog", kind: "checkbox", checked: true},
    {label: "Keep rule", kind: "radio-group", options: [...]}
  ]
}
```
**Reuse Cases**: Any dialog that performs rolls (attack, damage, saves, skill checks)

#### 4. **Target Block Component** (High Reuse Potential)
```javascript
{
  target: string,             // Target name
  ac?: number,                // Defense value (AC, save DC, etc.)
  result: {
    text: string,             // "Hit", "Miss", "Success", "Failure"
    detail?: string           // "by +6", additional context
  }
}
```
**Reuse Cases**: Attack results, save results, skill check results

#### 5. **Chat Card Base Component** (High Reuse Potential)
```javascript
{
  kind: "chat_card",
  actor: {name: string, badge?: string},
  title?: string,
  tags?: string[],            // ["ATTACK", "MAGICAL"]
  chips?: string[],           // ["Strength +4", "Trained +4"]
  note?: string,
  rollFormula?: string,
  rollDisplay?: {intermediate?: number, total: number},
  actions?: Array<{label: string, icon?: string}>
}
```

## Data Flow Pattern Analysis

### Input Data Structures

#### 1. **Seed Data Object** (Entry Point Data)
```javascript
const seedData = {
  // Core action data
  actionType: "attack" | "damage" | "save" | "item" | "power",
  sourceItem?: ItemData,      // Weapon, spell, feature, etc.
  actor: ActorData,
  
  // Workflow chain data (when chaining from previous workflow)
  targets?: TargetData[],
  previousResults?: ResultData[],
  carriedModifiers?: ModifierData[],
  weaponUsed?: WeaponData,
  hitStatus?: HitResultData[],
  
  // Configuration overrides
  quickExecute?: boolean,
  presetModifiers?: ModifierData[],
  rollMode?: string,
  
  // Resource context
  availableResources?: ResourceData,
  resourceCosts?: CostData[]
}
```

#### 2. **Modifier Data Structure** (High Reuse)
```javascript
const modifierData = {
  id: string,
  label: string,
  value: number,
  type: "untyped" | "circumstance" | "enhancement" | "morale" | ...,
  damageType?: "acid" | "cold" | "fire" | ...,
  source: string,             // "Power of the Mob", "Magic Weapon", etc.
  enabled: boolean,
  editable: boolean,
  removable: boolean
}
```

#### 3. **Target Data Structure**
```javascript
const targetData = {
  id: string,
  name: string,
  ac?: number,
  saves?: {[saveType: string]: number},
  resistances?: string[],
  vulnerabilities?: string[],
  immunities?: string[],
  currentHP?: number,
  maxHP?: number
}
```

### Output Data Structures

#### 1. **Result Data Object** (Workflow Output)
```javascript
const resultData = {
  // Core results
  success: boolean,           // Workflow completed successfully
  rolls?: RollResult[],
  damageDealt?: DamageResult[],
  effectsApplied?: EffectResult[],
  
  // State changes
  resourcesConsumed?: ResourceChange[],
  targetChanges?: TargetChange[],
  
  // Chain data for next workflow
  chainData?: {
    targets: TargetData[],
    hitResults?: HitResult[],
    weaponData?: WeaponData,
    contextModifiers?: ModifierData[]
  },
  
  // Undo data
  undoData?: UndoState
}
```

#### 2. **Undo State Structure**
```javascript
const undoState = {
  timestamp: number,
  resourceChanges: Array<{
    actorId: string,
    resourceType: string,
    previousValue: number,
    changeAmount: number
  }>,
  targetChanges: Array<{
    targetId: string,
    property: string,        // "hp", "conditions", etc.
    previousValue: any,
    changeAmount?: number
  }>,
  effectsApplied?: EffectData[],
  workflowId: string
}
```

## UI Template Specifications

### Dialog Template Structure
```javascript
const dialogTemplate = {
  title: string,
  sections: Array<{
    name: string,
    rows: Array<ModifierRow | ControlRow | DisplayRow>
  }>,
  primaryAction: {
    label: string,
    icons?: string[],
    style: "primary/red" | "primary/blue" | "secondary"
  },
  secondaryActions?: Array<{label: string, action: string}>
}
```

### Chat Card Template Structure
```javascript
const chatCardTemplate = {
  header: {
    actor: {name: string, badge?: string},
    title?: string,
    timestamp: number
  },
  content: {
    tags?: string[],
    chips?: string[],
    note?: string,
    targetBlocks?: TargetBlock[],
    rollDisplay?: RollDisplay,
    customContent?: any
  },
  actions: {
    left?: ActionButton[],
    right?: ActionButton[],
    bottom?: ActionButton[]
  },
  state: {
    workflowId: string,
    resultData?: ResultData,
    undoData?: UndoState
  }
}
```

## Reusable Component Library

### High Priority Components (Build First)
1. **ModifierRowComponent** - Used in attack, damage, save dialogs
2. **AddItemRowComponent** - Used for adding modifiers, damage parts, etc.
3. **TargetBlockComponent** - Used in all result displays
4. **BaseChatCardComponent** - Foundation for all chat cards
5. **RollOptionsComponent** - Used in all roll dialogs

### Medium Priority Components
1. **DamagePartComponent** - Specific to damage workflows but reusable
2. **ResourceCostComponent** - For showing/confirming resource usage
3. **ChainActionComponent** - Buttons for launching next workflow steps

### Specialized Components (Build Later)
1. **EffectApplicationComponent** - For ongoing effect workflows
2. **MultiTargetComponent** - Complex multi-target scenarios
3. **CustomRollComponent** - Advanced roll customization

## Next Steps Recommendations

### Phase 1: Core Component Development
1. **Build ModifierRowComponent** - Most reused, establishes pattern
2. **Create BaseChatCardComponent** - Central to all workflows
3. **Implement TargetBlockComponent** - Critical for result display

### Phase 2: Dialog System
1. **Build AddItemRowComponent** - Enables dynamic content
2. **Create RollOptionsComponent** - Standardizes roll behaviors
3. **Implement dialog templating system**

### Phase 3: Data Integration
1. **Define and implement all data structures above**
2. **Build data transformation utilities** (seed → dialog → result)
3. **Create state management system**

### Phase 4: Workflow Integration
1. **Connect components to workflow phases**
2. **Implement chain data passing**
3. **Build undo system**

## Questions for Component Design

1. **Styling Approach**: Should components be styled with CSS classes, inline styles, or a component library like Tailwind?

2. **State Management**: Should components manage their own state, or should all state be managed at the dialog level?

3. **Validation**: Where should input validation happen - at the component level or dialog level?

4. **Accessibility**: What accessibility features need to be built into the base components?

5. **Theming**: Should components support SW5E-specific theming/colors, or stay generic?

Would you like me to dive deeper into any of these component specifications, or should we move on to creating actual UI mockups for the key dialogs?