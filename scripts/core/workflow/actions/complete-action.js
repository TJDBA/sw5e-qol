/**
 * Complete Action
 * Finalizes workflow and cleans up state
 * Location: scripts/core/workflow/actions/complete-action.js
 */

import { API } from '../../../api.js';
import { CardRenderer } from '../../../ui/cards/card-renderer.js';
import { getActorFromTokenID } from '../../../actors/actor-util.js';

const logThisFile = true;


/**
 * Complete Action Class
 * Handles workflow completion with force point processing and chat card generation
 */
export class CompleteAction {
    constructor() {
        if (logThisFile) API.log('debug', 'CompleteAction: Constructor called');
    }

    /**
     * Execute the complete action
     * @param {Object} state - Workflow state object
     * @returns {Object} Modified workflow state
     */
    async execute(state) {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Starting execution');
            
            // Step 1: Save the state object
            this.state = state;
            if (logThisFile) API.log('debug', 'CompleteAction: State saved', this.state);
            
            // Step 2: Check for force point usage and process it
            await this.processForcePointUsage();
            
            // Step 3: Call sub-method matching the action type for workflow step
            await this.handleWorkflowStep();
            
            // Step 4: Build chat card message
            await this.buildChatCardMessage();
            
            if (logThisFile) API.log('debug', 'CompleteAction: Execution completed');
            return this.state;
            
        } catch (error) {
            API.log('error', 'CompleteAction: Failed to execute:', error);
            throw error;
        }
    }

    /**
     * Process force point usage if applicable
     */
    async processForcePointUsage() {
        if (logThisFile) API.log('debug', 'CompleteAction: Processing force point usage');
        // TODO: Implement force point processing logic
    }

    /**
     * Handle workflow step based on action type
     */
    async handleWorkflowStep() {
        const workflowType = this.state.workflowType;
        if (logThisFile) API.log('debug', 'CompleteAction: Handling workflow step:', workflowType);
        
        switch (workflowType) {
            case 'attack':
                await this.handleAttackWorkflow();
                break;
            case 'damage':
                await this.handleDamageWorkflow();
                break;
            case 'save':
                await this.handleSaveWorkflow();
                break;
            case 'check':
                await this.handleCheckWorkflow();
                break;
            default:
                API.log('warning', 'CompleteAction: Unknown workflow type:', workflowType);
        }
    }

    /**
     * Build chat card message
     */
    async buildChatCardMessage() {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Building chat card message');
            
            // Generate unique message ID
            const messageId = foundry.utils.randomID();
            
            // Determine card type based on workflow
            const cardType = this.determineCardType();
            
            // Get actor information
            const actor = await getActorFromTokenID(this.state.dialogState?.ownerID);
            if (!actor) {
                throw new Error('Actor not found for chat card');
            }
            
            // Get actor name and image
            const actorName = actor.name || 'Unknown Actor';
            let actorImg = actor.img || actor.data?.img;
            
            // Fallback to first token image if actor image not available
            if (!actorImg && actor.getActiveTokens().length > 0) {
                const firstToken = actor.getActiveTokens()[0];
                actorImg = firstToken.document.texture.src || firstToken.document.img;
            }
            
            // Fallback to default image
            if (!actorImg) {
                actorImg = '/icons/svg/dice-target.svg';
            }
            
            // Get user information
            const ownerUser = game.users.get(actor.ownership.default) || game.user;
            const userColor = ownerUser.color || '#999999';
            const userName = ownerUser.name || 'Unknown User';
            const userAvatar = ownerUser.avatar || '/icons/svg/mystery-man.svg';
            
            if (logThisFile) API.log('debug', 'CompleteAction: Actor data:', {
                actorName: actorName,
                actorImg: actorImg
            });
            
            if (logThisFile) API.log('debug', 'CompleteAction: User data:', {
                ownerUser: ownerUser,
                userColor: userColor
            });
            
            // Create base card data
            const cardData = {
                messageId: messageId,
                cardType: cardType,
                userId: game.user.id, // Keep for message ownership
                actorId: this.state.dialogState?.ownerID, // Add actor ID
                title: this.generateCardTitle(actorName), // Pass actorName to generateCardTitle
                roll: this.getPrimaryRoll(),
                results: this.getWorkflowResults(),
                targets: this.getTargets(),
                actions: this.getAvailableActions(),
                // Actor-specific information
                actorName: actorName,
                actorImg: actorImg,
                userColor: userColor,
                // User information
                userName: userName,
                userAvatar: userAvatar,
                timestamp: new Date().toLocaleTimeString()
            };
            
            // Add workflow-specific data
            this.addWorkflowSpecificData(cardData);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Card data created', cardData);
            
            // Initialize card renderer
            this.cardRenderer = new CardRenderer();
            
            // Render the card using the CardRenderer
            const cardHtml = await this.cardRenderer.renderCard(cardData);
            
            // DEBUG: Check if CSS is loaded
            this.debugCSSLoading();
            
            // DEBUG: Inspect the rendered HTML
            this.debugRenderedHTML(cardHtml);
            
            // Create FoundryVTT chat message
            const message = await this.createChatMessage(cardHtml, cardData);
            
            // DEBUG: Check the created message
            this.debugCreatedMessage(message);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Final card HTML:', cardHtml);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Chat card message built');
        } catch (error) {
            API.log('error', 'CompleteAction: Error building chat card message:', error);
            throw error;
        }
    }

    /**
     * Debug CSS loading status
     */
    debugCSSLoading() {
        if (logThisFile) {
            API.log('debug', '=== CSS DEBUGGING ===');
            
            // Check if cards.css is loaded
            const cardsCSS = Array.from(document.styleSheets).find(sheet => 
                sheet.href && sheet.href.includes('cards.css')
            );
            
            if (cardsCSS) {
                API.log('debug', '✅ cards.css is loaded:', cardsCSS.href);
                
                // Try to access CSS rules
                try {
                    const rules = Array.from(cardsCSS.cssRules || []);
                    const cardRules = rules.filter(rule => 
                        rule.selectorText && rule.selectorText.includes('sw5e-qol-card')
                    );
                    API.log('debug', `Found ${cardRules.length} sw5e-qol-card rules:`, cardRules.map(r => r.selectorText));
                } catch (e) {
                    API.log('debug', '❌ Cannot access CSS rules (CORS):', e.message);
                }
            } else {
                API.log('debug', '❌ cards.css not found in loaded stylesheets');
            }
            
            // Check all loaded stylesheets
            const allSheets = Array.from(document.styleSheets).map(sheet => ({
                href: sheet.href,
                title: sheet.title,
                disabled: sheet.disabled
            }));
            API.log('debug', 'All loaded stylesheets:', allSheets);
        }
    }

    /**
     * Debug rendered HTML
     */
    debugRenderedHTML(cardHtml) {
        if (logThisFile) {
            API.log('debug', '=== HTML DEBUGGING ===');
            API.log('debug', 'Rendered card HTML length:', cardHtml.length);
            API.log('debug', 'Rendered card HTML preview:', cardHtml.substring(0, 500) + '...');
            
            // Check if HTML contains expected classes
            const hasCardClass = cardHtml.includes('sw5e-qol-card');
            const hasBorderClass = cardHtml.includes('card-border');
            const hasHeaderClass = cardHtml.includes('card-header');
            
            API.log('debug', 'HTML contains expected classes:', {
                'sw5e-qol-card': hasCardClass,
                'card-border': hasBorderClass,
                'card-header': hasHeaderClass
            });
            
            // Check for inline styles
            const hasInlineStyle = cardHtml.includes('style=');
            API.log('debug', 'HTML contains inline styles:', hasInlineStyle);
            
            if (hasInlineStyle) {
                const styleMatch = cardHtml.match(/style="[^"]*"/);
                API.log('debug', 'Inline style found:', styleMatch ? styleMatch[0] : 'none');
            }
        }
    }

    /**
     * Debug created message
     */
    debugCreatedMessage(message) {
        if (logThisFile) {
            API.log('debug', '=== MESSAGE DEBUGGING ===');
            API.log('debug', 'Created message ID:', message.id);
            API.log('debug', 'Message content length:', message.content.length);
            
            // Check if message is in DOM
            setTimeout(() => {
                const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
                if (messageElement) {
                    API.log('debug', '✅ Message found in DOM');
                    
                    // Check computed styles
                    const computedStyle = window.getComputedStyle(messageElement);
                    const bgColor = computedStyle.getPropertyValue('background-color');
                    const textColor = computedStyle.getPropertyValue('color');
                    const borderColor = computedStyle.getPropertyValue('border-left-color');
                    
                    API.log('debug', 'Computed styles:', {
                        backgroundColor: bgColor,
                        color: textColor,
                        borderLeftColor: borderColor
                    });
                    
                    // Check if CSS classes are applied
                    const hasCardClass = messageElement.classList.contains('sw5e-qol-card');
                    const hasBorderClass = messageElement.querySelector('.card-border');
                    
                    API.log('debug', 'CSS classes applied:', {
                        hasCardClass: hasCardClass,
                        hasBorderClass: !!hasBorderClass
                    });
                    
                } else {
                    API.log('debug', '❌ Message not found in DOM');
                }
            }, 100);
        }
    }

    /**
     * Determine card type based on workflow type
     * @returns {string} Card type
     */
    determineCardType() {
        const workflowType = this.state.workflowType;
        switch (workflowType) {
            case 'attack':
                return 'attack';
            case 'damage':
                return 'damage';
            case 'save':
                return 'save';
            case 'check':
                return 'check';
            default:
                return 'generic';
        }
    }

    /**
     * Generate card title
     * @param {string} actorName - The actor's name
     * @returns {string} Card title
     */
    generateCardTitle(actorName = 'Unknown Actor') {
        const workflowType = this.state.workflowType;
        
        switch (workflowType) {
            case 'attack':
                return `${actorName} - Attack Roll`;
            case 'damage':
                return `${actorName} - Damage Roll`;
            case 'save':
                return `${actorName} - Saving Throw`;
            case 'check':
                return `${actorName} - Ability Check`;
            default:
                return `${actorName} - ${workflowType}`;
        }
    }

    /**
     * Get primary roll data
     * @returns {Object} Primary roll data
     */
    getPrimaryRoll() {
        const workflowType = this.state.workflowType;
        
        switch (workflowType) {
            case 'attack':
                return this.state.attackResults?.rolls?.[0] || { total: 0, dice: [] };
            case 'damage':
                return this.state.damageResults?.normalRoll || { total: 0, dice: [] };
            default:
                return { total: 0, dice: [] };
        }
    }

    /**
     * Get workflow results
     * @returns {Object} Workflow results
     */
    getWorkflowResults() {
        return {
            attackResults: this.state.attackResults,
            damageResults: this.state.damageResults
        };
    }

    /**
     * Get targets
     * @returns {Array} Target IDs
     */
    getTargets() {
        return this.state.dialogState?.targets || [];
    }

    /**
     * Get available actions
     * @returns {Array} Available actions
     */
    getAvailableActions() {
        // TODO: Implement action buttons based on workflow type
        // For now, return empty array
        return [];
    }

    /**
     * Add workflow-specific data to card data
     * @param {Object} cardData - Card data object to modify
     */
    addWorkflowSpecificData(cardData) {
        const workflowType = this.state.workflowType;
        
        switch (workflowType) {
            case 'attack':
                // Add attack-specific data
                if (this.state.attackResults) {
                    cardData.attackResults = this.state.attackResults;
                }
                break;
            case 'damage':
                // Add damage-specific data
                if (this.state.damageResults) {
                    cardData.damageResults = this.state.damageResults;
                }
                break;
            case 'save':
                // Add save-specific data
                cardData.saveType = this.state.dialogState?.saveType || 'unknown';
                break;
        }
    }

    /**
     * Create FoundryVTT chat message
     * @param {string} cardHtml - Rendered card HTML
     * @param {Object} cardData - Card data object
     */
    async createChatMessage(cardHtml, cardData) {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Creating chat message');
            
            // Create the chat message
            const messageData = {
                content: cardHtml,
                speaker: {
                    actor: this.state.dialogState?.ownerID,
                    alias: game.actors.get(this.state.dialogState?.ownerID)?.name
                },
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                flags: {
                    'sw5e-qol': {
                        cardData: cardData,
                        workflowType: this.state.workflowType
                    }
                }
            };
            
            if (logThisFile) API.log('debug', 'CompleteAction: Message data:', messageData);
            
            // Create the message
            const message = await ChatMessage.create(messageData);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Chat message created with ID:', message.id);
            
            return message;
            
        } catch (error) {
            API.log('error', 'CompleteAction: Error creating chat message:', error);
            throw error;
        }
    }

    // Workflow-specific sub-methods (placeholders)

    /**
     * Handle attack workflow completion
     */
    async handleAttackWorkflow() {
        if (logThisFile) API.log('debug', 'CompleteAction: Handling attack workflow');
        // TODO: Implement attack-specific completion logic
    }

    /**
     * Handle save workflow completion
     */
    async handleSaveWorkflow() {
        if (logThisFile) API.log('debug', 'CompleteAction: Handling save workflow');
        // TODO: Implement save-specific completion logic
    }

    /**
     * Handle check workflow completion
     */
    async handleCheckWorkflow() {
        if (logThisFile) API.log('debug', 'CompleteAction: Handling check workflow');
        // TODO: Implement check-specific completion logic
    }

    /**
     * Handle damage workflow completion
     */
    async handleDamageWorkflow() {
        if (logThisFile) API.log('debug', 'CompleteAction: Handling damage workflow');
        // TODO: Implement damage-specific completion logic
    }
}