/**
 * Test Inline Styling
 * Test that the new card system works without external CSS
 */

import { API } from './api.js';

const logThisFile = true;

/**
 * Test inline styling approach
 */
export async function testInlineStyling() {
    try {
        if (logThisFile) API.log('info', '=== INLINE STYLING TEST STARTING ===');
        
        // Create a test card with inline styling (no external CSS dependency)
        const testCardHtml = `
            <div class="sw5e-qol-card" data-message-id="inline-test-123" data-card-type="test">
                <div class="card-border" style="border-left: 4px solid #00e1ff; background: #3a3a3a; border-radius: 0 8px 8px 0; margin: 0.5rem 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div class="card-header" style="background: #2a2a2a; border-bottom: 1px solid #888888; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div class="card-title">
                            <h3 style="color: #e0e0e0; margin: 0; font-size: 1.1rem;">Test Card - Attack Roll</h3>
                            <span class="card-timestamp" style="color: #888888; font-size: 0.8rem; margin-left: 0.5rem;">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="card-user" style="display: flex; align-items: center; gap: 0.5rem;">
                            <img src="/icons/svg/mystery-man.svg" alt="Test Actor" class="user-avatar" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #888888; object-fit: cover;" />
                            <span class="user-name" style="color: #f0f0f0; font-size: 0.9rem;">Test Actor</span>
                        </div>
                    </div>
                    <div class="card-body" style="background: #3a3a3a; color: #f0f0f0; padding: 1rem;">
                        <div class="roll-section" style="text-align: center; margin: 1rem 0;">
                            <div class="roll-total" style="color: #4CAF50; font-weight: bold; font-size: 1.5rem; margin-bottom: 0.5rem;">15</div>
                            <div class="roll-formula" style="color: #b0b0b0; font-size: 0.9rem;">1d20 + 5</div>
                        </div>
                        <p style="margin: 0; text-align: center;">This card uses inline styling and should work without external CSS!</p>
                    </div>
                </div>
            </div>
        `;
        
        if (logThisFile) API.log('info', 'Test card HTML with inline styling created');
        
        // Create a chat message with the test card
        const messageData = {
            content: testCardHtml,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            speaker: {
                alias: 'Test User'
            }
        };
        
        const message = await ChatMessage.create(messageData);
        
        if (logThisFile) API.log('info', 'Test card message created with ID:', message.id);
        
        // Check if the card appears in the DOM with correct styling
        setTimeout(() => {
            const cardElement = document.querySelector(`[data-message-id="${message.id}"]`);
            if (cardElement) {
                if (logThisFile) API.log('info', '✅ Test card found in DOM');
                
                // Check computed styles
                const computedStyle = window.getComputedStyle(cardElement);
                const bgColor = computedStyle.getPropertyValue('background-color');
                const textColor = computedStyle.getPropertyValue('color');
                const borderColor = computedStyle.getPropertyValue('border-left-color');
                
                if (logThisFile) API.log('info', 'Test card computed styles:', {
                    backgroundColor: bgColor,
                    color: textColor,
                    borderLeftColor: borderColor
                });
                
                // Check if the inline styles are working
                const hasInlineStyles = cardElement.querySelector('[style]');
                if (hasInlineStyles) {
                    if (logThisFile) API.log('info', '✅ Inline styles are present and should be working');
                } else {
                    if (logThisFile) API.log('info', '❌ No inline styles found');
                }
                
            } else {
                if (logThisFile) API.log('info', '❌ Test card not found in DOM');
            }
        }, 100);
        
        if (logThisFile) API.log('info', '=== INLINE STYLING TEST COMPLETED ===');
        
        return message;
        
    } catch (error) {
        API.log('error', 'Inline styling test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testInlineStyling();
}
