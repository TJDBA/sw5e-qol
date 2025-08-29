/**
 * SW5E QoL - Constants
 * Shared constants and enums used throughout the module
 */

// Module constants
export const MODULE_NAME = 'sw5e-qol';
export const MODULE_TITLE = 'SW5E Quality of Life';
export const MODULE_VERSION = '0.1.0';

// Dice constants
export const DICE = {
	SUPPORTED_TYPES: [4, 6, 8, 10, 12, 20, 100],
	MAX_QUANTITY: 1000,
	MAX_SIDES: 10000,
	MAX_MODIFIER: 1000000
};

// Roll modes
export const ROLL_MODES = {
	PUBLIC: 'publicroll',
	GM: 'gmroll',
	BLIND: 'blindroll',
	SELF: 'selfroll'
};

// Check types
export const CHECK_TYPES = {
	ATTACK: 'attack',
	SKILL: 'skill',
	SAVE: 'save',
	ABILITY: 'ability',
	CONTESTED: 'contested'
};

// Workflow phases
export const WORKFLOW_PHASES = {
	IDLE: 'idle',
	INITIALIZING: 'initializing',
	SETUP: 'setup',
	ROLL: 'roll',
	RESOLUTION: 'resolution',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
	ERROR: 'error'
};

// Resource types
export const RESOURCE_TYPES = {
	FORCE_POINTS: 'forcePoints',
	TECH_POINTS: 'techPoints',
	AMMO: 'ammo',
	CONSUMABLES: 'consumables',
	LIMITED_USES: 'limitedUses',
	SUPERIORITY_DICE: 'superiorityDice',
	CUSTOM_1: 'custom1',
	CUSTOM_2: 'custom2',
	CUSTOM_3: 'custom3'
};

// Modifier types
export const MODIFIER_TYPES = {
	UNTYPED: 'untyped',
	CIRCUMSTANCE: 'circumstance',
	ENHANCEMENT: 'enhancement',
	MORALE: 'morale',
	PENALTY: 'penalty',
	RACIAL: 'racial',
	PROFICIENCY: 'proficiency',
	EQUIPMENT: 'equipment',
	FEAT: 'feat',
	SPELL: 'spell'
};

// Damage types
export const DAMAGE_TYPES = {
	ACID: 'acid',
	BLUDGEONING: 'bludgeoning',
	COLD: 'cold',
	FIRE: 'fire',
	FORCE: 'force',
	LIGHTNING: 'lightning',
	NECROTIC: 'necrotic',
	PIERCING: 'piercing',
	POISON: 'poison',
	PSYCHIC: 'psychic',
	RADIANT: 'radiant',
	SLASHING: 'slashing',
	THUNDER: 'thunder',
	ION: 'ion',
	SONIC: 'sonic'
};

// UI constants
export const UI = {
	DIALOG_WIDTH: 600,
	DIALOG_HEIGHT: 500,
	CARD_MAX_WIDTH: 400,
	ANIMATION_DURATION: 200,
	TOOLTIP_DELAY: 500
};

// CSS class prefixes
export const CSS_CLASSES = {
	PREFIX: 'sw5e-qol',
	MODULE: 'sw5e-qol-module',
	DIALOG: 'sw5e-qol-dialog',
	CARD: 'sw5e-qol-card',
	BUTTON: 'sw5e-qol-btn',
	INPUT: 'sw5e-qol-input',
	FORM: 'sw5e-qol-form'
};

// Error codes
export const ERROR_CODES = {
	INVALID_FORMULA: 'INVALID_FORMULA',
	INVALID_TARGET: 'INVALID_TARGET',
	INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
	WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	VALIDATION_FAILED: 'VALIDATION_FAILED',
	SYSTEM_ERROR: 'SYSTEM_ERROR'
};

// Feature flags
export const FEATURES = {
	AUTO_INTERCEPT: 'autoIntercept',
	QUICK_EXECUTE: 'quickExecute',
	SHOW_TOOLTIPS: 'showTooltips',
	ENABLE_UNDO: 'enableUndo',
	RESOURCE_TRACKING: 'resourceTracking',
	DICE_ANIMATIONS: 'diceAnimations'
};

// Default settings
export const DEFAULT_SETTINGS = {
	autoIntercept: false,
	quickExecute: false,
	showTooltips: true,
	enableUndo: true,
	rollMode: 'publicroll',
	enableDiceAnimations: true,
	enableResourceTracking: true
};
