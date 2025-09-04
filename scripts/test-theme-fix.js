/**
 * Test script for the theme switching fix
 * This script tests that dialogs maintain their individual themes
 * without affecting the global theme or other dialogs
 */

import { GenericRollHandler } from './ui/dialogs/generic-roll-handler.js';
import { themeManager } from './ui/theme-manager.js';
import { API } from './api.js';

/**
 * Test the theme isolation fix
 */
export async function testThemeIsolationFix() {
    try {
        API.log('info', '=== Testing Theme Isolation Fix ===');
        
        // Get current global theme
        const originalGlobalTheme = themeManager.getCurrentTheme();
        API.log('info', `Original global theme: ${originalGlobalTheme}`);
        
        // Test 1: Open a dialog with a specific theme
        API.log('info', 'Test 1: Opening dialog with dark theme...');
        const handler1 = new GenericRollHandler();
        const options1 = {
            type: 'attack',
            title: 'Dark Theme Dialog',
            theme: 'dark',
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
        
        // Open dialog (this should not change global theme)
        const dialog1Promise = handler1.openDialog(null, 'attack', options1);
        
        // Wait a moment for dialog to open
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if global theme is still the same
        const globalThemeAfterDialog1 = themeManager.getCurrentTheme();
        API.log('info', `Global theme after opening dark dialog: ${globalThemeAfterDialog1}`);
        
        if (globalThemeAfterDialog1 === originalGlobalTheme) {
            API.log('info', '✅ SUCCESS: Global theme preserved when opening dialog');
        } else {
            API.log('error', '❌ FAIL: Global theme changed when opening dialog');
        }
        
        // Test 2: Open another dialog with different theme
        API.log('info', 'Test 2: Opening dialog with tech theme...');
        const handler2 = new GenericRollHandler();
        const options2 = {
            type: 'skill',
            title: 'Tech Theme Dialog',
            theme: 'tech',
            modifiers: [
                {
                    name: 'Tech Modifier',
                    type: 'Untyped',
                    modifier: '+2',
                    isEnabled: true,
                    isDice: false
                }
            ]
        };
        
        // Open second dialog
        const dialog2Promise = handler2.openDialog(null, 'skill', options2);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check global theme again
        const globalThemeAfterDialog2 = themeManager.getCurrentTheme();
        API.log('info', `Global theme after opening tech dialog: ${globalThemeAfterDialog2}`);
        
        if (globalThemeAfterDialog2 === originalGlobalTheme) {
            API.log('info', '✅ SUCCESS: Global theme still preserved with multiple dialogs');
        } else {
            API.log('error', '❌ FAIL: Global theme changed with multiple dialogs');
        }
        
        // Test 3: Check active dialogs tracking
        API.log('info', `Active dialogs: ${themeManager.activeDialogs.size}`);
        if (themeManager.activeDialogs.size === 2) {
            API.log('info', '✅ SUCCESS: Active dialogs properly tracked');
        } else {
            API.log('error', '❌ FAIL: Active dialogs not properly tracked');
        }
        
        // Test 4: Close dialogs and check theme restoration
        API.log('info', 'Test 4: Closing dialogs and checking theme restoration...');
        
        // Close first dialog
        if (handler1.currentDialog) {
            handler1.currentDialog.close();
        }
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if global theme is still preserved (should be, as one dialog is still open)
        const globalThemeAfterClose1 = themeManager.getCurrentTheme();
        API.log('info', `Global theme after closing first dialog: ${globalThemeAfterClose1}`);
        
        // Close second dialog
        if (handler2.currentDialog) {
            handler2.currentDialog.close();
        }
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if global theme is restored
        const globalThemeAfterClose2 = themeManager.getCurrentTheme();
        API.log('info', `Global theme after closing all dialogs: ${globalThemeAfterClose2}`);
        
        if (globalThemeAfterClose2 === originalGlobalTheme) {
            API.log('info', '✅ SUCCESS: Global theme restored after closing all dialogs');
        } else {
            API.log('error', '❌ FAIL: Global theme not restored after closing all dialogs');
        }
        
        // Test 5: Check active dialogs are cleared
        API.log('info', `Active dialogs after closing all: ${themeManager.activeDialogs.size}`);
        if (themeManager.activeDialogs.size === 0) {
            API.log('info', '✅ SUCCESS: Active dialogs properly cleared');
        } else {
            API.log('error', '❌ FAIL: Active dialogs not properly cleared');
        }
        
        API.log('info', '=== Theme Isolation Fix Test Complete ===');
        
    } catch (error) {
        API.log('error', 'Theme isolation fix test failed:', error);
    }
}

/**
 * Quick test to open multiple dialogs with different themes
 */
export async function quickMultiThemeTest() {
    try {
        API.log('info', '=== Quick Multi-Theme Test ===');
        
        const handler = new GenericRollHandler();
        const themes = ['bendu', 'light', 'dark', 'tech'];
        
        for (let i = 0; i < themes.length; i++) {
            const theme = themes[i];
            const options = {
                type: 'attack',
                title: `Quick Test - ${theme}`,
                theme: theme,
                modifiers: [
                    {
                        name: `Modifier ${i + 1}`,
                        type: 'Untyped',
                        modifier: `+${i + 1}`,
                        isEnabled: true,
                        isDice: false
                    }
                ]
            };
            
            API.log('info', `Opening ${theme} theme dialog...`);
            handler.openDialog(null, 'attack', options);
            
            // Small delay between dialogs
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        API.log('info', 'All dialogs opened. Check that each has its own theme.');
        
    } catch (error) {
        API.log('error', 'Quick multi-theme test failed:', error);
    }
}
