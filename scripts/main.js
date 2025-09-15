/**
 * SW5E QoL Module - Main Entry Point
 * This file is loaded by FoundryVTT when the module is enabled
 */

console.log('SW5E QoL Module: main.js is loading...');

// Don't import anything during the import phase - wait for FoundryVTT to be ready
let API, GenericRollHandler, GenericRollRenderer, GenericInputHandler, themeManager, CardHandler, CardRenderer, WorkflowManager, featureManager, DiceRoller;

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
        
         // Import card system components
         try {
            const cardHandlerModule = await import('./ui/cards/card-handler.js');
            CardHandler = cardHandlerModule.CardHandler;
            console.log('SW5E QoL Module: CardHandler imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import CardHandler', error);
        }
        
        try {
            const cardRendererModule = await import('./ui/cards/card-renderer.js');
            CardRenderer = cardRendererModule.CardRenderer;
            console.log('SW5E QoL Module: CardRenderer imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import CardRenderer', error);
        }
        
        // Import workflow system BEFORE feature system
        try {
            console.log('SW5E QoL Module: WorkflowManager import starting...');
            const workflowModule = await import('./core/workflow/workflow-manager.js');
            WorkflowManager = workflowModule.WorkflowManager;
            console.log('SW5E QoL Module: WorkflowManager imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import WorkflowManager', error);
            console.error('WorkflowManager import error details:', error.stack);
        }
        
        // Import DiceRoller
        try {
            console.log('SW5E QoL Module: DiceRoller import starting...');
            const diceRollerModule = await import('./core/dice/dice-roller.js');
            DiceRoller = diceRollerModule.DiceRoller;
            console.log('SW5E QoL Module: DiceRoller imported successfully');
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import DiceRoller', error);
        }
        
        // Import feature system AFTER workflow (since it might depend on it)
        try {
            console.log('SW5E QoL Module: Feature system import starting...');
            // Don't await the feature system if it's doing async initialization
            import('./features/init.js').then(() => {
                console.log('SW5E QoL Module: Feature system imported successfully');
            }).catch(error => {
                console.error('SW5E QoL Module: Failed to import feature system', error);
            });
        } catch (error) {
            console.error('SW5E QoL Module: Failed to import feature system', error);
        }

        console.log('SW5E QoL Module: All imports completed');
        
        // Register module settings first (after imports)
        if (API && API.registerSettings) {
            await API.registerSettings();
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
                ...(CardHandler && { CardHandler }),
                ...(CardRenderer && { CardRenderer }),
                ...(WorkflowManager && { WorkflowManager }),
                ...(DiceRoller && { DiceRoller }),
                
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
                        CardHandler: !!CardHandler,
                        CardRenderer: !!CardRenderer,
                        WorkflowManager: !!WorkflowManager,
                        DiceRoller: !!DiceRoller
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
        
        // Import test files
        try {
            await import('./test-create-damage-roll.js');
            console.log('SW5E QoL Module: Damage roll test loaded');
        } catch (error) {
            console.warn('SW5E QoL Module: Failed to load damage roll test:', error);
        }
        
        // Check what's available
        const module = game.modules.get('sw5e-qol');
        if (module && module.api) {
            console.log('Available API functions:', Object.keys(module.api));
            console.log('✅ SW5E QoL Module is ready!');
            console.log('Core components available:', module.api.debug.imports);
            
            // Log specifically about WorkflowManager
            if (module.api.WorkflowManager) {
                console.log('✅ WorkflowManager is available and ready to use!');
            } else {
                console.warn('⚠️ WorkflowManager is NOT available');
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

// Test function for the card system - can be run from console
async function testCardSystemConsole() {
    try {
        console.log('Starting card system test...');
        
        // Get the module and check if CardHandler is available
        const module = game.modules.get('sw5e-qol');
        if (!module || !module.api || !module.api.CardHandler) {
            console.error('CardHandler not available. Make sure the module is loaded and the card system is imported.');
            console.log('Available API functions:', module?.api ? Object.keys(module.api) : 'No API available');
            console.log('Import status:', module?.api?.debug?.imports);
            return;
        }
        
        // Create an instance of CardHandler (it's a class, not an instance)
        const handler = new module.api.CardHandler();
        console.log('CardHandler instance created, creating test cards...');
        
        // Test 1: Simple damage card
        console.log('Creating damage card...');
        
        // Create a mock roll for testing
        const mockRoll = new Roll("2d8 + 3");
        await mockRoll.evaluate();
        
        // Add flavor to dice for damage types
        mockRoll.terms.forEach(term => {
            if (term instanceof Die) {
                term.options.flavor = "energy";
            }
        });

        const cardData = {
            cardType: 'damage',
            title: 'Lightsaber Damage',
            userId: game.user.id,
            roll: mockRoll,
            results: {
                TotalDam: 12,
                TotalCritDam: 0,
                TotalDamByType: { energy: 12 },
                TotalCritDamByType: {},
                RollArray: [mockRoll],
                CritRollArray: [],
                TargetRef: "test-target-1"
            },
            targets: [
                {
                    tokenID: "test-target-1",
                    crit: false,
                    name: "Test Target 1"
                }
            ],
            actions: [
                {
                    action: 'roll-save',
                    label: 'Roll Save',
                    icon: 'fas fa-dice-d20',
                    class: 'primary',
                    data: {
                        saveType: 'dex',
                        dc: 15
                    }
                }
            ]
        };

        const message = await handler.createCard(cardData);
        console.log(`✅ Damage card created with message ID: ${message.id}`);
        
        // Test 2: Attack card
        console.log('Creating attack card...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const attackRoll = new Roll("1d20 + 7");
        await attackRoll.evaluate();

        const attackCardData = {
            cardType: 'attack',
            title: 'Blaster Pistol Attack',
            userId: game.user.id,
            roll: attackRoll,
            results: {
                total: 18,
                target: "test-target-2"
            },
            target: {
                tokenID: "test-target-2",
                name: "Test Target 2"
            },
            actions: [
                {
                    action: 'reroll',
                    label: 'Reroll',
                    icon: 'fas fa-redo',
                    class: 'secondary'
                }
            ]
        };

        const attackMessage = await handler.createCard(attackCardData);
        console.log(`✅ Attack card created with message ID: ${attackMessage.id}`);
        
        console.log('🎉 Card system test completed successfully!');
        console.log('Check the chat log to see your test cards.');
        
    } catch (error) {
        console.error('❌ Card system test failed:', error);
        console.error('Error details:', error.stack);
    }
}

// Test function for the workflow system - can be run from console
async function testWorkflowConsole() {
    try {
        console.log('Starting workflow system test...');
        
        // Get the module and check if WorkflowManager is available
        const module = game.modules.get('sw5e-qol');
        if (!module || !module.api || !module.api.WorkflowManager) {
            console.error('WorkflowManager not available. Make sure the module is loaded and the workflow system is imported.');
            console.log('Available API functions:', module?.api ? Object.keys(module.api) : 'No API available');
            console.log('Import status:', module?.api?.debug?.imports);
            return;
        }
        
        // Create an instance of WorkflowManager
        const executor = new module.api.WorkflowManager();
        console.log('WorkflowManager instance created');
        
        // Create a test dialog state
        const testDialogState = {
            ownerID: game.user.character?.id || 'test-actor',
            dialogType: 'attack',
            itemID: 'test-item',
            rollMode: 'publicroll',
            advantageSelection: 'Normal',
            rollSeparate: false,
            selectedAbility: 'dex',
            abilityModifier: '+3',
            abilityDisplayName: 'Dexterity',
            saveObj: {},
            skillObj: {},
            modifiers: [],
            resourceCosts: [],
            enabledFeatures: [],
            targetIDs: []
        };
        
        console.log('Test dialog state:', testDialogState);
        
        // Execute the workflow
        console.log('Executing attack workflow...');
        const result = await executor.executeWorkflow('attack', testDialogState);
        
        console.log('✅ Workflow completed successfully!');
        console.log('Result:', result);
        
    } catch (error) {
        console.error('❌ Workflow test failed:', error);
        console.error('Error details:', error.stack);
    }
}

// To run tests, use the browser console after the module loads:
// testCardSystemConsole()
// testWorkflowConsole()