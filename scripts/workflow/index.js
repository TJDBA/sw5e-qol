/**
 * SW5E QoL - Workflow Module Index
 * Central export point for all workflow functionality
 */

// Main workflow controller
export { WorkflowOrchestrator } from './workflow-orchestrator.js';

// Action workflow exports
export { AttackAction } from './actions/attack-action.js';
export { DamageAction } from './actions/damage-action.js';
export { SaveAction } from './actions/save-action.js';
export { EffectApplicator } from './actions/effect-applicator.js';

// Constants
export const WORKFLOW_VERSION = '0.1.0';
export const SUPPORTED_WORKFLOWS = ['attack', 'damage', 'save', 'effect'];
export const WORKFLOW_PHASES = {
	attack: ['attack_setup', 'attack_roll', 'attack_resolution'],
	damage: ['damage_setup', 'damage_roll', 'damage_resolution'],
	save: ['save_setup', 'save_roll', 'save_resolution'],
	effect: ['effect_setup', 'effect_application', 'effect_resolution']
};
