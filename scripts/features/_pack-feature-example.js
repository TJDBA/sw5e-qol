// Basic Feature Pack Example - scripts/features/packs/_pack-feature-example.js
export default {
  // Basic metadata
  id: "template-feature",
  name: "Template Feature", 
  description: "A basic template for creating feature packs",
  
  // Feature configuration
  affects: ["attack", "damage", "saves"],  // Which dialog types show this feature
  section: "features",                     // UI grouping section
  isReactive: false,                       // Affects rolls against the owner
  isActive: true,                          // Affects rolls the owner makes
  
  // Injection type per dialog type
  injectionType: {
    "attack": "simple",     // Simple modifier addition
    "damage": "html",       // Full HTML component
    "save": "simple"        // Simple modifier addition
  },
  
  // HTML template function - returns HTML string for dialog injection
  htmlTemplate: (obj) => {
    const { actor, dialogType, themeName } = obj;
    
    try {
      // Example: Different HTML based on dialog type
      switch (dialogType) {
        case "attack":
          return this.renderAttackHTML(themeName);
        case "damage":
          return this.renderDamageHTML(themeName);
        case "save":
          return this.renderSaveHTML(themeName);
        default:
          return this.renderDefaultHTML(themeName);
      }
    } catch (error) {
      // Return error HTML for failed rendering
      return `
        <div class="feature-component feature-error" style="
          background: var(--dialog-bg, #ffffff);
          color: var(--dialog-text, #000000);
          border: 1px solid var(--${themeName}-warning, #cc9966);
          padding: 8px;
          margin: 4px 0;
          border-radius: 4px;
        ">
          <div style="color: var(--${themeName}-warning, #cc9966); font-weight: bold;">
            Component Failed to Render
          </div>
          <div style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888);">
            ${this.name} - Check console for details
          </div>
        </div>
      `;
    }
  },
  
  // Helper methods for different dialog types
  renderAttackHTML(themeName) {
    return `
      <div class="feature-component" style="
        background: var(--dialog-bg, #ffffff);
        color: var(--dialog-text, #000000);
        border: 1px solid var(--${themeName}-border-light, #888888);
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
      ">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="feature-${this.id}" value="1">
          <span>${this.name} (Attack)</span>
        </label>
        <div class="feature-description" style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888); margin-top: 4px;">
          ${this.description}
        </div>
      </div>
    `;
  },
  
  renderDamageHTML(themeName) {
    return `
      <div class="feature-component" style="
        background: var(--dialog-bg, #ffffff);
        color: var(--dialog-text, #000000);
        border: 1px solid var(--${themeName}-border-light, #888888);
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
      ">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="feature-${this.id}" value="1">
          <span>${this.name} (Damage)</span>
        </label>
        <div class="feature-description" style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888); margin-top: 4px;">
          ${this.description}
        </div>
      </div>
    `;
  },
  
  renderSaveHTML(themeName) {
    return `
      <div class="feature-component" style="
        background: var(--dialog-bg, #ffffff);
        color: var(--dialog-text, #000000);
        border: 1px solid var(--${themeName}-border-light, #888888);
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
      ">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="feature-${this.id}" value="1">
          <span>${this.name} (Save)</span>
        </label>
        <div class="feature-description" style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888); margin-top: 4px;">
          ${this.description}
        </div>
      </div>
    `;
  },
  
  renderDefaultHTML(themeName) {
    return `
      <div class="feature-component" style="
        background: var(--dialog-bg, #ffffff);
        color: var(--dialog-text, #000000);
        border: 1px solid var(--${themeName}-border-light, #888888);
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
      ">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="feature-${this.id}" value="1">
          <span>${this.name}</span>
        </label>
        <div class="feature-description" style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888); margin-top: 4px;">
          ${this.description}
        </div>
      </div>
    `;
  },
  
  // Validation function - checks if feature can be used
  validationLogic: (obj) => {
    const { actor, dialogType } = obj;
    
    try {
      // Different validation based on dialog type
      switch (dialogType) {
        case "attack":
          return this.validateAttack(actor);
        case "damage":
          return this.validateDamage(actor);
        case "save":
          return this.validateSave(actor);
        default:
          return this.validateDefault(actor);
      }
    } catch (error) {
      return `Validation error: ${error.message}`;
    }
  },
  
  // Validation helpers for different dialog types
  validateAttack(actor) {
    // Example: Check if actor can make attacks
    return true;
  },
  
  validateDamage(actor) {
    // Example: Check if actor has weapons equipped
    return true;
  },
  
  validateSave(actor) {
    // Example: Check if actor is conscious
    return true;
  },
  
  validateDefault(actor) {
    // Default validation
    return true;
  },
  
  // Roll modifiers function - returns array of modifiers to add
  rollModifiers: (obj) => {
    const { actor, dialogType, dialogState } = obj;
    
    try {
      // Different modifiers based on dialog type
      switch (dialogType) {
        case "attack":
          return this.getAttackModifiers(actor, dialogState);
        case "damage":
          return this.getDamageModifiers(actor, dialogState);
        case "save":
          return this.getSaveModifiers(actor, dialogState);
        default:
          return this.getDefaultModifiers(actor, dialogState);
      }
    } catch (error) {
      API.log('error', `Failed to get roll modifiers for ${this.name}:`, error);
      return [];
    }
  },
  
  // Modifier helpers for different dialog types
  getAttackModifiers(actor, dialogState) {
    return [
      {
        name: `${this.name} (Attack)`,
        type: 'Untyped',
        modifier: '+1',
        isEnabled: true,
        isDice: false
      }
    ];
  },
  
  getDamageModifiers(actor, dialogState) {
    return [
      {
        name: `${this.name} (Damage)`,
        type: 'Untyped',
        modifier: '1d6',
        isEnabled: true,
        isDice: true
      }
    ];
  },
  
  getSaveModifiers(actor, dialogState) {
    return [
      {
        name: `${this.name} (Save)`,
        type: 'Untyped',
        modifier: '+2',
        isEnabled: true,
        isDice: false
      }
    ];
  },
  
  getDefaultModifiers(actor, dialogState) {
    return [
      {
        name: this.name,
        type: 'Untyped',
        modifier: '+1',
        isEnabled: true,
        isDice: false
      }
    ];
  }
};
