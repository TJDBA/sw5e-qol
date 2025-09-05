import { BaseFeature } from '../base-feature.js';

/**
 * Template Feature Pack
 * Example of how to create a feature pack extending BaseFeature
 */
export default class TemplateFeature extends BaseFeature {
    constructor() {
        super({
            id: "template-feature",
            name: "Template Feature", 
            description: "A basic template for creating feature packs",
            affects: ["attack", "damage", "saves"],
            section: "features",
            isReactive: false,
            isActive: true,
            injectionType: {
                "attack": "simple",
                "damage": "html", 
                "save": "simple"
            }
        });
    }

    /**
     * Override HTML template for custom rendering
     */
    htmlTemplate(obj) {
        const { actor, dialogType, themeName, featureData } = obj;
        
        try {
            // Different HTML based on dialog type
            switch (dialogType) {
                case "attack":
                    return this.renderAttackHTML(themeName, featureData);
                case "damage":
                    return this.renderDamageHTML(themeName, featureData);
                case "save":
                    return this.renderSaveHTML(themeName, featureData);
                default:
                    return this.renderDefaultHTML(themeName, featureData);
            }
        } catch (error) {
            return this.renderErrorHTML(themeName, error);
        }
    }

    /**
     * Override validation logic
     */
    validationLogic(obj) {
        const { actor, dialogType, featureData } = obj;
        
        try {
            // Different validation based on dialog type
            switch (dialogType) {
                case "attack":
                    return this.validateAttack(actor, featureData);
                case "damage":
                    return this.validateDamage(actor, featureData);
                case "save":
                    return this.validateSave(actor, featureData);
                default:
                    return this.validateDefault(actor, featureData);
            }
        } catch (error) {
            return `Validation error: ${error.message}`;
        }
    }

    /**
     * Override roll modifiers
     */
    rollModifiers(obj) {
        const { actor, dialogType, dialogState, featureData } = obj;
        
        try {
            // Only return modifiers if feature is enabled
            if (!featureData?.enabled) {
                return [];
            }

            // Different modifiers based on dialog type
            switch (dialogType) {
                case "attack":
                    return this.getAttackModifiers(actor, dialogState, featureData);
                case "damage":
                    return this.getDamageModifiers(actor, dialogState, featureData);
                case "save":
                    return this.getSaveModifiers(actor, dialogState, featureData);
                default:
                    return this.getDefaultModifiers(actor, dialogState, featureData);
            }
        } catch (error) {
            return [];
        }
    }

    // ===== CUSTOM RENDER METHODS =====

    renderAttackHTML(themeName, featureData = {}) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        
        return `
            <div class="feature-component" style="
                background: ${theme.bg};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" name="feature-${this.id}" value="1" ${checked}>
                    <span>${this.name} (Attack)</span>
                </label>
                <div class="feature-description" style="font-size: 0.9em; color: ${theme.muted}; margin-top: 4px;">
                    ${this.description} - Provides +1 to attack rolls
                </div>
            </div>
        `;
    }

    renderDamageHTML(themeName, featureData = {}) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        
        return `
            <div class="feature-component" style="
                background: ${theme.bg};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" name="feature-${this.id}" value="1" ${checked}>
                    <span>${this.name} (Damage)</span>
                </label>
                <div class="feature-description" style="font-size: 0.9em; color: ${theme.muted}; margin-top: 4px;">
                    ${this.description} - Adds 1d6 damage
                </div>
            </div>
        `;
    }

    renderSaveHTML(themeName, featureData = {}) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        
        return `
            <div class="feature-component" style="
                background: ${theme.bg};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" name="feature-${this.id}" value="1" ${checked}>
                    <span>${this.name} (Save)</span>
                </label>
                <div class="feature-description" style="font-size: 0.9em; color: ${theme.muted}; margin-top: 4px;">
                    ${this.description} - Provides +2 to saving throws
                </div>
            </div>
        `;
    }

    // ===== CUSTOM VALIDATION METHODS =====

    validateAttack(actor, featureData) {
        // Example: Check if actor can make attacks
        return true;
    }

    validateDamage(actor, featureData) {
        // Example: Check if actor has weapons equipped
        return true;
    }

    validateSave(actor, featureData) {
        // Example: Check if actor is conscious
        return true;
    }

    // ===== CUSTOM MODIFIER METHODS =====

    getAttackModifiers(actor, dialogState, featureData) {
        return [
            this.createModifier(
                `${this.name} (Attack)`,
                'Untyped',
                '+1',
                true,
                false
            )
        ];
    }

    getDamageModifiers(actor, dialogState, featureData) {
        return [
            this.createModifier(
                `${this.name} (Damage)`,
                'Untyped',
                '1d6',
                true,
                true
            )
        ];
    }

    getSaveModifiers(actor, dialogState, featureData) {
        return [
            this.createModifier(
                `${this.name} (Save)`,
                'Untyped',
                '+2',
                true,
                false
            )
        ];
    }
}
