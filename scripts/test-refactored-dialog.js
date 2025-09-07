import { GenericRollDialog } from './ui/dialogs/generic-roll-dialog.js';
import { API } from './api.js';

const logThisFile = false;

/**
 * Test function for the Refactored Dialog System
 * This tests the new modular architecture
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testRefactoredDialog(actorId = null) {
    try {
        if (logThisFile) API.log('info', 'Starting refactored dialog system test');
        
        // Get a test actor if none provided
        if (!actorId) {
            const actors = game.actors.contents;
            if (actors.length === 0) {
                API.log('warning', 'No actors found for testing');
                return;
            }
            actorId = actors[0].id;
        }

        const actor = game.actors.get(actorId);
        if (!actor) {
            API.log('error', `Actor with ID ${actorId} not found`);
            return;
        }

        if (logThisFile) API.log('info', `Testing with actor: ${actor.name}`);

        // Test 1: Attack Roll Dialog
        if (logThisFile) API.log('info', 'Test 1: Attack Roll Dialog');
        const attackOptions = {
            actorId: actorId,
            itemId: null,
            type: 'attack',
            title: 'Test Attack Roll',
            theme: 'tech',
            attribute: 'dex',
            overrideAttribute: true,
            modifiers: [
                {
                    name: 'Proficiency Bonus',
                    type: 'Tech',
                    modifier: '+4',
                    isEnabled: true,
                    isDice: false
                }
            ]
        };

        const attackResult = await GenericRollDialog.openDialog(attackOptions);
        if (attackResult) {
            if (logThisFile) API.log('info', 'Attack dialog result:', attackResult);
        } else {
            if (logThisFile) API.log('info', 'Attack dialog was cancelled');
        }

        // Test 2: Skill Check Dialog
        if (logThisFile) API.log('info', 'Test 2: Skill Check Dialog');
        const skillOptions = {
            actorId: actorId,
            type: 'skill',
            title: 'Test Skill Check',
            theme: 'light',
            attribute: 'int',
            overrideAttribute: true,
            modifiers: []
        };

        const skillResult = await GenericRollDialog.openDialog(skillOptions);
        if (skillResult) {
            if (logThisFile) API.log('info', 'Skill dialog result:', skillResult);
        } else {
            if (logThisFile) API.log('info', 'Skill dialog was cancelled');
        }

        // Test 3: Save Dialog
        if (logThisFile) API.log('info', 'Test 3: Save Dialog');
        const saveOptions = {
            actorId: actorId,
            type: 'save',
            title: 'Test Save',
            theme: 'dark',
            attribute: 'wis',
            overrideAttribute: true,
            modifiers: []
        };

        const saveResult = await GenericRollDialog.openDialog(saveOptions);
        if (saveResult) {
            if (logThisFile) API.log('info', 'Save dialog result:', saveResult);
        } else {
            if (logThisFile) API.log('info', 'Save dialog was cancelled');
        }

        // Test 4: Damage Dialog
        if (logThisFile) API.log('info', 'Test 4: Damage Dialog');
        const damageOptions = {
            actorId: actorId,
            type: 'damage',
            title: 'Test Damage',
            theme: 'bendu',
            attribute: 'str',
            overrideAttribute: true,
            modifiers: []
        };

        const damageResult = await GenericRollDialog.openDialog(damageOptions);
        if (damageResult) {
            if (logThisFile) API.log('info', 'Damage dialog result:', damageResult);
        } else {
            if (logThisFile) API.log('info', 'Damage dialog was cancelled');
        }

        if (logThisFile) API.log('info', 'Refactored dialog system test completed successfully');

    } catch (error) {
        API.log('error', 'Test failed:', error);
    }
}

/**
 * Test individual modules
 */
export async function testIndividualModules() {
    try {
        if (logThisFile) API.log('info', 'Testing individual modules');

        // Test Dialog Manager
        if (logThisFile) API.log('info', 'Testing Dialog Manager...');
        // This would test dialog validation, theme application, etc.

        // Test Event Handler
        if (logThisFile) API.log('info', 'Testing Event Handler...');
        // This would test event delegation, toggle handling, etc.

        // Test Modifier Manager
        if (logThisFile) API.log('info', 'Testing Modifier Manager...');
        // This would test modifier addition, combination, etc.

        // Test Feature Manager
        if (logThisFile) API.log('info', 'Testing Feature Manager...');
        // This would test feature state management

        // Test Roll Button Manager
        if (logThisFile) API.log('info', 'Testing Roll Button Manager...');
        // This would test button label building

        // Test Item Handler
        if (logThisFile) API.log('info', 'Testing Item Handler...');
        // This would test item-specific logic

        // Test State Manager
        if (logThisFile) API.log('info', 'Testing State Manager...');
        // This would test state persistence

        if (logThisFile) API.log('info', 'Individual module tests completed');

    } catch (error) {
        API.log('error', 'Module test failed:', error);
    }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    window.testRefactoredDialog = testRefactoredDialog;
    window.testIndividualModules = testIndividualModules;
}
