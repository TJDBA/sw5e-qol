// scripts/workflow/actions/attack-action.js
// SW5E QoL - Attack Action Workflow
// Handles attack roll workflows with pack feature integration

export class AttackAction {
  constructor(context = {}) {
    this.type = 'attack';
    this.context = context;
    this.status = 'initialized';
  }

  /**
   * Start the attack workflow
   * @param {Object} data - Initial data for the attack
   * @returns {Object} Attack workflow result
   */
  start(data = {}) {
    try {
      this.status = 'started';
      this.data = { ...this.context, ...data };
      
      console.log('SW5E QoL | Attack workflow started:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error starting attack workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Continue the attack workflow
   * @param {Object} data - Data for the next step
   * @returns {Object} Updated workflow result
   */
  continue(data = {}) {
    try {
      this.data = { ...this.data, ...data };
      this.status = 'continued';
      
      console.log('SW5E QoL | Attack workflow continued:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error continuing attack workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Complete the attack workflow
   * @returns {Object} Completion result
   */
  complete() {
    try {
      this.status = 'completed';
      
      console.log('SW5E QoL | Attack workflow completed:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error completing attack workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Cancel the attack workflow
   * @returns {Object} Cancellation result
   */
  cancel() {
    try {
      this.status = 'cancelled';
      
      console.log('SW5E QoL | Attack workflow cancelled');
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status
      };
    } catch (error) {
      console.error('SW5E QoL | Error cancelling attack workflow:', error);
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
      name: 'Attack Action',
      description: 'Handles attack roll workflows',
      phases: ['start', 'rolling', 'resolving', 'complete'],
      requiredData: ['actor', 'weapon', 'targets'],
      optionalData: ['modifiers', 'advantage', 'disadvantage']
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
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
