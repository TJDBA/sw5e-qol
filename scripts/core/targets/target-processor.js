/**
 * Target Processor Class
 * Handles target lookup, validation, and defensive stats
 * Location: scripts/core/targets/target-processor.js
 */

import { API } from '../../../api.js';
import { TargetUtils } from './target-utils.js';

/**
 * Target Processor Class
 * Manages target processing for workflows
 */
export class TargetProcessor {
    constructor() {
        this.targetUtils = new TargetUtils();
    }

    /**
     * Process targets from dialog state
     * @param {Object} dialogState - Dialog state containing target information
     * @returns {Object} Target processing results
     */
    async processTargets(dialogState) {
        const targets = [];
        const errors = [];

        try {
            // Get target IDs from dialog state
            const targetIds = this.extractTargetIds(dialogState);
            
            if (targetIds.length === 0) {
                API.log('debug', 'TargetProcessor: No targets found in dialog state');
                return { targets, errors };
            }

            // Process each target
            for (const targetId of targetIds) {
                try {
                    const target = await this.targetUtils.getTargetData(targetId);
                    if (target && !target.error) {
                        targets.push(target);
                    } else {
                        // Target is missing or has an error - add to targets with error flag
                        const errorTarget = {
                            id: targetId,
                            error: target?.error || 'Target not found or inaccessible',
                            name: 'Missing Target'
                        };
                        targets.push(errorTarget);
                        
                        errors.push({
                            type: 'target_missing',
                            message: `Target ${targetId} not found or inaccessible`,
                            targetId: targetId,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    API.log('warning', `TargetProcessor: Error processing target ${targetId}:`, error);
                    
                    // Add error target to maintain target count
                    const errorTarget = {
                        id: targetId,
                        error: `Error processing target: ${error.message}`,
                        name: 'Error Target'
                    };
                    targets.push(errorTarget);
                    
                    errors.push({
                        type: 'target_error',
                        message: `Error processing target ${targetId}: ${error.message}`,
                        targetId: targetId,
                        timestamp: Date.now()
                    });
                }
            }

            API.log('debug', `TargetProcessor: Processed ${targets.length} targets, ${errors.length} errors`);
            return { targets, errors };
        } catch (error) {
            API.log('error', 'TargetProcessor: Error during target processing:', error);
            errors.push({
                type: 'processing_error',
                message: error.message,
                timestamp: Date.now()
            });
            return { targets, errors };
        }
    }

    /**
     * Extract target IDs from dialog state
     * @param {Object} dialogState - Dialog state
     * @returns {Array} Array of target IDs
     */
    extractTargetIds(dialogState) {
        // Dialog state contains targetIDs array with token information
        if (dialogState.targetIDs && Array.isArray(dialogState.targetIDs)) {
            return dialogState.targetIDs.map(t => t.tokenId || t);
        }
        
        if (dialogState.targetId) {
            return [dialogState.targetId];
        }

        return [];
    }
}
