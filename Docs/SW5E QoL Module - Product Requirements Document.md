# SW5E Helper Module – Product Requirements Document (PRD)

## 📘 Overview

**SW5E Helper** is a Foundry VTT module designed to enhance and streamline combat and action workflows for the SW5E (Star Wars 5th Edition) system. It provides enhanced dialogs, smart chat cards, resource tracking, and effect management to reduce manual processing and improve user experience during live play sessions.

---

## 🔍 Core Objectives

- Streamline action resolution via a guided workflow system.
- Centralize and simplify combat and power usage actions.
- Provide GMs and players with smart, interactive chat cards.
- Minimize error-prone manual tracking through automation.
- Stay modular and compatible with Foundry V11+, and evolve with Foundry and SW5E system updates.

---

## 🎯 Target Audience

- **Game Masters**: Gain access to GM-only controls such as quick apply, group effects, undo tools, and override buttons.
- **Players**: Use guided dialogs and chat cards for consistent action tracking, simplified combat flow, and clear result interpretation.

---

## 🧱 Core Features

### 1. Workflow Engine

#### Supported Entry Points:

- **Attack** – Handles to-hit resolution and target evaluation.
- **Damage** – Standalone or follow-up damage roll with save integration.
- **Save** – Triggered from attacks or powers, supports multiple targets.
- **Item Usage** – Consumables, grenades, or special-use gear.
- **Force/Tech Power** – Force point tracking, scaling mechanics, attack/save chaining.

#### Chaining Model:

Each workflow constructs and passes a **state object**, stored in flags, to allow chaining:

- Example: Attack → Damage → Apply Effect
- Data: actor, targets, results, resources, modifiers.

#### Manual & Auto Trigger:

- Users initiate via macro or chat card.
- Optional **Opt-in** setting intercepts item/power usage or attack actions and reroutes to SW5E Helper.

---

### 2. Enhanced Dialogs

#### Shared Components:

- Modifier field (Foundry formula)
- Advantage/Disadvantage toggles
- Drop-downs for damage types, conditions, and effects
- Configurable roll behavior (e.g. roll once vs per target)
- Situational mod entry (e.g. cover, range penalties)

#### Features:

- Save/load **presets** tied to item flags
- **Quick-execute** setting: Auto-resolves attack + damage
- Tooltip support using language files (toggleable)
- Defaults sourced from incoming seed object

---

### 3. Smart Chat Cards

#### Structure:

- In-place updates: Modifies same chat message as the workflow progresses
- Expandable sections for roll breakdowns
- Per-target breakdown:
  - Hit/miss
  - Save result
  - Damage taken
  - Condition/effect buttons

#### Interactions:

- Trigger follow-up rolls (e.g. damage, save, skill)
- Apply condition/damage
- Heal HP, restore resources, remove effects
- Players can only apply results to tokens they own
- GM-only Undo: applying results to all targets

---

### 4. Condition & Effect Management

- Effect UUID links open item description
- Chat card apply button or drag-and-drop to apply to target
- Auto-apply to failed targets only (manual override possible)
- Quick apply to all or per target
- Core effect system used if **DAE** is unavailable
- Future integration with condition timers/modules under consideration

---

### 5. Resource Management

#### Supported Resources:

- **Ammo**
- **Force/Tech Points**
- **Consumables**
- **Limited Use Features**

### Functionality

- Add/Remove quantity
- Verify quantity

#### Implementation:

- Handled through centralized utility that receives type and quantity

---

### 6. Configuration & Persistence

#### Storage Locations:

- **User Settings** – Automation toggles, UI preferences
- **Actor Flags** – Preset combos, last used values
- **Static Files** – Workflow templates and layout defaults

#### Workflow State:

- Stored in message flags, rehydrated on next step
- Supports recovery from restart or reload

---

### 7. Compatibility and Extensibility

- **Dice So Nice** assumed to be install but optional
- **DAE** is optional, with conditional automation fallback
- Designed for **Foundry V11**, considering compatibility with V12
- Centralized libraries:
  - Dice rolling
  - Modifier parsing
  - Target handling
  - Resource tracking

---

## 🧪 Development Status

- Current Status: **Planning**
- Focus: Dice engine and workflow infrastructure
- Next:
  1. Data processing
  2. Chat card rendering
  3. Resource integration
  4. Target Management
  5. Undo + state tracking
  6. Save/damage chaining

---

## 🧭 Roadmap and Priorities

| Priority | Feature                  | Notes                                                 |
| -------- | ------------------------ | ----------------------------------------------------- |
| High     | Workflow Engine          | Backbone of module                                    |
| High     | Dice Engine              | Core for all action rolls                             |
| High     | Smart Chat Cards         | In-place updates, chaining, undo                      |
| High     | Resource Management      | Force points, ammo, consumables                       |
| Medium   | Enhanced Dialogs         | Presets, modifiers, tooltips                          |
| Medium   | Effect Application       | Linked conditions, per-target application             |
| Medium   | Save/Undo                | Rollbacks for misclicks or errors                     |
| Low      | Configuration Management | Settings page for user level options                  |
| Low      | UI Theming               | Star Wars-inspired design with iterative improvements |
| Low      | Initiative Tracking      | Possibly scoped for post-v1                           |

---

## ✅ Success Criteria

- All workflows (Attack, Save, Damage, Power, Item) work under default SW5E rules
- Smart chat cards show granular outcomes and chaining history
- Players and GMs can apply or undo actions quickly and reliably
- Positive user feedback on UX and game speed
- Helps bridge functionality gaps left by unsupported modules (e.g. Midi-QOL)

---

## 🧑‍💻 Community and Contribution

- **Open Source** via GitHub
- Alterations and feature requests via **Issues**
- Pull requests welcome post-initial release
- Contribution guidelines to be drafted

---

## 📈 Future Outlook

- Optional support for new Star Wars systems/modules
- Exploration of AI tools for NPC automation
- Integration with enhanced initiative trackers
- Continued DAE/DSN compatibility support
