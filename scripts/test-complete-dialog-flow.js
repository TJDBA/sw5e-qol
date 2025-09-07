/**
 * Complete Dialog Flow Test
 * Tests both attack and damage dialogs to verify all imports and function calls
 */

const logThisFile = true;

// Test function for attack dialog
async function testAttackDialog() {
    console.log('=== TESTING ATTACK DIALOG ===');
    
    const token = canvas.tokens?.controlled[0];
    if (!token?.actor) {
        ui.notifications.warn("Please select a token first!");
        return;
    }

    const module = game.modules.get("sw5e-qol");
    if (!module?.api?.GenericRollDialog) {
        console.error('GenericRollDialog not available in module.api');
        return;
    }

    console.log('Creating GenericRollDialog instance...');
    const handler = new module.api.GenericRollDialog();

    const options = {
        actorId: token.actor.id,
        type: 'attack',
        title: `Attack Test`,
        theme: 'dark',
        modifiers: [
            {
                name: `Test Attack Modifier`,
                type: 'Untyped',
                modifier: `3`,
                isEnabled: true,
                isDice: false
            }
        ]
    };

    console.log('Opening attack dialog...');
    const result = await handler.openDialog(token.id, "attack", options);
    console.log('Attack dialog result:', result);
}

// Test function for damage dialog
async function testDamageDialog() {
    console.log('=== TESTING DAMAGE DIALOG ===');
    
    const token = canvas.tokens?.controlled[0];
    if (!token?.actor) {
        ui.notifications.warn("Please select a token first!");
        return;
    }

    const module = game.modules.get("sw5e-qol");
    if (!module?.api?.GenericRollDialog) {
        console.error('GenericRollDialog not available in module.api');
        return;
    }

    console.log('Creating GenericRollDialog instance...');
    const handler = new module.api.GenericRollDialog();

    const options = {
        actorId: token.actor.id,
        type: 'damage',
        title: `Damage Test`,
        theme: 'dark',
        modifiers: [
            {
                name: `Test Damage Modifier`,
                type: 'Untyped',
                modifier: `5`,
                isEnabled: true,
                isDice: false
            }
        ]
    };

    console.log('Opening damage dialog...');
    const result = await handler.openDialog(token.id, "damage", options);
    console.log('Damage dialog result:', result);
}

// Test function to verify all imports
function testImports() {
    console.log('=== TESTING IMPORTS ===');
    
    const module = game.modules.get("sw5e-qol");
    if (!module?.api) {
        console.error('Module API not available');
        return;
    }

    console.log('Available API components:');
    console.log('- GenericRollDialog:', !!module.api.GenericRollDialog);
    console.log('- GenericRollHandler:', !!module.api.GenericRollHandler);
    console.log('- GenericRollRenderer:', !!module.api.GenericRollRenderer);
    console.log('- GenericInputHandler:', !!module.api.GenericInputHandler);
    console.log('- API:', !!module.api.API);
    console.log('- themeManager:', !!module.api.themeManager);
    console.log('- CardHandler:', !!module.api.CardHandler);
    console.log('- CardRenderer:', !!module.api.CardRenderer);

    if (module.api.debug) {
        console.log('Debug info:', module.api.debug);
    }
}

// Main test function
async function runCompleteTest() {
    console.log('=== COMPLETE DIALOG FLOW TEST ===');
    
    // Test imports first
    testImports();
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test attack dialog
    await testAttackDialog();
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test damage dialog
    await testDamageDialog();
    
    console.log('=== TEST COMPLETE ===');
}

// Export for console use
window.testCompleteDialogFlow = runCompleteTest;
window.testAttackDialog = testAttackDialog;
window.testDamageDialog = testDamageDialog;
window.testImports = testImports;

console.log('Dialog flow test functions loaded. Use:');
console.log('- testImports() - Check all imports');
console.log('- testAttackDialog() - Test attack dialog');
console.log('- testDamageDialog() - Test damage dialog');
console.log('- runCompleteTest() - Run all tests');
