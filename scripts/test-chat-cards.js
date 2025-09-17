import { CompleteAction } from './core/workflow/actions/complete-action.js';
import { API } from './api.js';
import { getActorFromTokenID } from './actors/actor-util.js';

const logThisFile = true;

/**
 * Test function for chat card generation
 * This demonstrates how the complete action creates chat cards
 */
export async function testChatCardGeneration() {
    try {
        if (logThisFile) API.log('debug', 'TestChatCard: Starting chat card generation test');
        
        // Create a mock workflow state for testing
        const mockState = createMockWorkflowState('attack');
        
        // Create and execute the complete action
        const completeAction = new CompleteAction();
        const result = await completeAction.execute(mockState);
        
        if (logThisFile) API.log('info', 'Chat card test completed successfully');
        if (logThisFile) API.log('debug', 'Test result:', result);
        
        return result;
        
    } catch (error) {
        API.log('error', 'Chat card test failed:', error);
        throw error;
    }
}

/**
 * Test function for damage workflow chat card
 */
export async function testDamageChatCard() {
    try {
        if (logThisFile) API.log('debug', 'TestChatCard: Starting damage chat card test');
        
        // Create a mock workflow state for damage testing
        const mockState = createMockWorkflowState('damage');
        
        // Create and execute the complete action
        const completeAction = new CompleteAction();
        const result = await completeAction.execute(mockState);
        
        if (logThisFile) API.log('info', 'Damage chat card test completed successfully');
        if (logThisFile) API.log('debug', 'Test result:', result);
        
        return result;
        
    } catch (error) {
        API.log('error', 'Damage chat card test failed:', error);
        throw error;
    }
}

/**
 * Create a mock workflow state for testing
 * @param {string} workflowType - Type of workflow to mock
 * @returns {Object} Mock workflow state
 */
function createMockWorkflowState(workflowType) {
    // Get the first available actor for testing
    const actors = game.actors.contents;
    if (!actors || actors.length === 0) {
        throw new Error('No actors found in the game for testing');
    }
    const actor = actors[0];
    
    // Create mock roll data
    const mockRoll = {
        total: 15,
        terms: [
            { total: 12, options: { flavor: 'd20' } },
            { total: 3, options: { flavor: 'modifier' } }
        ],
        render: function() {
            return `<div class="dice-roll">Roll: ${this.total}</div>`;
        }
    };
    
    const baseState = {
        workflowType: workflowType,
        dialogState: {
            ownerID: actor.id,
            itemID: null,
            targetIDs: [
                { tokenId: null, noTarget: true }
            ]
        },
        startTime: Date.now(),
        currentAction: 'complete',
        completedActions: ['start', workflowType],
        errors: [],
        results: {}
    };
    
    // Add workflow-specific data
    switch (workflowType) {
        case 'attack':
            baseState.attackResults = [
                {
                    rollTotal: 15,
                    target: { name: 'Test Target' },
                    hitResult: { hit: true, ac: 12 },
                    criticalResult: { isCritical: false },
                    success: true,
                    isCritical: false
                }
            ];
            baseState.rolls = [mockRoll];
            break;
            
        case 'damage':
            baseState.damageResults = [
                {
                    damageTotal: 8,
                    damageByType: { 'energy': 8 },
                    target: { name: 'Test Target' },
                    isCritical: false,
                    normalRoll: mockRoll,
                    baseRoll: null,
                    critRoll: null
                }
            ];
            baseState.rolls = {
                normalRoll: mockRoll,
                baseRoll: null,
                critRoll: null
            };
            break;
            
        case 'save':
            baseState.saveResults = [
                {
                    rollTotal: 12,
                    target: { name: 'Test Target' },
                    success: true,
                    dc: 10
                }
            ];
            baseState.rolls = [mockRoll];
            break;
    }
    
    return baseState;
}

/**
 * Test function for multiple workflow types
 */
export async function testAllWorkflowTypes() {
    try {
        if (logThisFile) API.log('debug', 'TestChatCard: Testing all workflow types');
        
        const workflowTypes = ['attack', 'damage', 'save', 'check'];
        const results = [];
        
        for (const workflowType of workflowTypes) {
            try {
                if (logThisFile) API.log('info', `Testing ${workflowType} workflow chat card`);
                
                const mockState = createMockWorkflowState(workflowType);
                const completeAction = new CompleteAction();
                const result = await completeAction.execute(mockState);
                
                results.push({ workflowType, success: true, result });
                if (logThisFile) API.log('info', `${workflowType} workflow test completed successfully`);
                
            } catch (error) {
                results.push({ workflowType, success: false, error: error.message });
                API.log('error', `${workflowType} workflow test failed:`, error);
            }
        }
        
        if (logThisFile) API.log('info', 'All workflow type tests completed');
        if (logThisFile) API.log('debug', 'Test results:', results);
        
        return results;
        
    } catch (error) {
        API.log('error', 'All workflow types test failed:', error);
        throw error;
    }
}

// Export test functions for external use
export const ChatCardTests = {
    testAttack: testChatCardGeneration,
    testDamage: testDamageChatCard,
    testAll: testAllWorkflowTypes
};
