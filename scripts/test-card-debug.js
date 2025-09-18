/**
 * Test Card Debug
 * Test script to trigger card creation with comprehensive debugging
 */

import { CompleteAction } from './core/workflow/actions/complete-action.js';
import { API } from './api.js';

const logThisFile = true;

/**
 * Test card creation with debugging
 */
export async function testCardDebug() {
    try {
        if (logThisFile) API.log('info', '=== CARD DEBUG TEST STARTING ===');
        
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
        
        if (logThisFile) API.log('info', '=== CARD DEBUG TEST COMPLETED ===');
        if (logThisFile) API.log('debug', 'Test result:', result);
        
        return result;
        
    } catch (error) {
        API.log('error', 'Card debug test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testCardDebug();
}
