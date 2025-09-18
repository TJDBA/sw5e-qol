/**
 * Force CSS Reload
 * Force reload the cards.css file to ensure it's loaded
 */

import { API } from './api.js';

const logThisFile = true;

/**
 * Force reload CSS files
 */
export function forceCSSReload() {
    if (logThisFile) API.log('info', '=== FORCING CSS RELOAD ===');
    
    // Remove existing cards.css if it exists
    const existingCardsCSS = document.querySelector('link[href*="cards.css"]');
    if (existingCardsCSS) {
        existingCardsCSS.remove();
        API.log('info', 'Removed existing cards.css link');
    }
    
    // Create new link element for cards.css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'modules/sw5e-qol/styles/cards.css';
    link.id = 'sw5e-qol-cards-css';
    
    // Add to head
    document.head.appendChild(link);
    API.log('info', 'Added cards.css link to head');
    
    // Wait a moment for it to load
    setTimeout(() => {
        // Check if it loaded
        const cardsCSS = Array.from(document.styleSheets).find(sheet => 
            sheet.href && sheet.href.includes('cards.css')
        );
        
        if (cardsCSS) {
            API.log('info', '✅ cards.css successfully loaded after force reload');
            
            // Try to access CSS rules
            try {
                const rules = Array.from(cardsCSS.cssRules || []);
                const cardRules = rules.filter(rule => 
                    rule.selectorText && rule.selectorText.includes('sw5e-qol-card')
                );
                API.log('info', `Found ${cardRules.length} sw5e-qol-card rules after reload`);
            } catch (e) {
                API.log('info', '❌ Cannot access CSS rules (CORS):', e.message);
            }
        } else {
            API.log('info', '❌ cards.css still not loaded after force reload');
        }
    }, 100);
    
    if (logThisFile) API.log('info', '=== CSS RELOAD COMPLETED ===');
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    forceCSSReload();
}
