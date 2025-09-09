import { API } from '../../api.js';
import { featureManager } from '../../features/feature-manager.js';
import { buildItemSelectionList, getWeaponDamageData, getAllWeaponDamageParts, isSmartWeapon, getSmartWeaponData } from '../../actors/item-util.js';
import { getAbilityModifier, getWeaponAbility, getProficiencyBonus } from '../../actors/actor-util.js';

/**
 * Generic Roll Dialog Renderer
 * Handles template rendering and dynamic section assembly
 */
export class GenericRollRenderer {
    /**
     * Create a new GenericRollRenderer instance
     */
    constructor() {
        this.sectionTemplates = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        try {
            await this.loadSectionTemplates();
            this.initialized = true;
        } catch (error) {
            API.log('error', 'Failed to initialize renderer', error);
        }
    }

    /**
     * Load all section templates
     */
    async loadSectionTemplates() {
        try {
            const sections = [
                'item-selection',
                'modifiers-table',
                'add-modifier-inputs',
                'features',
                'advantage-radio',
                'roll-mode-dropdown',
                'roll-button'
            ];

            for (const section of sections) {
                const template = await this.loadTemplate(section);
               // // API.log('debug', `Loaded template for ${section}:`, template);
                this.sectionTemplates.set(section, template);
            }
        } catch (error) {
            API.log('error', 'Failed to load section templates', error);
        }
    }

    /**
     * Load a template by name
     */
    async loadTemplate(templateName) {
        try {
            // Special handling for features section
            if (templateName === 'features') {
                return null; // Features are rendered dynamically
            }
            
            // Return the template path, not the rendered HTML
            // Note: templates are in the dialogs subdirectory
            return `modules/sw5e-qol/templates/dialogs/${templateName}.hbs`;
        } catch (error) {
            API.log('error', `Failed to load template: ${templateName}`, error);
            return '';
        }
    }

    /**
     * Render the base dialog with sections
     */
    async renderDialog(dialogData) {
        try {
            // Wait for initialization to complete
            if (!this.initialized) {
                await this.init();
            }
            
            // Check if FoundryVTT templates are available
            if (typeof renderTemplate === 'undefined') {
                throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
            }
            
            // Render base dialog
            const baseTemplate = await this.loadTemplate('generic-roll-base');
           // // API.log('debug', 'Base template path:', baseTemplate);
            const baseHtml = await renderTemplate(baseTemplate, dialogData);
            
            // Create temporary container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = baseHtml;
            
            // Get dialog body for section insertion
            const dialogBody = tempDiv.querySelector('#dialog-body');
            if (!dialogBody) {
                throw new Error('Dialog body not found in template');
            }

            // Insert sections based on dialog type
            await this.insertSections(dialogBody, dialogData);

            return tempDiv.innerHTML;

        } catch (error) {
            API.log('error', 'Failed to render dialog', error);
            throw error;
        }
    }

    /**
     * Insert sections into dialog body based on dialog type
     */
    async insertSections(dialogBody, dialogData) {
        try {
            const sections = this.getSectionOrder(dialogData.type);
            
            for (const sectionName of sections) {
                // Special handling for features section
                if (sectionName === 'features') {
                    const featuresHtml = await this.renderFeaturesSection(dialogData);
                    if (featuresHtml) {
                        if (dialogBody.children.length > 0) {
                            dialogBody.appendChild(this.createDivider());
                        }
                        dialogBody.insertAdjacentHTML('beforeend', featuresHtml);
                    }
                    continue;
                }

                const template = this.sectionTemplates.get(sectionName);
                if (!template) {
                    API.log('warning', `Section template not found: ${sectionName}`);
                    continue;
                }

                // Prepare section data
               // // API.log('debug', `Preparing section data for ${sectionName}`, dialogData);
                const sectionData = await this.prepareSectionData(sectionName, dialogData);
                
                // Check if FoundryVTT templates are available
                if (typeof renderTemplate === 'undefined') {
                    throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
                }
                
                // Render section
               // // API.log('debug', `Rendering section ${sectionName} with data:`, sectionData);
               // // API.log('debug', `Template path: ${template}`);
                const sectionHtml = await renderTemplate(template, sectionData);
                
                // Insert section with divider
                if (dialogBody.children.length > 0) {
                    dialogBody.appendChild(this.createDivider());
                }
                dialogBody.insertAdjacentHTML('beforeend', sectionHtml);
            }

        } catch (error) {
            API.log('error', 'Failed to insert sections', error);
            throw error;
        }
    }

    /**
     * Get section order based on dialog type
     */
    getSectionOrder(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return [
                    'item-selection',
                    //'save-attack',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'skill':
                return [
                    //'skill-check',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'save':
                return [
                    //'save-type',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'damage':
                return [
                    'item-selection',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            default:
                throw new Error(`Invalid dialog type: ${dialogType}`);
        }
    }

    /**
     * Prepare section-specific data
     */
    async prepareSectionData(sectionName, dialogData) {
        const baseData = {
            modifiers: dialogData.modifiers || [],
            modifierTypes: this.getModifierTypes(dialogData.type)
        };
        const { actor, itemID } = dialogData;
        
        // Calculate selection data once for reuse across sections
        const itemType = this.getItemTypeForDialog(dialogData.type);
        const selectionData = actor ? buildItemSelectionList(actor, itemType, { itemID }) : null;
        const effectiveItemID = itemID || selectionData?.defaultSelection || '';
        
        switch (sectionName) {
            case 'item-selection':
                return {
                    itemLabelKey: this.getItemLabelKey(dialogData.type),
                    items: this.getItemsForType(dialogData.type, dialogData),
                    presets: this.getPresetsForType(dialogData.type),
                    selectionData: selectionData,
                    isLocked: selectionData?.isLocked || false,
                    defaultSelection: selectionData?.defaultSelection || ''
                };
        case 'modifiers-table':
            // Add weapon-related data for the template
            // Use the effective item ID (either provided or default selection)
           // // API.log('debug', `Using effective itemID: ${effectiveItemID} (original: ${itemID}, default: ${selectionData?.defaultSelection})`);
           // // API.log('debug', `Preparing weapon data with itemID: ${effectiveItemID}`);
            const weaponData = await this.prepareWeaponData({ ...dialogData, itemID: effectiveItemID });
           // // API.log('debug', 'Weapon data prepared:', weaponData);
            const finalData = {
                ...baseData,
                ...weaponData
            };
           // // API.log('debug', 'Final modifiers-table data:', finalData);
            return finalData;
            case 'add-modifier-inputs':
                return baseData;
            case 'advantage-radio':
                return {};
            case 'roll-mode-dropdown':
                return {};
            case 'roll-button':
                return {};
            default:
                return baseData;
        }
    }

    /**
     * Get item type for dialog type
     */
    getItemTypeForDialog(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
            case 'damage':
                return 'weapon';
            case 'skill':
            case 'save':
                return 'weapon'; // These might use different types in the future
            default:
                return 'weapon';
        }
    }

    /**
     * Get modifier types based on dialog type
     */
    getModifierTypes(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
            case 'skill':
            case 'save':
                return ['Item', 'Force', 'Tech', 'Untyped'];
            case 'damage':
                return ['kinetic','energy','ion','acid','cold','fire','force','lightning','necrotic','poison','psychic','sonic','true'];
            default:
                return ['Untyped'];
        }
    }

    /**
     * Get item label key based on dialog type
     */
    getItemLabelKey(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return 'SW5E-QOL.interface.weapon';
            case 'skill':
                return 'SW5E-QOL.interface.skill';
            case 'save':
                return 'SW5E-QOL.interface.save';
            case 'damage':
                return 'SW5E-QOL.interface.weapon';
            default:
                return 'SW5E-QOL.interface.item';
        }
    }

    /**
     * Get items for dialog type using item selection functions
     */
    getItemsForType(dialogType, dialogData = {}) {
        try {
            const { actor, itemID } = dialogData;
            
            if (!actor) {
                API.log('warning', 'No actor provided for item selection');
                return [];
            }

            // Determine item type based on dialog type
            let itemType = 'weapon'; // Default to weapon
            switch (dialogType.toLowerCase()) {
                case 'attack':
                case 'damage':
                    itemType = 'weapon';
                    break;
                case 'skill':
                case 'save':
                    // These might use different item types in the future
                    itemType = 'weapon';
                    break;
                default:
                    itemType = 'weapon';
            }

            // Build item selection list
            const selectionData = buildItemSelectionList(actor, itemType, { itemID });
            
            if (!selectionData || !selectionData.options) {
                API.log('warning', 'No item selection data returned');
                return [];
            }

            // Convert to format expected by template
            const items = selectionData.options
                .filter(option => option.value !== '') // Exclude the "--None--" option
                .map(option => ({
                    id: option.value,
                    name: option.text,
                    selected: option.selected
                }));

           // // API.log('debug', `Retrieved ${items.length} items for ${dialogType} dialog`);
            return items;

        } catch (error) {
            API.log('error', 'Failed to get items for dialog type', error);
            return [];
        }
    }

    /**
     * Get presets for dialog type (placeholder - will be implemented later)
     */
    getPresetsForType(dialogType) {
        // Placeholder - will be populated from saved presets
        return [];
    }

    /**
     * Render the features section with collapsible functionality
     */
    async renderFeaturesSection(dialogData) {
        try {
            const { actor, type: dialogType, themeName, featureState, theme } = dialogData;
            
            // Get available features for this actor and dialog type
            const availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
            
            if (!availableFeatures || availableFeatures.length === 0) {
                return ''; // No features to display
            }

            // Get theme name from dialog data or default to 'bendu'
            const appliedTheme = theme || themeName || 'bendu';
            
            let featuresHTML = `
                <div class="features-section" style="
                    margin: 8px 0;
                    border: 1px solid var(--${appliedTheme}-border-dark, #666666);
                    border-radius: 4px;
                    background: var(--${appliedTheme}-bg-secondary, #3a3a3a);
                ">
                    <div class="section-header" style="
                        display: flex;
                        align-items: center;
                        padding: 8px 12px;
                        background: var(--${appliedTheme}-bg-tertiary, #2a2a2a);
                        border: 1px solid var(--${appliedTheme}-border-light, #888888);
                        cursor: pointer;
                    " data-section="features">
                        <button type="button" class="section-toggle" style="
                            background: none;
                            border: none;
                            color: var(--${appliedTheme}-accent, #999999);
                            cursor: pointer;
                            padding: 4px;
                            font-size: 12px;
                            transition: transform 0.2s ease;
                            width: 5%;
                            display: flex;
                            justify-content: flex-start;
                        " data-target="features-content">
                            ▼
                        </button>
                        <h3 style="
                            margin: 0; 
                            color: var(--${appliedTheme}-accent, #999999); 
                            border-bottom: 1px solid var(--${appliedTheme}-border-light, #888888);
                            font-size: 1.1em;
                            font-weight: 600;
                            width: 90%;
                            text-align: center;
                        ">
                            Features
                        </h3>
                        <div style="width: 5%;"></div>
                    </div>
                    <div class="features-content" style="
                        display: block;
                        padding: 8px;
                    " data-section="features-content">
            `;

            // Loop through available features
            for (const feature of availableFeatures) {
                try {
                    // Get feature state from previous dialog or default
                    const featureData = featureState?.[feature.id] || {};
                    featureData.actor = actor; // Pass actor for level calculations

                    // Validate feature
                    const validation = feature.validationLogic({
                        actor: actor,
                        dialogType: dialogType,
                        featureData: featureData
                    });
                    
                    if (validation === true) {
                        // Render feature HTML (handle async)
                        const featureHTML = await feature.htmlTemplate({
                            actor: actor,
                            dialogType: dialogType,
                            themeName: appliedTheme,
                            featureData: featureData
                        });
                        featuresHTML += featureHTML;
                    } else {
                        // Feature validation failed, log and skip
                        API.log('warning', `Feature ${feature.name} validation failed: ${validation}`);
                    }
                } catch (error) {
                    API.log('error', `Error rendering feature ${feature.name}:`, error);
                }
            }

            featuresHTML += `
                    </div>
                </div>
            `;

            return featuresHTML;

        } catch (error) {
            API.log('error', 'Failed to render features section', error);
            return '';
        }
    }

    /**
     * Create a horizontal divider
     */
    createDivider() {
        const divider = document.createElement('hr');
        divider.className = 'section-divider';
        return divider;
    }

    /**
     * Prepare weapon data for the modifiers table template
     */
    async prepareWeaponData(dialogData) {
        try {
            const { actor, itemID, type: dialogType } = dialogData;
           // // API.log('debug', `prepareWeaponData called with itemID: ${itemID}, dialogType: ${dialogType}`);
            
            // Determine which rows to show based on dialog type
            const isDamageDialog = dialogType?.toLowerCase() === 'damage';
            const showProficiencyRow = dialogType?.toLowerCase() === 'attack' || dialogType?.toLowerCase() === 'save';
            // API.log('debug', `prepareWeaponData called with Actor:`, actor);
            if (!actor) {
                return {
                    isDamageDialog,
                    showProficiencyRow,
                    weaponDamageType: 'None',
                    weaponDamageModifier: '0',
                    additionalDamageParts: [],
                    proficiencyDescription: '',
                    proficiencyModifier: '+0',
                    isSmartWeapon: false,
                    smartWeaponDex: 0,
                    smartWeaponDexModifier: 0,
                    smartWeaponProficiency: 0,
                    attributeModifier: '',
                    selectedAttribute: 'none',
                    attributeDisabled: false
                };
            }

            const item = itemID ? actor.items.get(itemID) : null;
           // // API.log('debug', `Item found: ${item ? item.name : 'null'}`);
            const isSmart = item && item.type === 'weapon' && isSmartWeapon(actor, itemID);
            const weaponDamageData = getWeaponDamageData(actor, itemID);
            const additionalDamageParts = isDamageDialog ? getAllWeaponDamageParts(actor, itemID).filter(part => !part.isBaseDamage) : [];
           // // API.log('debug', 'Weapon damage data:', weaponDamageData);
           // // API.log('debug', 'Additional damage parts:', additionalDamageParts);
            const proficiencyBonus = await getProficiencyBonus(actor);
            const smartWeaponData = isSmart ? await getSmartWeaponData(actor, itemID) : null;
            
            // Determine weapon ability and set attribute
            const weaponAbility = await getWeaponAbility(actor, itemID);
            const abilityModifier = await getAbilityModifier(actor, weaponAbility);
            const attributeDisabled = weaponAbility === 'none';
           // // API.log('debug', `Weapon ability: ${weaponAbility}, ability modifier: ${abilityModifier}, disabled: ${attributeDisabled}`);

            return {
                isDamageDialog,
                showProficiencyRow,
                weaponDamageType: weaponDamageData.type,
                weaponDamageModifier: weaponDamageData.modifier,
                additionalDamageParts: additionalDamageParts,
                proficiencyDescription: isSmart ? 'Smart Weapon' : '',
                proficiencyModifier: isSmart ? '' : `${proficiencyBonus}`,
                isSmartWeapon: isSmart,
                smartWeaponDex: smartWeaponData?.dex || 0,
                smartWeaponDexModifier: smartWeaponData?.dexModifier || 0,
                smartWeaponProficiency: smartWeaponData?.proficiency || proficiencyBonus,
                abilityModifier,
                selectedAttribute: weaponAbility,
                attributeDisabled
            };
        } catch (error) {
            API.log('error', 'Failed to prepare weapon data', error);
            return {
                isDamageDialog: false,
                showProficiencyRow: true,
                weaponDamageType: 'None',
                weaponDamageModifier: '0',
                additionalDamageParts: [],
                proficiencyDescription: '',
                proficiencyModifier: '+0',
                isSmartWeapon: false,
                smartWeaponDex: 0,
                smartWeaponDexModifier: 0,
                smartWeaponProficiency: 0,
                abilityModifier: '',
                selectedAttribute: 'none',
                attributeDisabled: false
            };
        }
    }






}
