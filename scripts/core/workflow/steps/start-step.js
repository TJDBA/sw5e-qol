/**
 * Start Step Class
 * Initializes workflow and validates dialog state
 * Location: scripts/core/workflow/steps/start-step.js
 */

import { API } from '../../../api.js';
import { TargetProcessor } from '../../targets/target-processor.js';
import { featureManager } from '../../../features/feature-manager.js';

/**
 * Start Step Class
 * Handles workflow initialization and target processing
 */
export class StartStep {
    constructor() {
        this.targetProcessor = new TargetProcessor();
    }

    /**
     * Process start step
     * @param {Object} state - Workflow state
     * @returns {Object} Updated workflow state
     */
    async process(state) {
        API.log('debug', 'StartStep: Processing workflow initialization');
        
        try {
            // Initialize feature manager if not already done
            if (!featureManager.initialized) {
                await featureManager.init();
            }

            // Validate dialog state
            const validation = this.validateDialogState(state.dialogState);
            if (!validation.isValid) {
                throw new Error(`Invalid dialog state: ${validation.missingProperties.join(', ')}`);
            }

            // Process targets
            const targetResults = await this.targetProcessor.processTargets(state.dialogState);
            state.targets = targetResults.targets;
            state.errors.push(...targetResults.errors);

            // Initialize results structure
            state.results = {
                attackRolls: [],
                targetResults: [],
                criticalHits: [],
                misses: []
            };

            // Advance to next step
            state.stepIndex = 1;
            state.stepName = 'attack';

            API.log('debug', `StartStep: Processed ${state.targets.length} targets`);
            return state;
        } catch (error) {
            API.log('error', 'StartStep: Error during initialization:', error);
            state.errors.push({
                type: 'initialization',
                message: error.message,
                step: 'start',
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Validate dialog state has required properties
     * @param {Object} dialogState - Dialog state to validate
     * @returns {Object} Validation result
     */
    validateDialogState(dialogState) {
        const required = ['ownerID', 'itemID'];
        const missing = required.filter(prop => !dialogState[prop]);
        
        return {
            isValid: missing.length === 0,
            missingProperties: missing
        };
    }
}
