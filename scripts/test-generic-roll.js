import { GenericRollHandler } from './ui/dialogs/generic-roll-handler.js';
import { API } from './api.js';

/**
 * Test function for the Generic Roll Dialog
 * This demonstrates how to use the dialog system
 */
export async function testGenericRollDialog() {
    try {
        const handler = new GenericRollHandler();

        // Test data for an attack roll
        const attackOptions = {
            type: 'attack',
            title: 'Lightsaber Strike',
            theme: 'bendu', // Default theme
            modifiers: [
                {
                    name: 'Strength Modifier',
                    type: 'Item',
                    modifier: '+3',
                    isEnabled: true,
                    isDice: false
                },
                {
                    name: 'Proficiency Bonus',
                    type: 'Untyped',
                    modifier: '+4',
                    isEnabled: true,
                    isDice: false
                },
                {
                    name: 'Bardic Inspiration',
                    type: 'Force',
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
 */
export async function testSkillCheckDialog() {
    try {
        const handler = new GenericRollHandler();

        const skillOptions = {
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
 */
export async function testDamageDialog() {
    try {
        const handler = new GenericRollHandler();

        const damageOptions = {
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
 */
export async function testThemeSwitching() {
    try {
        const handler = new GenericRollHandler();
        
        // Test all themes
        const themes = ['bendu', 'light', 'dark'];
        
        for (const theme of themes) {
            console.log(`Testing theme: ${theme}`);
            
            const options = {
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

// Export test functions for external use
export const GenericRollTests = {
    testAttack: testGenericRollDialog,
    testSkill: testSkillCheckDialog,
    testDamage: testDamageDialog,
    testThemes: testThemeSwitching
};
