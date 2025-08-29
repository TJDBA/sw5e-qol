// scripts/workflow/actions/damage-action.js
// SW5E QoL - Damage Action Workflow
// Handles damage roll workflows with pack feature integration

export class DamageAction {
  constructor(context = {}) {
    this.type = 'damage';
    this.context = context;
    this.status = 'initialized';
  }

  /**
   * Start the damage workflow
   * @param {Object} data - Initial data for the damage
   * @returns {Object} Damage workflow result
   */
  start(data = {}) {
    try {
      this.status = 'started';
      this.data = { ...this.context, ...data };
      
      console.log('SW5E QoL | Damage workflow started:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error starting damage workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Continue the damage workflow
   * @param {Object} data - Data for the next step
   * @returns {Object} Updated workflow result
   */
  continue(data = {}) {
    try {
      this.data = { ...this.data, ...data };
      this.status = 'continued';
      
      console.log('SW5E QoL | Damage workflow continued:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error continuing damage workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Complete the damage workflow
   * @returns {Object} Completion result
   */
  complete() {
    try {
      this.status = 'completed';
      
      console.log('SW5E QoL | Damage workflow completed:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error completing damage workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Cancel the damage workflow
   * @returns {Object} Cancellation result
   */
  cancel() {
    try {
      this.status = 'cancelled';
      
      console.log('SW5E QoL | Damage workflow cancelled');
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status
      };
    } catch (error) {
      console.error('SW5E QoL | Error cancelling damage workflow:', error);
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Get current workflow status
   * @returns {string} Current status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Get workflow configuration
   * @returns {Object} Configuration object
   */
  static getConfig() {
    return {
      name: 'Damage Action',
      description: 'Handles damage roll workflows',
      phases: ['start', 'rolling', 'resolving', 'complete'],
      requiredData: ['actor', 'weapon', 'targets', 'hitResults'],
      optionalData: ['modifiers', 'damageTypes', 'critical']
    };
  }

  /**
   * Validate workflow data
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  static validateData(data) {
    const errors = [];
    
    if (!data.actor) {
      errors.push('Actor is required');
    }
    
    if (!data.weapon) {
      errors.push('Weapon is required');
    }
    
    if (!data.targets || data.targets.length === 0) {
      errors.push('At least one target is required');
    }
    
    if (!data.hitResults || data.hitResults.length === 0) {
      errors.push('Hit results are required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
