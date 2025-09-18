/**
 * V10 Compatibility Test
 * Test that the module works with FoundryVTT v10+ API
 */

import { CompleteAction } from './core/workflow/actions/complete-action.js';
import { API } from './api.js';

const logThisFile = true;

/**
 * Test v10+ compatibility
 */
export async function testV10Compatibility() {
    try {
        if (logThisFile) API.log('info', '=== V10 COMPATIBILITY TEST STARTING ===');
        
        // Test that we can access actor properties without .data
        const actors = game.actors.contents;
        if (actors.length > 0) {
            const actor = actors[0];
            if (logThisFile) API.log('debug', 'Testing actor properties:', {
                name: actor.name,
                ownership: actor.ownership,
                img: actor.img
            });
        }
        
        // Test that we can access user properties without .data
        const user = game.user;
        if (logThisFile) API.log('debug', 'Testing user properties:', {
            name: user.name,
            color: user.color,
            avatar: user.avatar
        });
        
        // Test that we can access message properties without .data
        const messages = game.messages.contents;
        if (messages.length > 0) {
            const message = messages[0];
            if (logThisFile) API.log('debug', 'Testing message properties:', {
                id: message.id,
                content: message.content,
                type: message.type
            });
        }
        
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
        
        if (logThisFile) API.log('info', '=== V10 COMPATIBILITY TEST COMPLETED ===');
        if (logThisFile) API.log('debug', 'Test result:', result);
        
        return result;
        
    } catch (error) {
        API.log('error', 'V10 compatibility test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testV10Compatibility();
}
