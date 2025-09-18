/**
 * CSS Debug Utility
 * Debug CSS loading and application
 */

import { API } from './api.js';

const logThisFile = true;

/**
 * Debug CSS loading and application
 */
export function debugCSS() {
    if (logThisFile) API.log('info', '=== CSS DEBUG STARTING ===');
    
    // Check if cards.css is loaded
    const cardsCSS = Array.from(document.styleSheets).find(sheet => 
        sheet.href && sheet.href.includes('cards.css')
    );
    
    if (cardsCSS) {
        API.log('info', '✅ cards.css is loaded:', cardsCSS.href);
        
        // Try to access CSS rules
        try {
            const rules = Array.from(cardsCSS.cssRules || []);
            const cardRules = rules.filter(rule => 
                rule.selectorText && rule.selectorText.includes('sw5e-qol-card')
            );
            API.log('info', `Found ${cardRules.length} sw5e-qol-card rules:`, cardRules.map(r => r.selectorText));
            
            // Check specific rules
            const borderRule = rules.find(rule => 
                rule.selectorText && rule.selectorText.includes('.card-border')
            );
            if (borderRule) {
                API.log('info', '✅ .card-border rule found:', borderRule.selectorText);
                API.log('info', 'Border rule styles:', borderRule.style.cssText);
            } else {
                API.log('info', '❌ .card-border rule not found');
            }
            
        } catch (e) {
            API.log('info', '❌ Cannot access CSS rules (CORS):', e.message);
        }
    } else {
        API.log('info', '❌ cards.css not found in loaded stylesheets');
    }
    
    // Check all loaded stylesheets
    const allSheets = Array.from(document.styleSheets).map(sheet => ({
        href: sheet.href,
        title: sheet.title,
        disabled: sheet.disabled
    }));
    API.log('info', 'All loaded stylesheets:', allSheets);
    
    // Check if sw5e-qol-card class exists in DOM
    const existingCards = document.querySelectorAll('.sw5e-qol-card');
    API.log('info', `Found ${existingCards.length} existing sw5e-qol-card elements in DOM`);
    
    if (existingCards.length > 0) {
        const firstCard = existingCards[0];
        const computedStyle = window.getComputedStyle(firstCard);
        API.log('info', 'First card computed styles:', {
            backgroundColor: computedStyle.getPropertyValue('background-color'),
            color: computedStyle.getPropertyValue('color'),
            borderLeftColor: computedStyle.getPropertyValue('border-left-color'),
            display: computedStyle.getPropertyValue('display')
        });
    }
    
    if (logThisFile) API.log('info', '=== CSS DEBUG COMPLETED ===');
}

// Auto-run if this is the main module
if (import.meta.url === `file://${window.location.pathname}`) {
    debugCSS();
}
