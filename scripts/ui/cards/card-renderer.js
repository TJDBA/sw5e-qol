import { API } from '../../api.js';

/**
 * Card Renderer
 * Handles template rendering and dynamic component assembly for chat cards
 */
export class CardRenderer {
    /**
     * Create a new CardRenderer instance
     */
    constructor() {
        this.componentTemplates = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        try {
            await this.loadComponentTemplates();
            this.initialized = true;
            API.log('debug', 'Card renderer initialized');
        } catch (error) {
            API.log('error', 'Failed to initialize card renderer', error);
            throw error;
        }
    }

    /**
     * Load all component templates
     */
    async loadComponentTemplates() {
        const componentNames = [
            'roll-visualization',
            'damage-results',
            'attack-results',
            'save-results',
            'action-buttons',
            'target-info'
        ];

        for (const name of componentNames) {
            try {
                const template = `modules/sw5e-qol/templates/cards/components/${name}.hbs`;
                this.componentTemplates.set(name, template);
                API.log('debug', `Loaded component template: ${name}`);
            } catch (error) {
                API.log('warning', `Failed to load component template: ${name}`, error);
            }
        }
    }

    /**
     * Render a card with components
     */
    async renderCard(cardData) {
        try {
            // Wait for initialization to complete
            if (!this.initialized) {
                await this.init();
            }
            
            // Check if FoundryVTT templates are available
            if (typeof renderTemplate === 'undefined') {
                throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
            }
            
            // Prepare card data
            const preparedData = this.prepareCardData(cardData);
            
            // Render base card with full module path
            const baseTemplate = 'modules/sw5e-qol/templates/cards/base-card.hbs';
            const baseHtml = await renderTemplate(baseTemplate, preparedData);
            
            // Create temporary container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = baseHtml;
            
            // Get card body for component insertion
            const cardBody = tempDiv.querySelector('#card-body');
            const cardFooter = tempDiv.querySelector('#card-footer');
            
            if (!cardBody) {
                throw new Error('Card body not found in template');
            }

            // Insert components based on card type
            await this.insertComponents(cardBody, cardFooter, cardData);

            return tempDiv.innerHTML;

        } catch (error) {
            API.log('error', 'Failed to render card', error);
            throw error;
        }
    }

    /**
     * Prepare card data with user information
     */
    prepareCardData(cardData) {
        const user = game.users.get(cardData.userId || game.user.id);
        const userColor = user?.color || '#000000';
        const userName = user?.name || 'Unknown User';
        const userAvatar = user?.avatar || 'icons/svg/mystery-man.svg';
        
        return {
            ...cardData,
            userColor,
            userName,
            userAvatar,
            timestamp: new Date().toLocaleTimeString()
        };
    }

    /**
     * Insert components into card body and footer
     */
    async insertComponents(cardBody, cardFooter, cardData) {
        try {
            const components = this.getComponentOrder(cardData.cardType);
            
            for (const componentName of components) {
                const template = this.componentTemplates.get(componentName);
                if (!template) {
                    API.log('warning', `Component template not found: ${componentName}`);
                    continue;
                }

                // Prepare component data
                const componentData = this.prepareComponentData(componentName, cardData);
                
                // Check if FoundryVTT templates are available
                if (typeof renderTemplate === 'undefined') {
                    throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
                }
                
                // Render component
                const componentHtml = await renderTemplate(template, componentData);
                
                // Determine if component goes in body or footer
                const targetContainer = this.getComponentContainer(componentName, cardBody, cardFooter);
                
                // Insert component with divider if needed
                if (targetContainer.children.length > 0) {
                    targetContainer.appendChild(this.createDivider());
                }
                targetContainer.insertAdjacentHTML('beforeend', componentHtml);
            }

        } catch (error) {
            API.log('error', 'Failed to insert components', error);
            throw error;
        }
    }

    /**
     * Get component order based on card type
     */
    getComponentOrder(cardType) {
        switch (cardType) {
            case 'damage':
                return ['roll-visualization', 'damage-results', 'action-buttons', 'target-info'];
            case 'attack':
                return ['roll-visualization', 'attack-results', 'action-buttons'];
            case 'save':
                return ['roll-visualization', 'save-results', 'action-buttons'];
            case 'ability':
            case 'skill':
                return ['roll-visualization', 'attack-results', 'action-buttons'];
            default:
                return ['roll-visualization', 'action-buttons'];
        }
    }

    /**
     * Determine which container a component should go in
     */
    getComponentContainer(componentName, cardBody, cardFooter) {
        const footerComponents = ['action-buttons', 'target-info'];
        return footerComponents.includes(componentName) ? cardFooter : cardBody;
    }

    /**
     * Prepare component-specific data
     */
    prepareComponentData(componentName, cardData) {
        switch (componentName) {
            case 'roll-visualization':
                // Render the roll HTML here instead of in the template
                let rollHtml = '';
                if (cardData.roll) {
                    try {
                        rollHtml = cardData.roll.render();
                    } catch (error) {
                        API.log('warning', 'Failed to render roll', error);
                        rollHtml = `<div class="roll-placeholder">Roll: ${cardData.roll.total}</div>`;
                    }
                }
                
                return {
                    rollHtml: rollHtml,
                    collapsed: true,
                    messageId: cardData.messageId
                };
            case 'damage-results':
                return {
                    results: cardData.results,
                    targets: cardData.targets
                };
            case 'attack-results':
                return {
                    results: cardData.results,
                    target: cardData.target
                };
            case 'save-results':
                return {
                    results: cardData.results,
                    saveType: cardData.saveType
                };
            case 'action-buttons':
                return {
                    actions: cardData.actions || [],
                    messageId: cardData.messageId
                };
            case 'target-info':
                return {
                    targets: cardData.targets || []
                };
            default:
                return cardData;
        }
    }

    /**
     * Create a divider element
     */
    createDivider() {
        const divider = document.createElement('div');
        divider.className = 'component-divider';
        return divider;
    }

    /**
     * Update an existing card with new data
     */
    async updateCard(messageId, updateData) {
        try {
            const message = game.messages.get(messageId);
            if (!message) {
                throw new Error(`Message not found: ${messageId}`);
            }

            // Get existing card data from message flags
            const existingData = message.getFlag('sw5e-qol', 'cardData') || {};
            const updatedData = { ...existingData, ...updateData };

            // Re-render the card
            const newHtml = await this.renderCard(updatedData);

            // Update the message content
            await message.update({ content: newHtml });

            // Update the flags with new data
            await message.setFlag('sw5e-qol', 'cardData', updatedData);

            API.log('debug', `Updated card: ${messageId}`);

        } catch (error) {
            API.log('error', 'Failed to update card', error);
            throw error;
        }
    }
}
