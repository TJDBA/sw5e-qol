# SW5E QoL - Testing Guide

## StateManager Testing

The `StateManager` component has been implemented and is ready for testing. Here are several testing methods:

### **1. Foundry VTT Testing (Recommended)**

Since you have a local Foundry install, this is the best way to test:

1. **Install the module** in your Foundry instance
2. **Open browser console** (F12) in Foundry
3. **Run test commands**:

```javascript
// Test basic functionality
const stateManager = new StateManager();
const attackState = stateManager.createWorkflowState('attack', {
  actor: canvas.tokens.controlled[0]?.actor || { id: 'test', name: 'Test Actor' },
  targets: Array.from(game.user.targets) || [{ id: 'target1', name: 'Test Target' }]
});

console.log('Attack state:', attackState);

// Test pack features
const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
  superiorityDice: '1d8',
  used: false
});

console.log('State with feature:', stateWithFeature);
console.log('Has feature:', stateManager.hasPackFeature(stateWithFeature, 'combat-superiority'));

// Test serialization
const serialized = stateManager.serializeState(stateWithFeature);
console.log('Serialized:', serialized);

const deserialized = stateManager.deserializeState(serialized);
console.log('Deserialized:', deserialized);
```

### **2. Node.js Testing (Alternative)**

If you prefer command-line testing:

1. **Install Node.js** (if not already installed)
2. **Run the test script**:

```bash
# From your project directory
node test-state-manager.js
```

This will run comprehensive tests and show results in the console.

### **3. Browser Testing (Limited)**

**Note**: Due to CORS policies, the HTML test file won't work with local files in Chrome. You can:

1. **Use a local web server** (like Python's `http.server` or Node's `http-server`)
2. **Test in Foundry VTT** instead (recommended)

### **4. Test Coverage**

The StateManager tests cover:

- ✅ **Workflow State Creation**: Creating new workflow states
- ✅ **Pack Feature Management**: Adding/removing/querying pack features
- ✅ **State Updates**: Updating state with new data
- ✅ **State Serialization**: Converting state to/from JSON for chat card storage
- ✅ **Object Reconstruction**: Rebuilding Foundry objects from serialized data
- ✅ **Validation**: Basic state validation
- ✅ **Event System**: State change listeners and notifications

### **5. Expected Behavior**

- **State Creation**: Should create properly structured state objects
- **Pack Features**: Should maintain array of features with IDs
- **Serialization**: Should extract key data, not full objects
- **Reconstruction**: Should rebuild Foundry objects when possible
- **Validation**: Should catch invalid states

### **6. Next Steps**

After testing the StateManager:

1. **Verify functionality** works as expected
2. **Test edge cases** (null values, invalid data)
3. **Move to next component** (Dice Engine or Workflow Orchestrator)

### **7. Known Limitations**

- **CORS Issues**: Browser testing requires a web server
- **Mock Objects**: Node.js tests use mock Foundry classes
- **Foundry Integration**: Some features require full Foundry environment
- **Error Handling**: Basic error handling implemented

## **Quick Test Commands**

### **Foundry Console (Copy/Paste)**

```javascript
// Quick test - copy/paste into Foundry console
const sm = new StateManager();
const state = sm.createWorkflowState('attack', { actor: { id: 'test', name: 'Test' } });
const withFeature = sm.addPackFeature(state, 'test-feature', { test: true });
const serialized = sm.serializeState(withFeature);
const deserialized = sm.deserializeState(serialized);

console.log('✅ State created:', state.workflowType);
console.log('✅ Feature added:', sm.hasPackFeature(withFeature, 'test-feature'));
console.log('✅ Serialization works:', serialized.workflowType === 'attack');
console.log('✅ Deserialization works:', deserialized.workflowType === 'attack');
```

### **Node.js Quick Test**

```bash
# Run comprehensive tests
node test-state-manager.js

# Expected output: All tests should pass with ✅ marks
```

## Questions or Issues?

If you encounter any problems during testing:

1. **Foundry Testing**: Check console for error messages, verify module is loaded
2. **Node.js Testing**: Check Node.js version (should be 14+ for ES modules)
3. **General Issues**: Test with simpler data first, check method availability

The StateManager is designed to be robust and handle edge cases gracefully, but let me know if you find any issues!
