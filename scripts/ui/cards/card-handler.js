import { API } from '../../api.js';
import { CardRenderer } from './card-renderer.js';

/**
 * Card Handler
 * Manages card creation, updates, and interactions
 */
export class CardHandler {
    constructor() {
        this.renderer = new CardRenderer();
        this.setupHooks();
    }

    /**
     * Setup Foundry hooks for card interactions
     */
    setupHooks() {
        // Listen for chat message renders to attach event listeners
        Hooks.on("renderChatMessage", (message, html, data) => {
            this.attachEventListeners(html, data);
        });
    }

    /**
     * Attach event listeners to a rendered card
     */
    attachEventListeners(html, data) {
        const card = html.find('.sw5e-qol-card');
        if (card.length === 0) return;

        // Use event delegation on the card root
        card.on('click', '[data-action]', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const button = event.currentTarget;
            const action = button.dataset.action;
            const messageId = button.dataset.messageId || data.message._id;
            
            this.handleCardInteraction(action, messageId, button, data);
        });
    }

    /**
     * Create a new card in chat
     */
    async createCard(cardData) {
        try {
            // Validate card data
            if (!this.validateCardData(cardData)) {
                throw new Error('Invalid card data provided');
            }

            // Render the card
            const cardHtml = await this.renderer.renderCard(cardData);

            // Create chat message
            const messageData = {
                content: cardHtml,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                speaker: {
                    alias: cardData.userName || game.user.name
                },
                flags: {
                    'sw5e-qol': {
                        cardData: cardData,
                        cardType: cardData.cardType
                    }
                }
            };

            // Create the message
            const message = await ChatMessage.create(messageData);
            
            // Update the card with the messageId and re-render
            const updatedCardData = { ...cardData, messageId: message.id };
            const updatedCardHtml = await this.renderer.renderCard(updatedCardData);
            
            // Update the message with the correct HTML that includes messageId
            await message.update({ content: updatedCardHtml });
            
            // Update the flags with the messageId
            await message.setFlag('sw5e-qol', 'cardData', updatedCardData);
            
            API.log('debug', `Created card: ${message.id}`);
            return message;

        } catch (error) {
            API.log('error', 'Failed to create card', error);
            throw error;
        }
    }

    /**
     * Update an existing card
     */
    async updateCard(messageId, updateData) {
        try {
            await this.renderer.updateCard(messageId, updateData);
            API.log('debug', `Updated card: ${messageId}`);
        } catch (error) {
            API.log('error', 'Failed to update card', error);
            throw error;
        }
    }

    /**
     * Validate card data
     */
    validateCardData(cardData) {
        if (!cardData) {
            API.log('error', 'Card data is required');
            return false;
        }

        if (!cardData.cardType) {
            API.log('error', 'Card type is required');
            return false;
        }

        const validTypes = ['damage', 'attack', 'save', 'ability', 'skill'];
        if (!validTypes.includes(cardData.cardType)) {
            API.log('error', `Invalid card type: ${cardData.cardType}`);
            return false;
        }

        if (!cardData.roll && !cardData.results) {
            API.log('error', 'Either roll or results data is required');
            return false;
        }

        return true;
    }

    /**
     * Handle card interactions (button clicks, etc.)
     */
    async handleCardInteraction(action, messageId, button, data) {
        try {
            API.log('debug', `Card interaction: ${action} for message ${messageId}`);

            if (!action || !messageId) {
                API.log('warning', 'Missing action or messageId in card interaction');
                return;
            }

            switch (action) {
                case 'roll-save':
                    await this.handleSaveRoll(messageId, button.dataset);
                    break;
                case 'expand-roll':
                    await this.toggleRollExpansion(messageId);
                    break;
                case 'reroll':
                    await this.handleReroll(messageId, button.dataset);
                    break;
                default:
                    API.log('warning', `Unknown card action: ${action}`);
            }

        } catch (error) {
            API.log('error', 'Failed to handle card interaction', error);
        }
    }

    /**
     * Handle save roll from damage card
     */
    async handleSaveRoll(messageId, buttonData) {
        try {
            API.log('info', `Save roll requested for message: ${messageId}`);
            API.log('info', `Save type: ${buttonData.saveType}, DC: ${buttonData.dc}`);
            
            // For now, just show a notification
            ui.notifications.info(`Save roll: ${buttonData.saveType.toUpperCase()} save vs DC ${buttonData.dc}`);
            
            // TODO: Implement actual save roll logic
        } catch (error) {
            API.log('error', 'Failed to handle save roll', error);
        }
    }

    /**
     * Toggle roll expansion
     */
    async toggleRollExpansion(messageId) {
        try {
            const message = game.messages.get(messageId);
            if (!message) return;

            const cardElement = message.element?.querySelector('.sw5e-qol-card');
            if (!cardElement) return;

            const rollElement = cardElement.querySelector('.roll-visualization');
            if (!rollElement) return;

            const isCollapsed = rollElement.classList.contains('collapsed');
            
            if (isCollapsed) {
                rollElement.classList.remove('collapsed');
                rollElement.classList.add('expanded');
                API.log('debug', `Expanded roll for message: ${messageId}`);
            } else {
                rollElement.classList.remove('expanded');
                rollElement.classList.add('collapsed');
                API.log('debug', `Collapsed roll for message: ${messageId}`);
            }

        } catch (error) {
            API.log('error', 'Failed to toggle roll expansion', error);
        }
    }

    /**
     * Handle reroll
     */
    async handleReroll(messageId, buttonData) {
        try {
            API.log('info', `Reroll requested for message: ${messageId}`);
            
            // For now, just show a notification
            ui.notifications.info('Reroll functionality not yet implemented');
            
            // TODO: Implement actual reroll logic
        } catch (error) {
            API.log('error', 'Failed to handle reroll', error);
        }
    }
}
