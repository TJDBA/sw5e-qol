/**
 * Test file for createDamageRoll method
 * Tests damage roll creation with various formulas and advantage types
 * Location: scripts/test-create-damage-roll.js
 */

import { API } from './api.js';

const logThisFile = true;

/**
 * Test createDamageRoll with the specified formula and advantage type
 * @param {string} formula - The damage formula to test
 * @param {string} advantageType - The advantage type ('Advantage', 'Normal', 'Disadvantage')
 * @returns {Object} The damage roll result object
 */
async function testCreateDamageRoll(formula, advantageType) {
    try {
        if (logThisFile) API.log('info', `Testing createDamageRoll with formula: "${formula}" and advantage: "${advantageType}"`);
        
        // Get the DiceRoller from the module API
        const module = game.modules.get('sw5e-qol');
        if (!module || !module.api || !module.api.DiceRoller) {
            console.error('SW5E-QOL module or DiceRoller not found in API');
            return null;
        }
        
        const diceRoller = new module.api.DiceRoller();
        
        // Create minimal state object
        const state = {
            dialogState: {
                advantageSelection: advantageType
            }
        };
        
        // Create the damage roll
        const result = await diceRoller.createDamageRoll(formula, state);
        
        if (logThisFile) API.log('debug', 'Damage roll result:', result);
        
        console.log(`✅ Damage roll created for ${advantageType}:`, result);
        return result;
        
    } catch (error) {
        console.error(`❌ Error testing createDamageRoll with ${advantageType}:`, error);
        if (logThisFile) API.log('error', `Error testing createDamageRoll:`, error);
        return null;
    }
}

/**
 * Display rolls from a damage roll result object
 * @param {Object} result - The damage roll result object
 * @param {string} advantageType - The advantage type for logging
 */
async function displayDamageRolls(result, advantageType) {
    if (!result) {
        console.log(`❌ No result to display for ${advantageType}`);
        return;
    }
    
    // Display each roll type if it exists
    if (result.normalRoll) {
        console.log(`🎲 Displaying normalRoll for ${advantageType}:`, result.normalRoll);
        await game.dice3d.show(result.normalRoll);
    }
    
    if (result.baseRoll) {
        console.log(`🎲 Displaying baseRoll for ${advantageType}:`, result.baseRoll);
        await game.dice3d.show(result.baseRoll);
    }
    
    if (result.critRoll) {
        console.log(`🎲 Displaying critRoll for ${advantageType}:`, result.critRoll);
        await game.dice3d.show(result.critRoll);
    }
}

/**
 * Run comprehensive test with all advantage types
 * Tests the default formula with 10-second delays between each advantage type
 */
async function runComprehensiveTest() {
    const defaultFormula = '1d8min4[energy] + 2d4r2[fire] + 5[ion]';
    const advantageTypes = ['Advantage', 'Normal', 'Disadvantage'];
    
    console.log('🚀 Starting comprehensive damage roll test...');
    console.log(`📋 Formula: ${defaultFormula}`);
    
    for (let i = 0; i < advantageTypes.length; i++) {
        const advantageType = advantageTypes[i];
        console.log(`\n⏱️  Testing ${advantageType} (${i + 1}/${advantageTypes.length})`);
        
        const result = await testCreateDamageRoll(defaultFormula, advantageType);
        await displayDamageRolls(result, advantageType);
        
        // Wait 10 seconds before next test (except for the last one)
        if (i < advantageTypes.length - 1) {
            console.log('⏳ Waiting 10 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    console.log('\n🎉 Comprehensive damage roll test completed!');
}

// Make functions available globally for console access
window.testCreateDamageRoll = testCreateDamageRoll;
window.displayDamageRolls = displayDamageRolls;
window.runComprehensiveTest = runComprehensiveTest;

// Log availability to console
console.log('🎯 Damage roll test functions loaded:');
console.log('  - testCreateDamageRoll(formula, advantageType) - Create damage roll and return result object');
console.log('  - displayDamageRolls(result, advantageType) - Display rolls from result object');
console.log('  - runComprehensiveTest() - Run test with all advantage types and 10-second delays');
console.log('📝 Example: const result = testCreateDamageRoll("2d6[kinetic] + 1d4[fire]", "Advantage")');
console.log('📝 Then: displayDamageRolls(result, "Advantage")');
