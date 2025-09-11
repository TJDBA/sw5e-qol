/**
 * Attack Resolve Step Class
 * Handles hit/miss determination and critical hit detection
 * Location: scripts/core/workflow/steps/attack-resolve-step.js
 */

import { API } from '../../../api.js';
import { D20Processor } from '../../dice/d20-processor.js';
import { CriticalDetector } from '../../dice/critical-detector.js';
import { featureManager } from '../../../features/feature-manager.js';

/**
 * Attack Resolve Step Class
 * Manages attack resolution and critical hit detection
 */
export class AttackResolveStep {
    constructor() {
        this.d20Processor = new D20Processor();
        this.criticalDetector = new CriticalDetector();
    }

    /**
     * Process attack resolve step
     * @param {Object} state - Workflow state
     * @returns {Object} Updated workflow state
     */
    async process(state) {
        API.log('debug', 'AttackResolveStep: Processing attack resolution');
        
        try {
            // Apply feature modifications before resolution
            await this.applyFeatureModifications(state, 'attack.resolve');

            const { attackRolls, targets } = state.results;
            const targetResults = [];

            // Process each target
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                const attackRoll = attackRolls[i] || attackRolls[0]; // Use first roll if separate rolls disabled
                
                if (!target || target.error) {
                    targetResults.push({
                        targetId: target?.id || 'unknown',
                        error: target?.error || 'Target not found',
                        hit: false,
                        critical: false
                    });
                    continue;
                }

                // Apply feature modifications for this specific target
                await this.applyFeatureModifications(state, 'attack.resolve.target', { target, attackRoll, targetIndex: i });

                // Determine hit/miss
                const hitResult = this.d20Processor.checkAttack(attackRoll, target);
                
                // Check for critical hit
                const criticalResult = this.criticalDetector.checkCritical(attackRoll, hitResult, target);
                
                targetResults.push({
                    targetId: target.id,
                    targetName: target.name,
                    attackRoll: attackRoll.total,
                    naturalRoll: attackRoll.terms[0]?.results[0]?.result || 0,
                    targetAC: target.ac,
                    hit: hitResult.hit,
                    critical: criticalResult.isCritical,
                    criticalType: criticalResult.type,
                    advantage: attackRoll.options.advantage || false,
                    disadvantage: attackRoll.options.disadvantage || false
                });
            }

            state.results.targetResults = targetResults;

            // Apply feature modifications after resolution
            await this.applyFeatureModifications(state, 'attack.resolve.after');

            // Advance to next step
            state.stepIndex = 3;
            state.stepName = 'complete';

            API.log('debug', `AttackResolveStep: Resolved ${targetResults.length} targets`);
            return state;
        } catch (error) {
            API.log('error', 'AttackResolveStep: Error during attack resolution:', error);
            state.errors.push({
                type: 'attack_resolve',
                message: error.message,
                step: 'resolve',
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Apply feature modifications for this step
     * @param {Object} state - Workflow state
     * @param {string} stepId - Step ID for feature matching
     * @param {Object} [context] - Additional context for feature processing
     */
    async applyFeatureModifications(state, stepId, context = {}) {
        try {
            // Get features that affect this step
            const features = featureManager.getFeaturesForStep(stepId);
            
            if (features.length === 0) {
                API.log('debug', `AttackResolveStep: No features found for step ${stepId}`);
                return;
            }

            API.log('debug', `AttackResolveStep: Found ${features.length} features for step ${stepId}`);
            
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
                    API.log('debug', `AttackResolveStep: Applying feature ${feature.id} for step ${stepId}`);
                    
                } catch (error) {
                    API.log('error', `AttackResolveStep: Error applying feature ${feature.id}:`, error);
                }
            }
        } catch (error) {
            API.log('error', `AttackResolveStep: Error in applyFeatureModifications:`, error);
        }
    }
}
