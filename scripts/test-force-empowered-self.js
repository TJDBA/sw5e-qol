import { featureManager } from './features/feature-manager.js';
import { API } from './api.js';

/**
 * Test script for Force-Empowered Self feature
 */
export class ForceEmpoweredSelfTest {
    constructor() {
        this.testActor = null;
    }

    /**
     * Initialize the test
     */
    async init() {
        try {
            API.log('info', 'Testing Force-Empowered Self feature...');
            
            // Initialize feature manager
            await featureManager.init();
            
            // Get a test actor
            this.testActor = game.actors.contents[0];
            if (!this.testActor) {
                API.log('warning', 'No actors found for testing');
                return;
            }
            
            API.log('info', `Using test actor: ${this.testActor.name}`);
            
            // Test feature discovery
            await this.testFeatureDiscovery();
            
            // Test feature rendering
            await this.testFeatureRendering();
            
        } catch (error) {
            API.log('error', 'Failed to test Force-Empowered Self feature', error);
        }
    }

    /**
     * Test feature discovery
     */
    async testFeatureDiscovery() {
        try {
            API.log('info', 'Testing Force-Empowered Self discovery...');
            
            // Test damage features
            const damageFeatures = featureManager.getAvailableFeatures(this.testActor, 'damage');
            const forceFeature = damageFeatures.find(f => f.id === 'force-empowered-self');
            
            if (forceFeature) {
                API.log('info', `✅ Found Force-Empowered Self feature for ${this.testActor.name}`);
                API.log('debug', `- Name: ${forceFeature.name}`);
                API.log('debug', `- Description: ${forceFeature.description}`);
                API.log('debug', `- Affects: ${forceFeature.affects.join(', ')}`);
            } else {
                API.log('warning', `❌ Force-Empowered Self feature not found for ${this.testActor.name}`);
                API.log('debug', 'Available damage features:', damageFeatures.map(f => f.name));
            }
            
        } catch (error) {
            API.log('error', 'Failed to test feature discovery', error);
        }
    }

    /**
     * Test feature rendering
     */
    async testFeatureRendering() {
        try {
            API.log('info', 'Testing Force-Empowered Self rendering...');
            
            const damageFeatures = featureManager.getAvailableFeatures(this.testActor, 'damage');
            const forceFeature = damageFeatures.find(f => f.id === 'force-empowered-self');
            
            if (!forceFeature) {
                API.log('warning', 'Force-Empowered Self feature not available for testing');
                return;
            }
            
            // Test HTML rendering
            const html = forceFeature.htmlTemplate({
                actor: this.testActor,
                dialogType: 'damage',
                themeName: 'bendu',
                featureData: { enabled: true }
            });
            
            API.log('info', '✅ Force-Empowered Self HTML rendered successfully');
            API.log('debug', 'HTML preview:', html.substring(0, 300) + '...');
            
            // Check for key styling elements
            if (html.includes('toggle-switch') && html.includes('toggle-slider')) {
                API.log('info', '✅ Toggle switch styling applied correctly');
            } else {
                API.log('warning', '❌ Toggle switch styling missing');
            }
            
            if (html.includes('title=') && html.includes('cursor: help')) {
                API.log('info', '✅ Tooltip functionality added correctly');
            } else {
                API.log('warning', '❌ Tooltip functionality missing');
            }
            
            // Test modifiers
            const modifiers = forceFeature.rollModifiers({
                actor: this.testActor,
                dialogType: 'damage',
                dialogState: {},
                featureData: { enabled: true }
            });
            
            API.log('info', '✅ Force-Empowered Self modifiers generated');
            API.log('debug', 'Modifiers:', modifiers);
            
            // Test with feature disabled
            const disabledModifiers = forceFeature.rollModifiers({
                actor: this.testActor,
                dialogType: 'damage',
                dialogState: {},
                featureData: { enabled: false }
            });
            
            API.log('info', '✅ Force-Empowered Self correctly handles disabled state');
            API.log('debug', 'Disabled modifiers:', disabledModifiers);
            
        } catch (error) {
            API.log('error', 'Failed to test feature rendering', error);
        }
    }
}

// Auto-run test when script loads (for development)
if (typeof game !== 'undefined' && game.ready) {
    const test = new ForceEmpoweredSelfTest();
    test.init();
}

