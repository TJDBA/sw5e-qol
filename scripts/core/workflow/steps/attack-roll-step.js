/**
 * Attack Roll Step Class
 * Handles dice building and rolling for attacks
 * Location: scripts/core/workflow/steps/attack-roll-step.js
 */

import { API } from '../../../api.js';
import { DiceBuilder } from '../../dice/dice-builder.js';
import { DiceRoller } from '../../dice/dice-roller.js';
import { featureManager } from '../../../features/feature-manager.js';

/**
 * Attack Roll Step Class
 * Manages attack dice building and rolling
 */
export class AttackRollStep {
    constructor() {
        this.diceBuilder = new DiceBuilder();
        this.diceRoller = new DiceRoller();
    }

    /**
     * Process attack roll step
     * @param {Object} state - Workflow state
     * @returns {Object} Updated workflow state
     */
    async process(state) {
        API.log('debug', 'AttackRollStep: Processing attack rolls');
        
        try {
            // Apply feature modifications before building dice pools
            await this.applyFeatureModifications(state, 'attack.roll');

            // Build dice pools for attack
            const diceConfig = await this.diceBuilder.buildAttackPool(state);
            state.dicePools.attack = diceConfig;

            // Apply feature modifications after building but before rolling
            await this.applyFeatureModifications(state, 'attack.roll.beforeRoll');

            // Roll attack dice
            const rollResults = await this.diceRoller.rollAttackPool(diceConfig, state);
            state.results.attackRolls = rollResults;

            // Apply feature modifications after rolling
            await this.applyFeatureModifications(state, 'attack.roll.afterRoll');

            // Advance to next step
            state.stepIndex = 2;
            state.stepName = 'resolve';

            API.log('debug', `AttackRollStep: Completed ${rollResults.length} attack rolls`);
            return state;
        } catch (error) {
            API.log('error', 'AttackRollStep: Error during attack rolling:', error);
            state.errors.push({
                type: 'attack_roll',
                message: error.message,
                step: 'attack',
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Apply feature modifications for this step
     * @param {Object} state - Workflow state
     * @param {string} stepId - Step ID for feature matching
     */
    async applyFeatureModifications(state, stepId) {
        try {
            // Get features that affect this step
            const features = featureManager.getFeaturesForStep(stepId);
            
            if (features.length === 0) {
                API.log('debug', `AttackRollStep: No features found for step ${stepId}`);
                return;
            }

            API.log('debug', `AttackRollStep: Found ${features.length} features for step ${stepId}`);
            
            // Apply each feature's modifications
            for (const feature of features) {
                try {
                    // Check if feature is enabled for this actor
                    const actor = game.actors.get(state.dialogState.ownerID);
                    if (!actor) {
                        API.log('warning', `Actor ${state.dialogState.ownerID} not found for feature ${feature.id}`);
                        continue;
                    }

                    // Check if feature is available to this actor
                    if (!featureManager.isFeatureAvailable(actor, feature)) {
                        continue;
                    }

                    // Apply feature modifications
                    // TODO: Implement specific feature modification logic
                    API.log('debug', `AttackRollStep: Applying feature ${feature.id} for step ${stepId}`);
                    
                } catch (error) {
                    API.log('error', `AttackRollStep: Error applying feature ${feature.id}:`, error);
                }
            }
        } catch (error) {
            API.log('error', `AttackRollStep: Error in applyFeatureModifications:`, error);
        }
    }
}
