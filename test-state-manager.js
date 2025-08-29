// test-state-manager.js
// Node.js test script for StateManager

// Mock Foundry objects for Node.js testing
global.game = {
  actors: {
    get: (id) => ({ id, name: `Actor ${id}`, type: 'character', img: '' })
  },
  scenes: {
    get: (id) => ({
      tokens: {
        get: (tokenId) => ({ id: tokenId, name: `Token ${tokenId}`, document: { img: '' } })
      }
    })
  }
};

// Mock Roll class
global.Roll = class MockRoll {
  constructor(formula) {
    this.formula = formula;
    this.total = Math.floor(Math.random() * 20) + 1;
    this.results = [{ result: this.total }];
  }
};

// Mock Token class
global.Token = class MockToken {
  constructor(data) {
    Object.assign(this, data);
  }
};

// Mock Actor class
global.Actor = class MockActor {
  constructor(data) {
    Object.assign(this, data);
  }
};

// Mock Item class
global.Item = class MockItem {
  constructor(data) {
    Object.assign(this, data);
  }
};

// Import StateManager (using dynamic import for Node.js)
async function runTests() {
  try {
    // Dynamic import for Node.js
    const { StateManager } = await import('./scripts/core/state/state-manager.js');
    
    console.log('🎯 SW5E QoL - StateManager Tests\n');
    
    // Test 1: Basic Functionality
    console.log('--- Test 1: Basic Functionality ---');
    const stateManager = new StateManager();
    console.log('✅ StateManager created successfully');
    
    const attackState = stateManager.createWorkflowState('attack', {
      actor: { id: 'actor1', name: 'Test Actor' },
      targets: [{ id: 'target1', name: 'Test Target' }]
    });
    console.log('✅ Attack state created');
    console.log(`   - Workflow Type: ${attackState.workflowType}`);
    console.log(`   - Actor: ${attackState.actor.name}`);
    console.log(`   - Targets: ${attackState.targets.length}`);
    
    // Test 2: Pack Features
    console.log('\n--- Test 2: Pack Features ---');
    const stateWithFeature = stateManager.addPackFeature(attackState, 'combat-superiority', {
      superiorityDice: '1d8',
      used: false
    });
    console.log('✅ Added combat-superiority feature');
    
    const stateWithMoreFeatures = stateManager.addPackFeature(stateWithFeature, 'force-empowered-strikes', {
      damageConversion: { from: 'kinetic', to: 'energy' }
    });
    console.log('✅ Added force-empowered-strikes feature');
    
    console.log(`✅ Has combat-superiority: ${stateManager.hasPackFeature(stateWithMoreFeatures, 'combat-superiority')}`);
    console.log(`✅ Has force-empowered-strikes: ${stateManager.hasPackFeature(stateWithMoreFeatures, 'force-empowered-strikes')}`);
    
    const feature = stateManager.getPackFeature(stateWithMoreFeatures, 'combat-superiority');
    console.log(`✅ Combat superiority data: ${JSON.stringify(feature)}`);
    
    // Test 3: State Updates
    console.log('\n--- Test 3: State Updates ---');
    const updatedState = stateManager.updateState(stateWithMoreFeatures, {
      data: { weapon: 'lightsaber', attackBonus: 5 },
      currentPhase: 'rolling'
    }, 'test');
    console.log('✅ State updated successfully');
    console.log(`   - Current Phase: ${updatedState.currentPhase}`);
    console.log(`   - Weapon: ${updatedState.data.weapon}`);
    console.log(`   - Attack Bonus: ${updatedState.data.attackBonus}`);
    
    // Test 4: Serialization
    console.log('\n--- Test 4: Serialization ---');
    const serialized = stateManager.serializeState(updatedState);
    console.log('✅ State serialized successfully');
    console.log(`   - Serialized size: ${JSON.stringify(serialized).length} characters`);
    
    // Test 5: Deserialization
    console.log('\n--- Test 5: Deserialization ---');
    const deserialized = stateManager.deserializeState(serialized);
    console.log('✅ State deserialized successfully');
    
    // Verify data preservation
    const originalActor = updatedState.actor;
    const deserializedActor = deserialized.actor;
    console.log(`✅ Actor ID preserved: ${originalActor.id === deserializedActor.id}`);
    console.log(`✅ Actor name preserved: ${originalActor.name === deserializedActor.name}`);
    
    // Test 6: Pack Feature Operations
    console.log('\n--- Test 6: Pack Feature Operations ---');
    console.log(`✅ Has combat-superiority: ${stateManager.hasPackFeature(updatedState, 'combat-superiority')}`);
    console.log(`✅ Has force-empowered-strikes: ${stateManager.hasPackFeature(updatedState, 'force-empowered-strikes')}`);
    
    // Test 7: Remove Pack Feature
    console.log('\n--- Test 7: Remove Pack Feature ---');
    const stateWithoutFeature = stateManager.removePackFeature(updatedState, 'combat-superiority');
    console.log(`✅ Removed combat-superiority: ${!stateManager.hasPackFeature(stateWithoutFeature, 'combat-superiority')}`);
    
    // Test 8: Complex Object Serialization
    console.log('\n--- Test 8: Complex Object Serialization ---');
    const complexState = stateManager.createWorkflowState('attack', {
      actor: new Actor({ id: 'actor1', name: 'Test Actor', type: 'character', img: 'test.jpg' }),
      targets: [new Token({ id: 'token1', name: 'Test Token', document: { img: 'token.jpg' } })],
      data: {
        weapon: new Item({ id: 'weapon1', name: 'Lightsaber', type: 'weapon', img: 'weapon.jpg' }),
        attackRoll: new Roll('1d20+5')
      }
    });
    console.log('✅ Created state with complex objects');
    
    const complexSerialized = stateManager.serializeState(complexState);
    console.log('✅ Complex state serialized successfully');
    console.log(`   - Serialized size: ${JSON.stringify(complexSerialized).length} characters`);
    
    const complexDeserialized = stateManager.deserializeState(complexSerialized);
    console.log('✅ Complex state deserialized successfully');
    
    // Verify complex data preservation
    console.log(`✅ Roll formula preserved: ${complexState.data.attackRoll.formula === complexDeserialized.data.attackRoll.formula}`);
    
    console.log('\n🎉 All StateManager tests completed successfully!');
    
    // Return test results for inspection
    return {
      stateManager,
      attackState,
      updatedState,
      serialized,
      deserialized,
      complexState,
      complexSerialized,
      complexDeserialized
    };
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
