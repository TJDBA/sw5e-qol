/**
 * Attack Action Class
 * Handles the execution of attack workflows
 * Location: scripts/core/workflow/actions/attack-action.js
 */

import { API } from '../../../api.js';
import { StartStep } from '../steps/start-step.js';
import { AttackRollStep } from '../steps/attack-roll-step.js';
import { AttackResolveStep } from '../steps/attack-resolve-step.js';
import { CompleteStep } from '../steps/complete-step.js';

/**
 * Attack Action Class
 * Orchestrates the execution of attack workflow steps
 */
export class AttackAction {
    constructor() {
        this.steps = [
            new StartStep(),
            new AttackRollStep(),
            new AttackResolveStep(),
            new CompleteStep()
        ];
    }

    /**
     * Execute the attack workflow
     * @param {Object} state - Workflow state
     * @returns {Object} Final workflow result
     */
    async execute(state) {
        try {
            API.log('info', `AttackAction: Starting attack workflow execution`);
            
            // Execute each step in sequence
            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                const stepName = this.getStepName(i);
                
                API.log('debug', `AttackAction: Executing step ${i}: ${stepName}`);
                
                // Check if workflow was cancelled
                if (state.cancelled) {
                    API.log('info', 'AttackAction: Workflow cancelled by user');
                    break;
                }
                
                // Execute the step
                state = await step.process(state);
                
                // Check for step errors
                if (state.errors && state.errors.length > 0) {
                    const stepErrors = state.errors.filter(e => e.step === stepName);
                    if (stepErrors.length > 0) {
                        API.log('warning', `AttackAction: Step ${stepName} completed with ${stepErrors.length} errors`);
                    }
                }
            }
            
            API.log('info', `AttackAction: Attack workflow execution completed`);
            return state;
            
        } catch (error) {
            API.log('error', 'AttackAction: Error during attack workflow execution:', error);
            
            // Add error to state
            state.errors.push({
                type: 'workflow_execution',
                message: error.message,
                step: 'attack_action',
                timestamp: Date.now()
            });
            
            throw error;
        }
    }

    /**
     * Get step name by index
     * @param {number} index - Step index
     * @returns {string} Step name
     */
    getStepName(index) {
        const stepNames = ['start', 'attack', 'resolve', 'complete'];
        return stepNames[index] || 'unknown';
    }

    /**
     * Get step by name
     * @param {string} stepName - Name of the step
     * @returns {Object|null} Step instance or null
     */
    getStep(stepName) {
        const stepIndex = ['start', 'attack', 'resolve', 'complete'].indexOf(stepName);
        return stepIndex >= 0 ? this.steps[stepIndex] : null;
    }

    /**
     * Execute a specific step
     * @param {Object} state - Workflow state
     * @param {string} stepName - Name of the step to execute
     * @returns {Object} Updated workflow state
     */
    async executeStep(state, stepName) {
        const step = this.getStep(stepName);
        if (!step) {
            throw new Error(`Unknown step: ${stepName}`);
        }
        
        return await step.process(state);
    }
}