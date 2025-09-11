/**
 * Complete Step Class
 * Finalizes workflow and prepares results for chat card
 * Location: scripts/core/workflow/steps/complete-step.js
 */

import { API } from '../../../api.js';

/**
 * Complete Step Class
 * Handles workflow completion and result preparation
 */
export class CompleteStep {
    /**
     * Process complete step
     * @param {Object} state - Workflow state
     * @returns {Object} Updated workflow state
     */
    async process(state) {
        API.log('debug', 'CompleteStep: Finalizing workflow');
        
        try {
            // Mark workflow as complete
            state.workflowComplete = true;
            state.completionTime = Date.now();
            state.duration = state.completionTime - state.startTime;

            // Prepare final results for chat card
            state.finalResult = this.prepareFinalResults(state);

            // Save workflow state to chat message flags
            await this.saveWorkflowState(state);

            // Log completion
            API.log('info', `Workflow completed in ${state.duration}ms with ${state.errors.length} errors`);
            
            return state;
        } catch (error) {
            API.log('error', 'CompleteStep: Error during completion:', error);
            state.errors.push({
                type: 'completion',
                message: error.message,
                step: 'complete',
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Prepare final results for chat card display
     * @param {Object} state - Workflow state
     * @returns {Object} Formatted results for chat card
     */
    prepareFinalResults(state) {
        const { targetResults, attackRolls, errors } = state.results;
        
        return {
            workflowType: state.workflowType,
            actorId: state.dialogState.ownerID,
            itemId: state.dialogState.itemID,
            attackRolls: attackRolls,
            targetResults: targetResults,
            errors: errors.filter(e => e.type === 'target_missing'), // Only user-facing errors
            timestamp: state.completionTime,
            duration: state.duration
        };
    }

    /**
     * Save workflow state to chat message flags
     * @param {Object} state - Workflow state to save
     */
    async saveWorkflowState(state) {
        try {
            // Create a chat message with the workflow state
            const chatData = {
                user: game.user.id,
                speaker: {
                    actor: state.dialogState.ownerID,
                    alias: game.actors.get(state.dialogState.ownerID)?.name || 'Unknown'
                },
                content: `<div class="sw5e-qol-workflow-result">
                    <h3>Attack Workflow Complete</h3>
                    <p>Workflow completed in ${state.duration}ms</p>
                    <p>Targets processed: ${state.results.targetResults.length}</p>
                    <p>Errors: ${state.results.errors.length}</p>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                flags: {
                    'sw5e-qol': {
                        workflowState: state,
                        workflowType: state.workflowType,
                        completed: true
                    }
                }
            };

            // Create the chat message
            await ChatMessage.create(chatData);
            
            API.log('debug', 'CompleteStep: Workflow state saved to chat message');
        } catch (error) {
            API.log('error', 'CompleteStep: Failed to save workflow state:', error);
        }
    }
}
