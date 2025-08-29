# Foundry Console Test Commands

## Quick StateManager Test

After the module loads successfully, run these commands in the Foundry console (F12):

### 1. Basic StateManager Test

```javascript
// Test basic functionality
const stateManager = new StateManager();
const attackState = stateManager.createWorkflowState('attack', {
  actor: { id: 'actor1', name: 'Test Actor' },
  targets: [{ id: 'target1', name: 'Test Target' }]
});

console.log('✅ Attack state created:', attackState);
console.log('✅ Workflow type:', attackState.workflowType);
console.log('✅ Actor:', attackState.actor.name);
console.log('✅ Targets:', attackState.targets.length);
```

### 2. Pack Feature Test

```javascript
// Test pack features
const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
  superiorityDice: '1d8',
  used: false
});

console.log('✅ Added combat-superiority feature');
console.log('✅ Has feature:', stateManager.hasPackFeature(stateWithFeature, 'combat-superiority'));
console.log('✅ Feature data:', stateManager.getPackFeature(stateWithFeature, 'combat-superiority'));
```

### 3. State Update Test

```javascript
// Test state updates
const updatedState = stateManager.updateState(stateWithFeature, {
  data: { weapon: 'lightsaber', attackBonus: 5 },
  currentPhase: 'rolling'
}, 'test');

console.log('✅ State updated');
console.log('✅ Current phase:', updatedState.currentPhase);
console.log('✅ Weapon:', updatedState.data.weapon);
```

### 4. Serialization Test

```javascript
// Test serialization
const serialized = stateManager.serializeState(updatedState);
const deserialized = stateManager.deserializeState(serialized);

console.log('✅ State serialized');
console.log('✅ State deserialized');
console.log('✅ Data preserved:', updatedState.workflowType === deserialized.workflowType);
```

### 5. Complete Test Suite

```javascript
// Run all tests at once
function testStateManager() {
  console.log('🎯 Testing StateManager...');
  
  try {
    const stateManager = new StateManager();
    
    // Test 1: Create state
    const attackState = stateManager.createWorkflowState('attack', {
      actor: { id: 'actor1', name: 'Test Actor' },
      targets: [{ id: 'target1', name: 'Test Target' }]
    });
    console.log('✅ Test 1: State creation - PASSED');
    
    // Test 2: Add pack feature
    const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
      superiorityDice: '1d8',
      used: false
    });
    console.log('✅ Test 2: Pack features - PASSED');
    
    // Test 3: Update state
    const updatedState = stateManager.updateState(stateWithFeature, {
      data: { weapon: 'lightsaber', attackBonus: 5 },
      currentPhase: 'rolling'
    }, 'test');
    console.log('✅ Test 3: State updates - PASSED');
    
    // Test 4: Serialization
    const serialized = stateManager.serializeState(updatedState);
    const deserialized = stateManager.deserializeState(serialized);
    console.log('✅ Test 4: Serialization - PASSED');
    
    // Test 5: Feature operations
    const hasFeature = stateManager.hasPackFeature(updatedState, 'combat-superiority');
    const feature = stateManager.getPackFeature(updatedState, 'combat-superiority');
    console.log('✅ Test 5: Feature operations - PASSED');
    
    console.log('🎉 All StateManager tests passed!');
    return { stateManager, attackState, updatedState, serialized, deserialized };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Run the complete test
testStateManager();
```

## Expected Output

If everything works correctly, you should see:

1. **Module loading messages** in the console
2. **No error messages** about missing files
3. **All test results** showing ✅ PASSED
4. **State objects** with proper structure
5. **Pack features** working correctly
6. **Serialization** preserving data

## Troubleshooting

If you see errors:

1. **Check module is loaded**: `game.modules.get('sw5e-qol')`
2. **Check StateManager is available**: `typeof StateManager`
3. **Check console for specific error messages**
4. **Refresh Foundry** and try again

## Next Steps

After successful testing:

1. **StateManager is working** ✅
2. **Move to Dice Engine** implementation
3. **Build workflow dialogs** 
4. **Implement pack system**

Let me know how the testing goes!
