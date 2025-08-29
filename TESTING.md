# SW5E QoL - Testing Guide

## StateManager Testing

The `StateManager` component has been implemented and is ready for testing. Here's how to test it:

### 1. Browser Testing (Recommended for Development)

Open `test-state-manager.html` in your web browser to test the StateManager functionality:

- **Run All Tests**: Tests all StateManager features
- **Test Pack Features**: Tests pack feature management
- **Test Serialization**: Tests state serialization/deserialization
- **Clear Output**: Clears test results

### 2. Foundry VTT Testing

To test in Foundry VTT:

1. **Install the module** in your local Foundry instance
2. **Open browser console** (F12)
3. **Run test commands**:

```javascript
// Test basic functionality
const stateManager = new StateManager();
const attackState = stateManager.createWorkflowState('attack', {
  actor: canvas.tokens.controlled[0]?.actor,
  targets: Array.from(game.user.targets)
});

// Test pack features
const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
  superiorityDice: '1d8',
  used: false
});

// Test serialization
const serialized = stateManager.serializeState(stateWithFeature);
const deserialized = stateManager.deserializeState(serialized);

console.log('State:', attackState);
console.log('With Feature:', stateWithFeature);
console.log('Serialized:', serialized);
console.log('Deserialized:', deserialized);
```

### 3. Test Coverage

The StateManager tests cover:

- ✅ **Workflow State Creation**: Creating new workflow states
- ✅ **Pack Feature Management**: Adding/removing/querying pack features
- ✅ **State Updates**: Updating state with new data
- ✅ **State Serialization**: Converting state to/from JSON for chat card storage
- ✅ **Object Reconstruction**: Rebuilding Foundry objects from serialized data
- ✅ **Validation**: Basic state validation
- ✅ **Event System**: State change listeners and notifications

### 4. Expected Behavior

- **State Creation**: Should create properly structured state objects
- **Pack Features**: Should maintain array of features with IDs
- **Serialization**: Should extract key data, not full objects
- **Reconstruction**: Should rebuild Foundry objects when possible
- **Validation**: Should catch invalid states

### 5. Next Steps

After testing the StateManager:

1. **Verify functionality** works as expected
2. **Test edge cases** (null values, invalid data)
3. **Move to next component** (Dice Engine or Workflow Orchestrator)

### 6. Known Limitations

- **Mock Objects**: Test HTML uses mock Foundry classes
- **Foundry Integration**: Some features require full Foundry environment
- **Error Handling**: Basic error handling implemented

## Questions or Issues?

If you encounter any problems during testing:

1. Check the browser console for error messages
2. Verify the StateManager is properly imported
3. Check that all required methods are available
4. Test with simpler data first

The StateManager is designed to be robust and handle edge cases gracefully, but let me know if you find any issues!
