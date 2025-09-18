/**
 * Card Renderer
 * Minimalistic card rendering using existing utilities
 * Location: scripts/ui/cards/card-renderer.js
 */

import { API } from '../../api.js';
import { themeManager } from '../theme-manager.js';

const logThisFile = true;

/**
 * Card Renderer Class
 * Renders chat cards with inline styling for reliability
 */
export class CardRenderer {
    constructor() {
        if (logThisFile) API.log('debug', 'CardRenderer: Constructor called');
    }

    /**
     * Render a card with the given data
     * @param {Object} cardData - Card data object
     * @returns {string} Rendered card HTML
     */
    async renderCard(cardData) {
        try {
            if (logThisFile) API.log('debug', 'CardRenderer: Starting card render');
            
            // Prepare card data with theme colors
            const preparedData = await this.prepareCardData(cardData);
            
            if (logThisFile) API.log('debug', 'CardRenderer: Prepared data:', preparedData);
            
            // Render the card using Handlebars template
            const cardHtml = await this.renderTemplate(preparedData);
            
            if (logThisFile) API.log('debug', 'CardRenderer: Card rendered successfully');
            
            return cardHtml;
            
        } catch (error) {
            API.log('error', 'CardRenderer: Failed to render card:', error);
            throw error;
        }
    }

    /**
     * Prepare card data with theme colors and fallbacks
     * @param {Object} cardData - Raw card data
     * @returns {Object} Prepared card data with theme colors
     */
    async prepareCardData(cardData) {
        // Get current theme colors
        const themeColors = this.getThemeColors();
        
        if (logThisFile) API.log('debug', 'CardRenderer: Theme colors:', themeColors);
        
        // Get user information
        const user = game.users.get(cardData.userId) || game.user;
        
        // Prepare the data with theme colors and fallbacks
        const preparedData = {
            // Basic card data
            messageId: cardData.messageId || 'unknown',
            cardType: cardData.cardType || 'generic',
            title: cardData.title || 'Unknown Action',
            timestamp: cardData.timestamp || new Date().toLocaleTimeString(),
            
            // Actor information
            actorName: cardData.actorName || 'Unknown Actor',
            actorImg: cardData.actorImg || '/icons/svg/mystery-man.svg',
            
            // User information
            userColor: cardData.userColor || user.color || '#999999',
            
            // Roll data
            roll: cardData.roll || null,
            
            // Results data
            attackResults: cardData.attackResults || null,
            damageResults: cardData.damageResults || null,
            
            // Actions
            actions: cardData.actions || [],
            
            // Theme colors
            ...themeColors
        };
        
        if (logThisFile) API.log('debug', 'CardRenderer: Prepared data with theme colors');
        if (logThisFile) API.log('debug', 'CardRenderer: Final prepared data:', preparedData);
        
        return preparedData;
    }

    /**
     * Get theme colors for the current theme
     * @returns {Object} Theme color object
     */
    getThemeColors() {
        // Get current theme
        const currentTheme = themeManager?.getCurrentTheme() || 'bendu';
        
        if (logThisFile) API.log('debug', 'CardRenderer: Current theme:', currentTheme);
        
        // Define theme color mappings
        const themeColorMap = {
            bendu: {
                cardBg: '#3a3a3a',
                headerBg: '#2a2a2a',
                footerBg: '#4a4a4a',
                textColor: '#f0f0f0',
                titleColor: '#e0e0e0',
                timestampColor: '#888888',
                borderColor: '#888888',
                rollColor: '#4CAF50',
                formulaColor: '#b0b0b0',
                damageColor: '#FF5722',
                successColor: '#4CAF50',
                errorColor: '#F44336',
                warningColor: '#FF9800',
                criticalColor: '#FFD700',
                resultBg: '#2a2a2a',
                buttonBg: '#555555',
                buttonTextColor: '#f0f0f0',
                buttonBorderColor: '#888888'
            },
            light: {
                cardBg: '#f5f5f5',
                headerBg: '#e8e8e8',
                footerBg: '#eeeeee',
                textColor: '#333333',
                titleColor: '#222222',
                timestampColor: '#666666',
                borderColor: '#cccccc',
                rollColor: '#2E7D32',
                formulaColor: '#666666',
                damageColor: '#D32F2F',
                successColor: '#2E7D32',
                errorColor: '#C62828',
                warningColor: '#F57C00',
                criticalColor: '#F9A825',
                resultBg: '#e8e8e8',
                buttonBg: '#757575',
                buttonTextColor: '#ffffff',
                buttonBorderColor: '#999999'
            },
            dark: {
                cardBg: '#1a1a1a',
                headerBg: '#0d0d0d',
                footerBg: '#2a2a2a',
                textColor: '#e0e0e0',
                titleColor: '#ffffff',
                timestampColor: '#888888',
                borderColor: '#444444',
                rollColor: '#66BB6A',
                formulaColor: '#aaaaaa',
                damageColor: '#EF5350',
                successColor: '#66BB6A',
                errorColor: '#EF5350',
                warningColor: '#FFB74D',
                criticalColor: '#FFD54F',
                resultBg: '#0d0d0d',
                buttonBg: '#424242',
                buttonTextColor: '#e0e0e0',
                buttonBorderColor: '#666666'
            },
            tech: {
                cardBg: '#1e1e2e',
                headerBg: '#11111b',
                footerBg: '#313244',
                textColor: '#cdd6f4',
                titleColor: '#f5c2e7',
                timestampColor: '#6c7086',
                borderColor: '#45475a',
                rollColor: '#a6e3a1',
                formulaColor: '#bac2de',
                damageColor: '#f38ba8',
                successColor: '#a6e3a1',
                errorColor: '#f38ba8',
                warningColor: '#fab387',
                criticalColor: '#f9e2af',
                resultBg: '#11111b',
                buttonBg: '#45475a',
                buttonTextColor: '#cdd6f4',
                buttonBorderColor: '#6c7086'
            }
        };
        
        return themeColorMap[currentTheme] || themeColorMap.bendu;
    }

    /**
     * Render the card template
     * @param {Object} data - Prepared card data
     * @returns {string} Rendered HTML
     */
    async renderTemplate(data) {
        try {
            // Use FoundryVTT's renderTemplate function
            const template = 'modules/sw5e-qol/templates/cards/base-card.hbs';
            const html = await renderTemplate(template, data);
            
            if (logThisFile) API.log('debug', 'CardRenderer: Template rendered successfully');
            
            return html;

        } catch (error) {
            API.log('error', 'CardRenderer: Failed to render template:', error);
            
            // Fallback to simple HTML if template fails
            return this.createFallbackHTML(data);
        }
    }

    /**
     * Create fallback HTML if template rendering fails
     * @param {Object} data - Card data
     * @returns {string} Fallback HTML
     */
    createFallbackHTML(data) {
        if (logThisFile) API.log('debug', 'CardRenderer: Using fallback HTML');
        
        return `
            <div class="sw5e-qol-card" data-message-id="${data.messageId}" data-card-type="${data.cardType}">
                <div class="card-border" style="border-left-color: ${data.userColor}; background: ${data.cardBg}; border-radius: 0 8px 8px 0;">
                    <div class="card-header" style="background: ${data.headerBg}; border-bottom: 1px solid ${data.borderColor}; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div class="card-title">
                            <h3 style="color: ${data.titleColor}; margin: 0; font-size: 1.1rem;">${data.title}</h3>
                            <span class="card-timestamp" style="color: ${data.timestampColor}; font-size: 0.8rem; margin-left: 0.5rem;">${data.timestamp}</span>
                        </div>
                        <div class="card-user" style="display: flex; align-items: center; gap: 0.5rem;">
                            <img src="${data.actorImg}" alt="${data.actorName}" class="user-avatar" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid ${data.borderColor}; object-fit: cover;" />
                            <span class="user-name" style="color: ${data.textColor}; font-size: 0.9rem;">${data.actorName}</span>
                        </div>
                    </div>
                    <div class="card-body" style="background: ${data.cardBg}; color: ${data.textColor}; padding: 1rem;">
                        <p>Card content for ${data.cardType}</p>
                    </div>
                </div>
            </div>
        `;
    }
}