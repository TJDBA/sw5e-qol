import { CardHandler } from './ui/cards/card-handler.js';
import { API } from './api.js';

/**
 * Test function for the Card System
 * This demonstrates how to create and display cards
 */
export async function testCardSystem() {
    try {
        const handler = new CardHandler();

        // Test 1: Simple damage card
        await testDamageCard(handler);
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 2: Attack card
        await testAttackCard(handler);
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 3: Save card
        await testSaveCard(handler);

    } catch (error) {
        API.log('error', 'Card system test failed', error);
    }
}

/**
 * Test damage card creation
 */
async function testDamageCard(handler) {
    try {
        API.log('info', 'Testing damage card creation...');
        
        // Create a mock roll for testing
        const mockRoll = new Roll("2d8 + 3");
        await mockRoll.evaluate();
        
        // Add flavor to dice for damage types
        mockRoll.terms.forEach(term => {
            if (term instanceof Die) {
                term.options.flavor = "energy";
            }
        });

        const cardData = {
            cardType: 'damage',
            title: 'Lightsaber Damage',
            userId: game.user.id,
            roll: mockRoll,
            results: {
                TotalDam: 12,
                TotalCritDam: 0,
                TotalDamByType: { energy: 12 },
                TotalCritDamByType: {},
                RollArray: [mockRoll],
                CritRollArray: [],
                TargetRef: "test-target-1"
            },
            targets: [
                {
                    tokenID: "test-target-1",
                    crit: false,
                    name: "Test Target 1"
                }
            ],
            actions: [
                {
                    action: 'roll-save',
                    label: 'Roll Save',
                    icon: 'fas fa-dice-d20',
                    class: 'primary',
                    data: {
                        saveType: 'dex',
                        dc: 15
                    }
                }
            ]
        };

        const message = await handler.createCard(cardData);
        API.log('info', `Damage card created with message ID: ${message.id}`);

    } catch (error) {
        API.log('error', 'Damage card test failed', error);
    }
}

/**
 * Test attack card creation
 */
async function testAttackCard(handler) {
    try {
        API.log('info', 'Testing attack card creation...');
        
        // Create a mock roll for testing
        const mockRoll = new Roll("1d20 + 7");
        await mockRoll.evaluate();

        const cardData = {
            cardType: 'attack',
            title: 'Blaster Pistol Attack',
            userId: game.user.id,
            roll: mockRoll,
            results: {
                total: 18,
                target: "test-target-2"
            },
            target: {
                tokenID: "test-target-2",
                name: "Test Target 2"
            },
            actions: [
                {
                    action: 'reroll',
                    label: 'Reroll',
                    icon: 'fas fa-redo',
                    class: 'secondary'
                }
            ]
        };

        const message = await handler.createCard(cardData);
        API.log('info', `Attack card created with message ID: ${message.id}`);

    } catch (error) {
        API.log('error', 'Attack card test failed', error);
    }
}

/**
 * Test save card creation
 */
async function testSaveCard(handler) {
    try {
        API.log('info', 'Testing save card creation...');
        
        // Create a mock roll for testing
        const mockRoll = new Roll("1d20 + 5");
        await mockRoll.evaluate();

        const cardData = {
            cardType: 'save',
            title: 'Dexterity Save',
            userId: game.user.id,
            roll: mockRoll,
            results: {
                total: 14,
                saveType: 'dex',
                dc: 15,
                success: false
            },
            saveType: 'dex',
            actions: []
        };

        const message = await handler.createCard(cardData);
        API.log('info', `Save card created with message ID: ${message.id}`);

    } catch (error) {
        API.log('error', 'Save card test failed', error);
    }
}

/**
 * Test card update functionality
 */
export async function testCardUpdate() {
    try {
        const handler = new CardHandler();
        
        // Get the most recent message (assuming it's one of our test cards)
        const messages = game.messages.contents;
        const recentMessage = messages[messages.length - 1];
        
        if (!recentMessage) {
            API.log('warning', 'No recent messages found for update test');
            return;
        }

        API.log('info', `Testing card update for message: ${recentMessage.id}`);
        
        // Test updating the card with new data
        const updateData = {
            results: {
                TotalDam: 15,
                TotalCritDam: 0,
                TotalDamByType: { energy: 15 },
                TotalCritDamByType: {},
                RollArray: recentMessage.getFlag('sw5e-qol', 'cardData')?.roll ? [recentMessage.getFlag('sw5e-qol', 'cardData').roll] : [],
                CritRollArray: [],
                TargetRef: "test-target-1"
            },
            actions: [
                {
                    action: 'roll-save',
                    label: 'Roll Save (Updated)',
                    icon: 'fas fa-dice-d20',
                    class: 'primary',
                    data: {
                        saveType: 'dex',
                        dc: 18
                    }
                }
            ]
        };

        await handler.updateCard(recentMessage.id, updateData);
        API.log('info', 'Card update test completed');

    } catch (error) {
        API.log('error', 'Card update test failed', error);
    }
}

/**
 * Test card interaction handling
 */
export async function testCardInteractions() {
    try {
        API.log('info', 'Testing card interactions...');
        
        // This would typically be called by event listeners
        // For testing, we'll simulate a button click
        const messages = game.messages.contents;
        const recentMessage = messages[messages.length - 1];
        
        if (!recentMessage) {
            API.log('warning', 'No recent messages found for interaction test');
            return;
        }

        // Simulate expanding a roll
        const handler = new CardHandler();
        await handler.toggleRollExpansion(recentMessage.id);
        API.log('info', 'Roll expansion toggle test completed');

    } catch (error) {
        API.log('error', 'Card interaction test failed', error);
    }
}

// Export test functions for external use
export const CardSystemTests = {
    testAll: testCardSystem,
    testDamage: testDamageCard,
    testAttack: testAttackCard,
    testSave: testSaveCard,
    testUpdate: testCardUpdate,
    testInteractions: testCardInteractions
};
