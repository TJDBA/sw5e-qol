// scripts/core/state/test-state-manager.js
// Simple test file for StateManager functionality

import { StateManager } from './state-manager.js';

// Test function to run in browser console
export function testStateManager() {
  console.log('Testing StateManager...');
  
  const stateManager = new StateManager();
  
  // Test 1: Create workflow state
  console.log('\n--- Test 1: Create Workflow State ---');
  const attackState = stateManager.createWorkflowState('attack', {
    actor: { id: 'actor1', name: 'Test Actor' },
    targets: [{ id: 'target1', name: 'Test Target' }]
  });
  console.log('Attack state created:', attackState);
  
  // Test 2: Add pack feature
  console.log('\n--- Test 2: Add Pack Feature ---');
  const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
    superiorityDice: '1d8',
    used: false
  });
  console.log('State with feature:', stateWithFeature);
  
  // Test 3: Update state
  console.log('\n--- Test 3: Update State ---');
  const updatedState = stateManager.updateState(stateWithFeature, {
    data: { weapon: 'lightsaber', attackBonus: 5 },
    currentPhase: 'rolling'
  }, 'test');
  console.log('Updated state:', updatedState);
  
  // Test 4: Serialize state
  console.log('\n--- Test 4: Serialize State ---');
  const serialized = stateManager.serializeState(updatedState);
  console.log('Serialized state:', serialized);
  
  // Test 5: Deserialize state
  console.log('\n--- Test 5: Deserialize State ---');
  const deserialized = stateManager.deserializeState(serialized);
  console.log('Deserialized state:', deserialized);
  
  // Test 6: Pack feature operations
  console.log('\n--- Test 6: Pack Feature Operations ---');
  console.log('Has combat-superiority:', stateManager.hasPackFeature(updatedState, 'combat-superiority'));
  console.log('Get combat-superiority:', stateManager.getPackFeature(updatedState, 'combat-superiority'));
  
  // Test 7: Remove pack feature
  console.log('\n--- Test 7: Remove Pack Feature ---');
  const stateWithoutFeature = stateManager.removePackFeature(updatedState, 'combat-superiority');
  console.log('State without feature:', stateWithoutFeature);
  console.log('Has combat-superiority:', stateManager.hasPackFeature(stateWithoutFeature, 'combat-superiority'));
  
  console.log('\nStateManager tests completed!');
  return { stateManager, attackState, updatedState, serialized, deserialized };
}

// Export for use in other test files
export { StateManager };
