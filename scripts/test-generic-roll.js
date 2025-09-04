import { GenericRollHandler } from './ui/dialogs/generic-roll-handler.js';
import { API } from './api.js';

/**
 * Test function for the Generic Roll Dialog
 * This demonstrates how to use the dialog system
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testGenericRollDialog(actorId = null) {
    try {
        const handler = new GenericRollHandler();

        // Test data for an attack roll
        const attackOptions = {
            actorId: actorId, // Save the actor ID
            itemId: null,
            type: 'attack',
            title: 'Blaster Pistol',
            theme: 'tech', // Test tech theme
            attribute: 'dex',
            overrideAttribute: true,
            modifiers: [
                {
                    name: 'Proficiency Bonus',
                    type: 'Tech',
                    modifier: '+4',
                    isEnabled: true,
                    isDice: false
                },
                {
                    name: 'Targeting Protocol',
                    type: 'Tech',
                    modifier: '1d6',
                    isEnabled: true,
                    isDice: true
                }
            ]
        };

        // Open the dialog
        const result = await handler.openDialog(attackOptions);
        
        if (result) {
            API.log('info', 'Dialog result:', result);
            API.log('info', 'Dialog completed successfully:', result);
        } else {
            API.log('info', 'Dialog was cancelled or failed');
            API.log('info', 'Dialog was cancelled or failed');
        }

    } catch (error) {
        API.log('error', 'Test failed', error);
        API.log('error', 'Test failed:', error);
    }
}

/**
 * Test function for a skill check
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testSkillCheckDialog(actorId = null) {
    try {
        const handler = new GenericRollHandler();

        const skillOptions = {
            actorId: actorId, // Save the actor ID
            type: 'skill',
            title: 'Persuasion Check',
            theme: 'light', // Test light theme
            modifiers: [
                {
                    name: 'Charisma Modifier',
                    type: 'Item',
                    modifier: '+2',
                    isEnabled: true,
                    isDice: false
                }
            ]
        };

        const result = await handler.openDialog(skillOptions);
        
        if (result) {
            API.log('info', 'Skill check result:', result);
            API.log('info', 'Skill check completed:', result);
        }

    } catch (error) {
        API.log('error', 'Skill check test failed', error);
        API.log('error', 'Skill check test failed:', error);
    }
}

/**
 * Test function for a damage roll
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testDamageDialog(actorId = null) {
    try {
        const handler = new GenericRollHandler();

        const damageOptions = {
            actorId: actorId, // Save the actor ID
            type: 'damage',
            title: 'Lightsaber Damage',
            theme: 'dark', // Test dark theme
            modifiers: [
                {
                    name: 'Base Damage',
                    type: 'Energy',
                    modifier: '1d8',
                    isEnabled: true,
                    isDice: true
                },
                {
                    name: 'Strength Bonus',
                    type: 'Untyped',
                    modifier: '+3',
                    isEnabled: true,
                    isDice: false
                }
            ]
        };

        const result = await handler.openDialog(damageOptions);
        
        if (result) {
            API.log('info', 'Damage roll result:', result);
            API.log('info', 'Damage roll completed:', result);
        }

    } catch (error) {
        API.log('error', 'Damage test failed', error);
        API.log('error', 'Damage test failed:', error);
    }
}

/**
 * Test function for theme switching
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testThemeSwitching(actorId = null) {
    try {
        const handler = new GenericRollHandler();
        
        // Test all themes
        const themes = ['bendu', 'light', 'dark','tech'];
        
        for (const theme of themes) {
            API.log('debug', `Testing theme: ${theme}`);
            
            const options = {
                actorId: actorId, // Save the actor ID
                type: 'attack',
                title: `Theme Test - ${theme}`,
                theme: theme,
                modifiers: [
                    {
                        name: 'Test Modifier',
                        type: 'Untyped',
                        modifier: '+1',
                        isEnabled: true,
                        isDice: false
                    }
                ]
            };
            
            const result = await handler.openDialog(options);
            if (result) {
                API.log('info', `Theme ${theme} test completed successfully`);
            }
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        API.log('error', 'Theme switching test failed:', error);
    }
}

/**
 * Test multiple dialogs with different themes simultaneously
 * This tests the new theme isolation feature
 * @param {string} actorId - The ID of the actor making the check
 */
export async function testMultipleDialogThemes(actorId = null) {
    try {
        const handler = new GenericRollHandler();
        
        // Test opening multiple dialogs with different themes simultaneously
        const themes = ['bendu', 'light', 'dark', 'tech'];
        const dialogs = [];
        
        API.log('info', 'Testing multiple dialogs with different themes simultaneously...');
        
        // Open all dialogs at once
        for (let i = 0; i < themes.length; i++) {
            const theme = themes[i];
            const options = {
                actorId: actorId,
                type: 'attack',
                title: `Multi-Theme Test - ${theme}`,
                theme: theme,
                modifiers: [
                    {
                        name: `Test Modifier ${i + 1}`,
                        type: 'Untyped',
                        modifier: `+${i + 1}`,
                        isEnabled: true,
                        isDice: false
                    }
                ]
            };
            
            // Open dialog (don't await - open them all at once)
            const dialogPromise = handler.openDialog(actorId, 'attack', options);
            dialogs.push({ theme, promise: dialogPromise });
            
            // Small delay between opening dialogs
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        API.log('info', `Opened ${dialogs.length} dialogs with different themes. Check that each dialog maintains its own theme.`);
        API.log('info', 'Expected behavior: Each dialog should have its own theme without affecting others or the global theme.');
        
        // Wait for all dialogs to complete
        for (const dialog of dialogs) {
            try {
                const result = await dialog.promise;
                if (result) {
                    API.log('info', `Dialog with ${dialog.theme} theme completed successfully`);
                }
            } catch (error) {
                API.log('error', `Dialog with ${dialog.theme} theme failed:`, error);
            }
        }
        
    } catch (error) {
        API.log('error', 'Multiple dialog theme test failed:', error);
    }
}

/**
 * Helper function to get the currently selected token's actor ID
 * @returns {string|null} The actor ID or null if no token is selected
 */
export function getSelectedTokenActorId() {
    try {
        const selectedTokens = canvas.tokens.controlled;
        if (selectedTokens.length === 0) {
            API.log('warning', 'No token selected');
            return null;
        }
        
        const token = selectedTokens[0];
        return token.actor.id;
    } catch (error) {
        API.log('error', 'Failed to get selected token actor ID', error);
        return null;
    }
}

// Export test functions for external use
export const GenericRollTests = {
    testAttack: testGenericRollDialog,
    testSkill: testSkillCheckDialog,
    testDamage: testDamageDialog,
    testThemes: testThemeSwitching,
    getSelectedTokenActorId: getSelectedTokenActorId
};
