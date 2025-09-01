/**
 * SW5E QoL Module - Main Entry Point
 * This file is loaded by FoundryVTT when the module is enabled
 */

console.log('SW5E QoL Module: main.js is loading...');

// Don't import anything during the import phase - wait for FoundryVTT to be ready
let API, GenericRollHandler, GenericRollRenderer, GenericInputHandler, themeManager;
let testGenericRollDialog, testSkillCheckDialog, testDamageDialog, testThemeSwitching, GenericRollTests;

/**
 * Initialize the module
 */
Hooks.once('init', async function() {
    try {
        console.log('SW5E QoL Module: Initializing...');
        
        // Import all dependencies AFTER FoundryVTT is ready
        console.log('SW5E QoL Module: Importing dependencies...');
        
        try {
            const apiModule = await import('./api.js');
            API = apiModule.API;
            console.log('SW5E QoL Module: API imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import API', error);
        }
        
        try {
            const handlerModule = await import('./ui/dialogs/generic-roll-handler.js');
            GenericRollHandler = handlerModule.GenericRollHandler;
            console.log('SW5E QoL Module: GenericRollHandler imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import GenericRollHandler', error);
        }
        
        try {
            const rendererModule = await import('./ui/dialogs/generic-roll-render.js');
            GenericRollRenderer = rendererModule.GenericRollRenderer;
            console.log('SW5E QoL Module: GenericRollRenderer imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import GenericRollRenderer', error);
        }
        
        try {
            const inputModule = await import('./ui/dialogs/generic-input-handler.js');
            GenericInputHandler = inputModule.GenericInputHandler;
            console.log('SW5E QoL Module: GenericInputHandler imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import GenericInputHandler', error);
        }
        
        try {
            const themeModule = await import('./ui/theme-manager.js');
            themeManager = themeModule.themeManager;
            console.log('SW5E QoL Module: ThemeManager imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import ThemeManager', error);
        }
        
        try {
            const testModule = await import('./test-generic-roll.js');
            testGenericRollDialog = testModule.testGenericRollDialog;
            testSkillCheckDialog = testModule.testSkillCheckDialog;
            testDamageDialog = testModule.testDamageDialog;
            testThemeSwitching = testModule.testThemeSwitching;
            GenericRollTests = testModule.GenericRollTests;
            console.log('SW5E QoL Module: Test functions imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import test functions', error);
        }
        
        console.log('SW5E QoL Module: All imports completed');
        
        // Register module settings first (after imports)
        if (API && API.registerSettings) {
            API.registerSettings();
            console.log('SW5E QoL Module: Settings registered');
        }
        
        // Initialize theme manager if available (after settings are registered)
        if (themeManager) {
            themeManager.init();
            console.log('SW5E QoL Module: Theme manager initialized');
        }
        
        // Register module with FoundryVTT
        const module = game.modules.get('sw5e-qol');
        if (module) {
            module.api = {
                // Core functionality (only if imported successfully)
                ...(GenericRollHandler && { GenericRollHandler }),
                ...(GenericRollRenderer && { GenericRollRenderer }),
                ...(GenericInputHandler && { GenericInputHandler }),
                ...(themeManager && { themeManager }),
                
                // Test functions (only if imported successfully)
                ...(testGenericRollDialog && { testGenericRollDialog }),
                ...(testSkillCheckDialog && { testSkillCheckDialog }),
                ...(testDamageDialog && { testDamageDialog }),
                ...(testThemeSwitching && { testThemeSwitching }),
                ...(GenericRollTests && { GenericRollTests }),
                
                // Utility functions (only if imported successfully)
                ...(API && { API }),
                
                // Debug info
                debug: {
                    imports: {
                        API: !!API,
                        GenericRollHandler: !!GenericRollHandler,
                        GenericRollRenderer: !!GenericRollRenderer,
                        GenericInputHandler: !!GenericInputHandler,
                        themeManager: !!themeManager,
                        testFunctions: !!testGenericRollDialog
                    }
                }
            };
            console.log('SW5E QoL Module: API registered successfully');
            console.log('Module API object:', module.api);
        } else {
            console.error('SW5E QoL Module: Could not find module');
        }
        
    } catch (error) {
        console.error('SW5E QoL Module: Initialization failed', error);
    }
});

/**
 * Module ready hook
 */
Hooks.once('ready', async function() {
    try {
        console.log('SW5E QoL Module: Ready!');
        
        // Check what's available
        const module = game.modules.get('sw5e-qol');
        if (module && module.api) {
            console.log('Available API functions:', Object.keys(module.api));
            
            if (module.api.testGenericRollDialog) {
                console.log('✅ Test functions are available!');
                console.log('Try: game.modules.get("sw5e-qol").api.testGenericRollDialog()');
            } else {
                console.log('❌ Test functions are NOT available');
                console.log('Debug info:', module.api.debug);
            }
        }
        
    } catch (error) {
        console.error('SW5E QoL Module: Ready hook error', error);
    }
});

/**
 * Cleanup when module is disabled
 */
Hooks.once('disable', function() {
    try {
        console.log('SW5E QoL Module: Disabled');
    } catch (error) {
        console.error('SW5E QoL Module: Disable error', error);
    }
});
