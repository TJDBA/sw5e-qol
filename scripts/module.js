/**
 * SW5E Quality of Life Module
 * Enhanced combat and action workflows for SW5E system
 * 
 * @author SW5E QoL Development Team
 * @version 0.1.0
 */

import { SW5EQoLModule } from './config.js';

// Module instance
let moduleInstance = null;

// Module initialization
Hooks.once('init', async function() {
	console.log('SW5E QoL | Initializing module...');
	
	// Initialize module configuration
	moduleInstance = new SW5EQoLModule();
	
	// Register module settings
	moduleInstance.registerSettings();
	
	// Load language files
	await moduleInstance.loadLanguages();
	
	console.log('SW5E QoL | Module initialized successfully');
});

// Module ready
Hooks.once('ready', async function() {
	console.log('SW5E QoL | Module ready, setting up workflows...');
	
	if (moduleInstance) {
		// Initialize workflows
		await moduleInstance.initializeWorkflows();
		
		// Register hooks
		moduleInstance.registerHooks();
		
		// Load templates
		await moduleInstance.loadTemplates();
		
		console.log('SW5E QoL | Workflows and hooks registered');
	}
});

// Module cleanup
Hooks.once('closeApplication', function() {
	if (moduleInstance) {
		moduleInstance.cleanup();
		console.log('SW5E QoL | Module cleaned up');
	}
});

// Export for other modules
export { moduleInstance as SW5EQoL };
