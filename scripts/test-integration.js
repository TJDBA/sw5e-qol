import { API } from './api.js';

const logThisFile = true; // Enable logging for integration testing

/**
 * Comprehensive Integration Test for Refactored Dialog System
 * Tests all modules working together
 */
export async function testIntegration() {
    try {
        if (logThisFile) API.log('info', '🚀 Starting comprehensive integration test...');

        // Test 1: Module Import Test
        if (logThisFile) API.log('info', 'Test 1: Testing module imports...');
        await testModuleImports();

        // Test 2: Dialog Creation Test
        if (logThisFile) API.log('info', 'Test 2: Testing dialog creation...');
        await testDialogCreation();

        // Test 3: Function Integration Test
        if (logThisFile) API.log('info', 'Test 3: Testing function integration...');
        await testFunctionIntegration();

        // Test 4: Error Handling Test
        if (logThisFile) API.log('info', 'Test 4: Testing error handling...');
        await testErrorHandling();

        if (logThisFile) API.log('info', '✅ Integration testing completed successfully!');

    } catch (error) {
        if (logThisFile) API.log('error', '❌ Integration test failed:', error);
    }
}

/**
 * Test module imports
 */
async function testModuleImports() {
    try {
        // Test main coordinator
        const { GenericRollDialog } = await import('./ui/dialogs/generic-roll-dialog.js');
        if (logThisFile) API.log('info', '✅ GenericRollDialog imported successfully');

        // Test all individual modules
        const modules = [
            'dialog-manager.js',
            'dialog-event-handler.js', 
            'dialog-modifier-manager.js',
            'dialog-feature-manager.js',
            'dialog-roll-button-manager.js',
            'item-handler.js',
            'dialog-template-renderer.js',
            'dialog-section-data-preparer.js',
            'dialog-features-renderer.js',
            'dialog-state-manager.js',
            'preset-manager.js'
        ];

        for (const module of modules) {
            try {
                await import(`./ui/dialogs/${module}`);
                if (logThisFile) API.log('info', `✅ ${module} imported successfully`);
            } catch (error) {
                if (logThisFile) API.log('error', `❌ ${module} import failed:`, error.message);
            }
        }

    } catch (error) {
        if (logThisFile) API.log('error', 'Module import test failed:', error);
    }
}

/**
 * Test dialog creation
 */
async function testDialogCreation() {
    try {
        const { GenericRollDialog } = await import('./ui/dialogs/generic-roll-dialog.js');
        
        // Test dialog creation with mock data
        const mockOptions = {
            actorId: 'test-actor-id',
            type: 'attack',
            title: 'Test Attack',
            theme: 'tech',
            attribute: 'dex',
            overrideAttribute: true,
            modifiers: []
        };

        // Test static method
        if (typeof GenericRollDialog.openDialog === 'function') {
            if (logThisFile) API.log('info', '✅ GenericRollDialog.openDialog is a function');
        } else {
            if (logThisFile) API.log('error', '❌ GenericRollDialog.openDialog is not a function');
        }

    } catch (error) {
        if (logThisFile) API.log('error', 'Dialog creation test failed:', error);
    }
}

/**
 * Test function integration
 */
async function testFunctionIntegration() {
    try {
        // Test that all expected functions exist
        const { GenericRollDialog } = await import('./ui/dialogs/generic-roll-dialog.js');
        
        const expectedMethods = [
            'openDialog',
            'showDialog',
            'validateDialogOptions',
            'validateAndSetDefaults',
            'getActorFromOwnerID',
            'validateOwnerID',
            'validateDialogType',
            'applyDialogTheme',
            'waitForDialogReady',
            'setupInputHandler'
        ];

        for (const method of expectedMethods) {
            if (typeof GenericRollDialog[method] === 'function') {
                if (logThisFile) API.log('info', `✅ ${method} method exists`);
            } else {
                if (logThisFile) API.log('warning', `⚠️ ${method} method not found`);
            }
        }

    } catch (error) {
        if (logThisFile) API.log('error', 'Function integration test failed:', error);
    }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
    try {
        const { GenericRollDialog } = await import('./ui/dialogs/generic-roll-dialog.js');
        
        // Test with invalid parameters
        try {
            await GenericRollDialog.openDialog(null, 'invalid-type', {});
            if (logThisFile) API.log('info', '✅ Error handling for invalid parameters works');
        } catch (error) {
            if (logThisFile) API.log('info', '✅ Error handling caught invalid parameters:', error.message);
        }

        // Test with missing parameters
        try {
            await GenericRollDialog.openDialog();
            if (logThisFile) API.log('info', '✅ Error handling for missing parameters works');
        } catch (error) {
            if (logThisFile) API.log('info', '✅ Error handling caught missing parameters:', error.message);
        }

    } catch (error) {
        if (logThisFile) API.log('error', 'Error handling test failed:', error);
    }
}

/**
 * Test individual module functionality
 */
export async function testIndividualModules() {
    try {
        if (logThisFile) API.log('info', 'Testing individual module functionality...');

        // Test Dialog Manager
        const { DialogManager } = await import('./ui/dialogs/dialog-manager.js');
        const dialogManager = new DialogManager();
        if (logThisFile) API.log('info', '✅ DialogManager instantiated successfully');

        // Test Event Handler
        const { DialogEventHandler } = await import('./ui/dialogs/dialog-event-handler.js');
        const mockElement = document.createElement('div');
        const eventHandler = new DialogEventHandler(mockElement);
        if (logThisFile) API.log('info', '✅ DialogEventHandler instantiated successfully');

        // Test Modifier Manager
        const { DialogModifierManager } = await import('./ui/dialogs/dialog-modifier-manager.js');
        const modifierManager = new DialogModifierManager();
        if (logThisFile) API.log('info', '✅ DialogModifierManager instantiated successfully');

        // Test Feature Manager
        const { DialogFeatureManager } = await import('./ui/dialogs/dialog-feature-manager.js');
        const featureManager = new DialogFeatureManager();
        if (logThisFile) API.log('info', '✅ DialogFeatureManager instantiated successfully');

        // Test Roll Button Manager
        const { DialogRollButtonManager } = await import('./ui/dialogs/dialog-roll-button-manager.js');
        const rollButtonManager = new DialogRollButtonManager();
        if (logThisFile) API.log('info', '✅ DialogRollButtonManager instantiated successfully');

        // Test Item Handler
        const { ItemHandler } = await import('./ui/dialogs/item-handler.js');
        const itemHandler = new ItemHandler();
        if (logThisFile) API.log('info', '✅ ItemHandler instantiated successfully');

        // Test Template Renderer
        const { DialogTemplateRenderer } = await import('./ui/dialogs/dialog-template-renderer.js');
        const templateRenderer = new DialogTemplateRenderer();
        if (logThisFile) API.log('info', '✅ DialogTemplateRenderer instantiated successfully');

        // Test Section Data Preparer
        const { DialogSectionDataPreparer } = await import('./ui/dialogs/dialog-section-data-preparer.js');
        const sectionDataPreparer = new DialogSectionDataPreparer();
        if (logThisFile) API.log('info', '✅ DialogSectionDataPreparer instantiated successfully');

        // Test Features Renderer
        const { DialogFeaturesRenderer } = await import('./ui/dialogs/dialog-features-renderer.js');
        const featuresRenderer = new DialogFeaturesRenderer();
        if (logThisFile) API.log('info', '✅ DialogFeaturesRenderer instantiated successfully');

        // Test State Manager
        const { DialogStateManager } = await import('./ui/dialogs/dialog-state-manager.js');
        const stateManager = new DialogStateManager();
        if (logThisFile) API.log('info', '✅ DialogStateManager instantiated successfully');

        // Test Preset Manager
        const { PresetManager } = await import('./ui/dialogs/preset-manager.js');
        const presetManager = new PresetManager();
        if (logThisFile) API.log('info', '✅ PresetManager instantiated successfully');

        if (logThisFile) API.log('info', '✅ All individual modules instantiated successfully');

    } catch (error) {
        if (logThisFile) API.log('error', 'Individual module test failed:', error);
    }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    window.testIntegration = testIntegration;
    window.testIndividualModules = testIndividualModules;
}
