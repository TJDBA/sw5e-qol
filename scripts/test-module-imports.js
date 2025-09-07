import { API } from './api.js';

const logThisFile = true; // Enable logging for this test

/**
 * Test individual module imports
 */
export async function testModuleImports() {
    try {
        if (logThisFile) API.log('info', 'Testing module imports...');

        // Test Dialog Manager
        try {
            const { DialogManager } = await import('./ui/dialogs/dialog-manager.js');
            if (logThisFile) API.log('info', '✅ DialogManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogManager import failed:', error.message);
        }

        // Test Event Handler
        try {
            const { DialogEventHandler } = await import('./ui/dialogs/dialog-event-handler.js');
            if (logThisFile) API.log('info', '✅ DialogEventHandler imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogEventHandler import failed:', error.message);
        }

        // Test Modifier Manager
        try {
            const { DialogModifierManager } = await import('./ui/dialogs/dialog-modifier-manager.js');
            if (logThisFile) API.log('info', '✅ DialogModifierManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogModifierManager import failed:', error.message);
        }

        // Test Feature Manager
        try {
            const { DialogFeatureManager } = await import('./ui/dialogs/dialog-feature-manager.js');
            if (logThisFile) API.log('info', '✅ DialogFeatureManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogFeatureManager import failed:', error.message);
        }

        // Test Roll Button Manager
        try {
            const { DialogRollButtonManager } = await import('./ui/dialogs/dialog-roll-button-manager.js');
            if (logThisFile) API.log('info', '✅ DialogRollButtonManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogRollButtonManager import failed:', error.message);
        }

        // Test Item Handler
        try {
            const { ItemHandler } = await import('./ui/dialogs/item-handler.js');
            if (logThisFile) API.log('info', '✅ ItemHandler imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ ItemHandler import failed:', error.message);
        }

        // Test Template Renderer
        try {
            const { DialogTemplateRenderer } = await import('./ui/dialogs/dialog-template-renderer.js');
            if (logThisFile) API.log('info', '✅ DialogTemplateRenderer imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogTemplateRenderer import failed:', error.message);
        }

        // Test Section Data Preparer
        try {
            const { DialogSectionDataPreparer } = await import('./ui/dialogs/dialog-section-data-preparer.js');
            if (logThisFile) API.log('info', '✅ DialogSectionDataPreparer imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogSectionDataPreparer import failed:', error.message);
        }

        // Test Features Renderer
        try {
            const { DialogFeaturesRenderer } = await import('./ui/dialogs/dialog-features-renderer.js');
            if (logThisFile) API.log('info', '✅ DialogFeaturesRenderer imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogFeaturesRenderer import failed:', error.message);
        }

        // Test State Manager
        try {
            const { DialogStateManager } = await import('./ui/dialogs/dialog-state-manager.js');
            if (logThisFile) API.log('info', '✅ DialogStateManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ DialogStateManager import failed:', error.message);
        }

        // Test Preset Manager
        try {
            const { PresetManager } = await import('./ui/dialogs/preset-manager.js');
            if (logThisFile) API.log('info', '✅ PresetManager imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ PresetManager import failed:', error.message);
        }

        // Test Main Coordinator
        try {
            const { GenericRollDialog } = await import('./ui/dialogs/generic-roll-dialog.js');
            if (logThisFile) API.log('info', '✅ GenericRollDialog imported successfully');
        } catch (error) {
            if (logThisFile) API.log('error', '❌ GenericRollDialog import failed:', error.message);
        }

        if (logThisFile) API.log('info', 'Module import testing completed');

    } catch (error) {
        if (logThisFile) API.log('error', 'Module import test failed:', error);
    }
}

// Make function available globally for testing
if (typeof window !== 'undefined') {
    window.testModuleImports = testModuleImports;
}
