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

// Module initialization hook
Hooks.once('init', async () => {
  try {
    console.log('SW5E QoL | Module initialization starting...');
    
    // Create module instance
    moduleInstance = new SW5EQoLModule();
    
    // Initialize the module
    await moduleInstance.initialize();
    
    console.log('SW5E QoL | Module initialization completed');
    
  } catch (error) {
    console.error('SW5E QoL | Module initialization failed:', error);
    moduleInstance = null;
  }
});

// Module ready hook
Hooks.once('ready', () => {
  if (moduleInstance && moduleInstance.initialized) {
    console.log('SW5E QoL | Module ready and operational');
    
    // Expose module API globally for debugging
    if (game.modules.get('sw5e-qol')) {
      game.modules.get('sw5e-qol').api = {
        module: moduleInstance,
        stateManager: moduleInstance.stateManager,
        workflowOrchestrator: moduleInstance.workflowOrchestrator
      };
    }
    
  } else {
    console.warn('SW5E QoL | Module not properly initialized');
  }
});

// Module cleanup hook
Hooks.once('closeApplication', () => {
  if (moduleInstance) {
    moduleInstance.cleanup();
    moduleInstance = null;
    console.log('SW5E QoL | Module cleaned up');
  }
});

// Export module instance for external access
export { moduleInstance as SW5EQoLModule };
