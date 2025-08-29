// scripts/workflow/actions/save-action.js
// SW5E QoL - Save Action Workflow
// Handles saving throw workflows with pack feature integration

export class SaveAction {
  constructor(context = {}) {
    this.type = 'save';
    this.context = context;
    this.status = 'initialized';
  }

  /**
   * Start the save workflow
   * @param {Object} data - Initial data for the save
   * @returns {Object} Save workflow result
   */
  start(data = {}) {
    try {
      this.status = 'started';
      this.data = { ...this.context, ...data };
      
      console.log('SW5E QoL | Save workflow started:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error starting save workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Continue the save workflow
   * @param {Object} data - Data for the next step
   * @returns {Object} Updated workflow result
   */
  continue(data = {}) {
    try {
      this.data = { ...this.data, ...data };
      this.status = 'continued';
      
      console.log('SW5E QoL | Save workflow continued:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error continuing save workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Complete the save workflow
   * @returns {Object} Completion result
   */
  complete() {
    try {
      this.status = 'completed';
      
      console.log('SW5E QoL | Save workflow completed:', this.data);
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status,
        data: this.data
      };
    } catch (error) {
      console.error('SW5E QoL | Error completing save workflow:', error);
      this.status = 'error';
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }

  /**
   * Cancel the save workflow
   * @returns {Object} Cancellation result
   */
  cancel() {
    try {
      this.status = 'cancelled';
      
      console.log('SW5E QoL | Save workflow cancelled');
      
      return {
        success: true,
        workflowId: this.id,
        status: this.status
      };
    } catch (error) {
      console.error('SW5E QoL | Error cancelling save workflow:', error);
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
      name: 'Save Action',
      description: 'Handles saving throw workflows',
      phases: ['start', 'rolling', 'resolving', 'complete'],
      requiredData: ['actor', 'targets', 'saveType', 'dc'],
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
    
    if (!data.targets || data.targets.length === 0) {
      errors.push('At least one target is required');
    }
    
    if (!data.saveType) {
      errors.push('Save type is required');
    }
    
    if (!data.dc) {
      errors.push('Difficulty Class (DC) is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
