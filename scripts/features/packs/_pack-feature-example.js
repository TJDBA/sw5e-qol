import { BaseFeature } from '../base-feature.js';

/**
 * Example Feature Pack - Force Empowered Strike
 * A simple example of a feature that provides bonuses
 */
export default class ForceEmpoweredStrikeFeature extends BaseFeature {
    constructor() {
        super({
            id: "force-empowered-strike",
            name: "Force Empowered Strike", 
            description: "Channel the Force to enhance your attacks",
            affects: ["attack", "damage"],
            section: "features",
            isReactive: false,
            isActive: true,
            injectionType: {
                "attack": "simple",
                "damage": "html"
            }
        });
    }

    /**
     * Custom HTML template for damage dialog
     */
    htmlTemplate(obj) {
        const { actor, dialogType, themeName, featureData } = obj;
        
        try {
            if (dialogType === "damage") {
                return this.renderDamageHTML(themeName, featureData);
            } else {
                // Use default for attack dialog
                return this.renderDefaultHTML(themeName, featureData);
            }
        } catch (error) {
            return this.renderErrorHTML(themeName, error);
        }
    }

    /**
     * Custom validation - check if actor has Force points
     */
    validationLogic(obj) {
        const { actor, dialogType, featureData } = obj;
        
        try {
            // Check if actor has Force points available
            const forcePoints = actor.system.resources?.primary?.value || 0;
            if (forcePoints <= 0) {
                return "No Force points available";
            }
            
            return true;
        } catch (error) {
            return `Validation error: ${error.message}`;
        }
    }

    /**
     * Custom roll modifiers
     */
    rollModifiers(obj) {
        const { actor, dialogType, dialogState, featureData } = obj;
        
        try {
            // Only return modifiers if feature is enabled
            if (!featureData?.enabled) {
                return [];
            }

            if (dialogType === "attack") {
                return this.getAttackModifiers(actor, dialogState, featureData);
            } else if (dialogType === "damage") {
                return this.getDamageModifiers(actor, dialogState, featureData);
            }
            
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Custom state collection for damage dialog
     */
    collectState(dialogElement) {
        try {
            const checkbox = dialogElement.querySelector(`input[name="feature-${this.id}"]`);
            const diceCountSelect = dialogElement.querySelector(`select[name="feature-${this.id}-dice"]`);
            
            return {
                enabled: checkbox ? checkbox.checked : false,
                diceCount: diceCountSelect ? parseInt(diceCountSelect.value) : 1
            };
        } catch (error) {
            return { enabled: false, diceCount: 1 };
        }
    }

    // ===== CUSTOM RENDER METHODS =====

    renderDamageHTML(themeName, featureData = {}) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        const diceCount = featureData.diceCount || 1;
        
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
                    <span>${this.name}</span>
                </label>
                <div class="feature-description" style="font-size: 0.9em; color: ${theme.muted}; margin-top: 4px;">
                    ${this.description} - Add Force dice to damage
                </div>
                <div class="feature-options" style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                    <label style="font-size: 0.9em;">Force Dice:</label>
                    <select name="feature-${this.id}-dice" style="
                        background: ${theme.bg};
                        color: ${theme.text};
                        border: 1px solid ${theme.border};
                        padding: 2px 4px;
                        border-radius: 2px;
                    ">
                        <option value="1" ${diceCount === 1 ? 'selected' : ''}>1d6</option>
                        <option value="2" ${diceCount === 2 ? 'selected' : ''}>2d6</option>
                        <option value="3" ${diceCount === 3 ? 'selected' : ''}>3d6</option>
                    </select>
                </div>
            </div>
        `;
    }

    // ===== CUSTOM MODIFIER METHODS =====

    getAttackModifiers(actor, dialogState, featureData) {
        return [
            this.createModifier(
                `${this.name} (Attack)`,
                'Force',
                '+2',
                true,
                false
            )
        ];
    }

    getDamageModifiers(actor, dialogState, featureData) {
        const diceCount = featureData.diceCount || 1;
        return [
            this.createModifier(
                `${this.name} (Damage)`,
                'Force',
                `${diceCount}d6`,
                true,
                true
            )
        ];
    }
}
