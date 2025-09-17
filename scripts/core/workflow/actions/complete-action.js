/**
 * Complete Action
 * Finalizes workflow and cleans up state
 * Location: scripts/core/workflow/actions/complete-action.js
 */

import { API } from '../../../api.js';
import { CardRenderer } from '../../../ui/cards/card-renderer.js';

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
     * Process force point usage
     * Checks if force points were used and handles the processing
     */
    async processForcePointUsage() {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Processing force point usage');
            
            // TODO: Implement force point usage checking and processing
            // - Check if force points were used in the workflow
            // - Deduct force points from actor
            // - Update state with force point usage information
            
            if (logThisFile) API.log('debug', 'CompleteAction: Force point usage processed');
        } catch (error) {
            API.log('error', 'CompleteAction: Error processing force point usage:', error);
            throw error;
        }
    }

    /**
     * Handle workflow step based on action type
     * Calls the appropriate sub-method for the specific workflow step
     */
    async handleWorkflowStep() {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Handling workflow step');
            
            const workflowType = this.state.workflowType;
            
            // Call sub-method based on workflow type
            switch (workflowType) {
                case 'attack':
                    await this.handleAttackWorkflow();
                    break;
                case 'save':
                    await this.handleSaveWorkflow();
                    break;
                case 'check':
                    await this.handleCheckWorkflow();
                    break;
                case 'damage':
                    await this.handleDamageWorkflow();
                    break;
                default:
                    if (logThisFile) API.log('warning', `CompleteAction: Unknown workflow type: ${workflowType}`);
                    break;
            }
            
            if (logThisFile) API.log('debug', 'CompleteAction: Workflow step handled');
        } catch (error) {
            API.log('error', 'CompleteAction: Error handling workflow step:', error);
            throw error;
        }
    }

    /**
     * Build chat card message
     * Creates the final chat card message for the workflow
     */
    async buildChatCardMessage() {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Building chat card message');
            
            // Initialize card renderer if not already done
            if (!this.cardRenderer) {
                this.cardRenderer = new CardRenderer();
            }
            
            // Generate unique message ID
            const messageId = foundry.utils.randomID();
            
            // Determine card type based on workflow type
            const cardType = this.determineCardType();
            
            // Create card data structure from workflow state
            const cardData = this.createCardData(messageId, cardType);
            
            // Render the card using the CardRenderer
            const cardHtml = await this.cardRenderer.renderCard(cardData);
            
            // Create FoundryVTT chat message
            await this.createChatMessage(cardHtml, cardData);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Chat card message built');
        } catch (error) {
            API.log('error', 'CompleteAction: Error building chat card message:', error);
            throw error;
        }
    }

    /**
     * Determine card type based on workflow type
     * @returns {string} Card type for rendering
     */
    determineCardType() {
        const workflowType = this.state.workflowType;
        
        // Map workflow types to card types
        switch (workflowType) {
            case 'attack':
                return 'attack';
            case 'damage':
                return 'damage';
            case 'save':
                return 'save';
            case 'check':
                return 'ability';
            default:
                return 'generic';
        }
    }

    /**
     * Create card data structure from workflow state
     * @param {string} messageId - Unique message ID
     * @param {string} cardType - Type of card to create
     * @returns {Object} Card data object
     */
    createCardData(messageId, cardType) {
        try {
            if (logThisFile) API.log('debug', 'CompleteAction: Creating card data');
            
            // Get actor information
            const actor = game.actors.get(this.state.dialogState?.ownerID);
            const actorName = actor?.name || 'Unknown Actor';
            const actorImg = actor?.img || 'icons/svg/mystery-man.svg';
            
            // Get the user who owns the actor for color information
            const ownerUser = game.users.get(actor?.data?.permission?.default || game.user.id);
            const userColor = ownerUser?.color || '#000000';
            
            // Create base card data
            const cardData = {
                messageId: messageId,
                cardType: cardType,
                userId: game.user.id, // Keep for message ownership
                actorId: this.state.dialogState?.ownerID, // Add actor ID
                title: this.generateCardTitle(),
                roll: this.getPrimaryRoll(),
                results: this.getWorkflowResults(),
                targets: this.getTargets(),
                actions: this.getAvailableActions(),
                // Actor-specific information
                actorName: actorName,
                actorImg: actorImg,
                userColor: userColor
            };
            
            // Add workflow-specific data
            this.addWorkflowSpecificData(cardData);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Card data created', cardData);
            return cardData;
            
        } catch (error) {
            API.log('error', 'CompleteAction: Error creating card data:', error);
            throw error;
        }
    }

    /**
     * Generate card title based on workflow type and context
     * @returns {string} Card title
     */
    generateCardTitle() {
        const workflowType = this.state.workflowType;
        const actor = game.actors.get(this.state.dialogState?.ownerID);
        const actorName = actor?.name || 'Unknown Actor';
        
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
                return `${actorName} - ${workflowType.charAt(0).toUpperCase() + workflowType.slice(1)}`;
        }
    }

    /**
     * Get the primary roll for the card
     * @returns {Roll|null} Primary roll object
     */
    getPrimaryRoll() {
        if (!this.state.rolls) {
            return null;
        }
        
        // Handle different roll structures based on workflow type
        if (Array.isArray(this.state.rolls)) {
            // Attack action uses array of rolls
            return this.state.rolls[0];
        } else if (this.state.rolls.normalRoll) {
            // Damage action uses object with normalRoll, baseRoll, critRoll
            return this.state.rolls.normalRoll;
        } else if (this.state.rolls.total !== undefined) {
            // Single roll object
            return this.state.rolls;
        }
        
        return null;
    }

    /**
     * Get workflow results for the card
     * @returns {Array} Array of results
     */
    getWorkflowResults() {
        const results = [];
        
        // Add attack results if available
        if (this.state.attackResults) {
            results.push(...this.state.attackResults);
        }
        
        // Add damage results if available
        if (this.state.damageResults) {
            results.push(...this.state.damageResults);
        }
        
        return results;
    }

    /**
     * Get targets for the card
     * @returns {Array} Array of targets
     */
    getTargets() {
        if (this.state.dialogState?.targetIDs) {
            return this.state.dialogState.targetIDs;
        }
        return [];
    }

    /**
     * Get available actions for the card
     * @returns {Array} Array of available actions
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
            
            // Create the message
            await ChatMessage.create(messageData);
            
            if (logThisFile) API.log('debug', 'CompleteAction: Chat message created');
            
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