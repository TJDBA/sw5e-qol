/**
 * Simple Debug Test
 * Test basic card creation without complex dependencies
 */

import { CompleteAction } from './core/workflow/actions/complete-action.js';
import { API } from './api.js';

const logThisFile = true;

/**
 * Test simple card creation
 */
export async function testSimpleCard() {
    try {
        if (logThisFile) API.log('info', '=== SIMPLE CARD TEST STARTING ===');
        
        // Create a simple mock state
        const mockState = {
            workflowType: 'attack',
            dialogState: {
                ownerID: 'test-actor-id',
                actorName: 'Test Character',
                targets: ['target1', 'target2']
            },
            attackResults: {
                rolls: [{ total: 15, dice: [15] }],
                hits: 1,
                misses: 1
            }
        };
        
        if (logThisFile) API.log('info', 'Mock state created:', mockState);
        
        // Create complete action
        const completeAction = new CompleteAction();
        
        // Execute the action
        const result = await completeAction.execute(mockState);
        
        if (logThisFile) API.log('info', '=== SIMPLE CARD TEST COMPLETED ===');
        if (logThisFile) API.log('debug', 'Test result:', result);
        
        return result;
        
    } catch (error) {
        API.log('error', 'Simple card test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testSimpleCard();
}
