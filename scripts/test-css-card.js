/**
 * Test CSS Card
 * Create a simple test card to verify CSS is working
 */

import { API } from './api.js';

const logThisFile = true;

/**
 * Test CSS card creation
 */
export async function testCSSCard() {
    try {
        if (logThisFile) API.log('info', '=== CSS CARD TEST STARTING ===');
        
        // Create a simple test card HTML
        const testCardHtml = `
            <div class="sw5e-qol-card" data-message-id="test-123" data-card-type="test">
                <div class="card-border" style="border-left-color: #00e1ff;">
                    <div class="card-header">
                        <div class="card-title">
                            <h3>Test Card - Attack Roll</h3>
                            <span class="card-timestamp">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="card-user">
                            <img src="/icons/svg/mystery-man.svg" alt="Test Actor" class="user-avatar" />
                            <span class="user-name">Test Actor</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>This is a test card to verify CSS is working</p>
                    </div>
                </div>
            </div>
        `;
        
        if (logThisFile) API.log('info', 'Test card HTML:', testCardHtml);
        
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
                
                // Check if CSS classes are applied
                const hasCardClass = cardElement.classList.contains('sw5e-qol-card');
                const hasBorderClass = cardElement.querySelector('.card-border');
                
                if (logThisFile) API.log('info', 'Test card CSS classes applied:', {
                    hasCardClass: hasCardClass,
                    hasBorderClass: !!hasBorderClass
                });
                
            } else {
                if (logThisFile) API.log('info', '❌ Test card not found in DOM');
            }
        }, 100);
        
        if (logThisFile) API.log('info', '=== CSS CARD TEST COMPLETED ===');
        
        return message;
        
    } catch (error) {
        API.log('error', 'CSS card test failed:', error);
        throw error;
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    testCSSCard();
}
