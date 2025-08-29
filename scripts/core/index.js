/**
 * SW5E QoL - Core Module Index
 * Central export point for all core functionality
 */

// scripts/core/index.js
// Core module exports

// State Management
export { StateManager } from './state/state-manager.js';

// Dice System (placeholders for now)
export { DiceEngine } from './dice/dice-engine.js';
export { FormulaParser } from './dice/formula-parser.js';
export { D20Engine } from './dice/d20-engine.js';

// Constants
export const CORE_VERSION = '0.1.0';
export const SUPPORTED_DICE = [4, 6, 8, 10, 12, 20, 100];
export const SUPPORTED_CHECK_TYPES = ['attack', 'save', 'ability', 'skill', 'tool'];
