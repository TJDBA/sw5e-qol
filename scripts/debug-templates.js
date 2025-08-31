/**
 * Debug Console Log Templates
 * Copy-paste ready templates for different log levels
 * 
 * Usage: Import this file and use the templates, or copy-paste directly
 */

// ============================================================================
// BASIC LOG TEMPLATES (Copy-paste these directly)
// ============================================================================

// INFO level logging
console.info('[sw5e-qol] INFO: Your message here');
console.info('[sw5e-qol] INFO:', 'Your message here', { additionalData: 'value' });

// WARNING level logging  
console.warn('[sw5e-qol] WARNING: Your warning message here');
console.warn('[sw5e-qol] WARNING:', 'Your warning message here', { context: 'additional info' });

// ERROR level logging
console.error('[sw5e-qol] ERROR: Your error message here');
console.error('[sw5e-qol] ERROR:', 'Your error message here', { error: errorObject });

// DEBUG level logging
console.debug('[sw5e-qol] DEBUG: Your debug message here');
console.debug('[sw5e-qol] DEBUG:', 'Your debug message here', { debugData: 'value' });

// ============================================================================
// FUNCTION ENTRY/EXIT TEMPLATES
// ============================================================================

// Function entry logging
console.debug('[sw5e-qol] DEBUG: Entering functionName()', { params: { param1: 'value1' } });

// Function exit logging
console.debug('[sw5e-qol] DEBUG: Exiting functionName()', { returnValue: 'result' });

// Function error logging
console.error('[sw5e-qol] ERROR: Error in functionName()', { error: errorObject, params: { param1: 'value1' } });

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

// Workflow start
console.info('[sw5e-qol] INFO: Starting attack workflow', { 
    actor: actor.name, 
    weapon: weapon.name,
    target: target?.name 
});

// Workflow step
console.debug('[sw5e-qol] DEBUG: Processing attack roll', { 
    rollFormula: '1d20+5', 
    modifiers: ['advantage', 'bless'] 
});

// Workflow completion
console.info('[sw5e-qol] INFO: Attack workflow completed', { 
    result: 'hit', 
    damage: 15,
    duration: '150ms' 
});

// Workflow error
console.error('[sw5e-qol] ERROR: Attack workflow failed', { 
    error: errorObject, 
    step: 'damage-calculation',
    context: { actor: actor.name, weapon: weapon.name } 
});

// ============================================================================
// SETTING/STATE TEMPLATES
// ============================================================================

// Setting change
console.debug('[sw5e-qol] DEBUG: Setting changed', { 
    key: 'auto-intercept-actions', 
    oldValue: false, 
    newValue: true 
});

// State change
console.info('[sw5e-qol] INFO: Module state updated', { 
    previousState: 'inactive', 
    newState: 'active',
    reason: 'user-activation' 
});

// ============================================================================
// PERFORMANCE TEMPLATES
// ============================================================================

// Performance measurement start
const startTime = performance.now();
console.debug('[sw5e-qol] DEBUG: Starting performance measurement', { operation: 'attack-workflow' });

// Performance measurement end
const endTime = performance.now();
console.info('[sw5e-qol] INFO: Performance measurement completed', { 
    operation: 'attack-workflow',
    duration: `${(endTime - startTime).toFixed(2)}ms` 
});

// ============================================================================
// CONDITIONAL LOGGING TEMPLATES
// ============================================================================

// Conditional logging based on debug level
if (game.settings.get('sw5e-qol', 'debug-level') === 'debug') {
    console.debug('[sw5e-qol] DEBUG: Detailed debug information', { 
        detailedData: 'only shown in debug mode' 
    });
}

// Conditional logging with API helper (if using the API)
if (API.isDebugEnabled('debug')) {
    API.log('debug', 'Detailed debug information', { 
        detailedData: 'only shown in debug mode' 
    });
}

// ============================================================================
// GROUPED LOGGING TEMPLATES
// ============================================================================

// Group related logs together
console.group('[sw5e-qol] Attack Workflow');
console.info('Starting attack workflow');
console.debug('Processing attack roll');
console.debug('Calculating damage');
console.info('Workflow completed');
console.groupEnd();

// Collapsed group for less important info
console.groupCollapsed('[sw5e-qol] Detailed Calculations');
console.debug('Roll formula: 1d20+5');
console.debug('Modifiers: +2 from bless, +1 from guidance');
console.debug('Final result: 18');
console.groupEnd();

// ============================================================================
// TABLE LOGGING TEMPLATES
// ============================================================================

// Log data in table format
console.table([
    { step: 'Attack Roll', result: '18', success: true },
    { step: 'Damage Roll', result: '15', type: 'slashing' },
    { step: 'Resource Cost', result: '1 FP', remaining: '4 FP' }
]);

// ============================================================================
// TRACE TEMPLATES
// ============================================================================

// Stack trace for debugging
console.trace('[sw5e-qol] TRACE: Function call stack');

// ============================================================================
// CUSTOM LOGGER FUNCTION TEMPLATE
// ============================================================================

/**
 * Custom logger function you can copy-paste and customize
 */
function customLogger(level, message, data = null) {
    const prefix = '[sw5e-qol]';
    const timestamp = new Date().toISOString();
    
    const logData = data ? [`${prefix} ${level.toUpperCase()}: ${message}`, data, { timestamp }] 
                         : [`${prefix} ${level.toUpperCase()}: ${message}`, { timestamp }];
    
    switch (level.toLowerCase()) {
        case 'debug':
            console.debug(...logData);
            break;
        case 'info':
            console.info(...logData);
            break;
        case 'warning':
            console.warn(...logData);
            break;
        case 'error':
            console.error(...logData);
            break;
        default:
            console.log(...logData);
    }
}

// Usage examples:
// customLogger('info', 'Workflow started', { actor: 'Luke', action: 'attack' });
// customLogger('debug', 'Processing step', { step: 'roll', formula: '1d20+5' });
// customLogger('error', 'Workflow failed', { error: 'Invalid roll formula' });
