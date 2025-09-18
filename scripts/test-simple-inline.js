/**
 * Simple Inline Test
 * Simple test for inline styling without complex imports
 */

const logThisFile = true;

/**
 * Simple inline styling test
 */
export async function testSimpleInline() {
    try {
        console.log('=== SIMPLE INLINE TEST STARTING ===');
        
        // Create a simple test card with inline styling
        const testCardHtml = `
            <div class="sw5e-qol-card" data-message-id="simple-test-123" data-card-type="test">
                <div class="card-border" style="border-left: 4px solid #00e1ff; background: #3a3a3a; border-radius: 0 8px 8px 0; margin: 0.5rem 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div class="card-header" style="background: #2a2a2a; border-bottom: 1px solid #888888; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div class="card-title">
                            <h3 style="color: #e0e0e0; margin: 0; font-size: 1.1rem;">Simple Test Card</h3>
                            <span class="card-timestamp" style="color: #888888; font-size: 0.8rem; margin-left: 0.5rem;">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="card-user" style="display: flex; align-items: center; gap: 0.5rem;">
                            <img src="/icons/svg/mystery-man.svg" alt="Test Actor" class="user-avatar" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #888888; object-fit: cover;" />
                            <span class="user-name" style="color: #f0f0f0; font-size: 0.9rem;">Test Actor</span>
                        </div>
                    </div>
                    <div class="card-body" style="background: #3a3a3a; color: #f0f0f0; padding: 1rem;">
                        <p style="margin: 0; text-align: center;">This is a simple test card with inline styling!</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Test card HTML created');
        
        // Create a chat message with the test card
        const messageData = {
            content: testCardHtml,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            speaker: {
                alias: 'Test User'
            }
        };
        
        const message = await ChatMessage.create(messageData);
        
        console.log('Test card message created with ID:', message.id);
        
        // Check if the card appears in the DOM
        setTimeout(() => {
            const cardElement = document.querySelector(`[data-message-id="${message.id}"]`);
            if (cardElement) {
                console.log('✅ Test card found in DOM');
                
                // Check computed styles
                const computedStyle = window.getComputedStyle(cardElement);
                console.log('Test card computed styles:', {
                    backgroundColor: computedStyle.getPropertyValue('background-color'),
                    color: computedStyle.getPropertyValue('color'),
                    borderLeftColor: computedStyle.getPropertyValue('border-left-color')
                });
                
            } else {
                console.log('❌ Test card not found in DOM');
            }
        }, 100);
        
        console.log('=== SIMPLE INLINE TEST COMPLETED ===');
        
        return message;
        
    } catch (error) {
        console.error('Simple inline test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testSimpleInline();
}
