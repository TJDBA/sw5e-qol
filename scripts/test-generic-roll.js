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
            console.log('Dialog completed successfully:', result);
        } else {
            API.log('info', 'Dialog was cancelled or failed');
            console.log('Dialog was cancelled or failed');
        }

    } catch (error) {
        API.log('error', 'Test failed', error);
        console.error('Test failed:', error);
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
            console.log('Skill check completed:', result);
        }

    } catch (error) {
        API.log('error', 'Skill check test failed', error);
        console.error('Skill check test failed:', error);
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
            console.log('Damage roll completed:', result);
        }

    } catch (error) {
        API.log('error', 'Damage test failed', error);
        console.error('Damage test failed:', error);
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
            console.log(`Testing theme: ${theme}`);
            
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
                console.log(`Theme ${theme} test completed successfully`);
            }
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        console.error('Theme switching test failed:', error);
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
