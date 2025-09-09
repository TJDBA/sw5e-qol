/**
 * Workflow Configuration - Defines workflows, steps, and validation properties
 * This config file contains workflow definitions with step validation properties
 * for chained workflow data passing and null checks
 */

export const WORKFLOW_CONFIG = {
    // Attack workflow - basic attack roll
    "attack": {
        workflowSteps: ["start", "attack", "complete"],
        steps: {
            "start": {
                name: "Initialize Attack",
                description: "Set up attack parameters and context",
                validationProperties: [
                    "actorId",
                    "itemId"
                ]
            },
            "attack": {
                name: "Execute Attack Roll",
                description: "Perform the attack roll calculation and display result",
                validationProperties: [
                    "attackRoll"
                    //,
                    //"attackResult",
                    //"hitStatus"
                ]
            },
            "complete": {
                name: "Finalize Attack",
                description: "Complete attack workflow and clean up state",
                validationProperties: [
                    "finalResult",
                    "workflowComplete"
                ]
            }
        }
    },

    // Attack-Damage workflow - attack followed by damage
    "attack-damage": {
        workflowSteps: ["start", "attack", "damage", "complete"],
        steps: {
            "start": {
                name: "Initialize Attack-Damage",
                description: "Set up attack and damage parameters",
                validationProperties: [
                    "actorId",
                    "itemId",
                    "targetId",
                    "damageType"
                ]
            },
            "attack": {
                name: "Execute Attack Roll",
                description: "Perform attack roll and determine hit/miss",
                validationProperties: [
                    "attackRoll",
                    "attackResult",
                    "hitStatus"
                ]
            },
            "damage": {
                name: "Calculate Damage",
                description: "Calculate and apply damage if attack hit",
                validationProperties: [
                    "damageRoll",
                    "damageResult",
                    "damageApplied"
                ]
            },
            "complete": {
                name: "Finalize Attack-Damage",
                description: "Complete workflow and update target status",
                validationProperties: [
                    "finalResult",
                    "targetUpdated",
                    "workflowComplete"
                ]
            }
        }
    },

    // Attack-Save workflow - attack followed by saving throw
    "attack-save": {
        workflowSteps: ["start", "attack", "save", "complete"],
        steps: {
            "start": {
                name: "Initialize Attack-Save",
                description: "Set up attack and save parameters",
                validationProperties: [
                    "actorId",
                    "itemId",
                    "targetId",
                    "saveType"
                ]
            },
            "attack": {
                name: "Execute Attack Roll",
                description: "Perform attack roll against target",
                validationProperties: [
                    "attackRoll",
                    "attackResult",
                    "hitStatus"
                ]
            },
            "save": {
                name: "Target Saving Throw",
                description: "Target attempts saving throw against effect",
                validationProperties: [
                    "saveRoll",
                    "saveResult",
                    "saveSuccess"
                ]
            },
            "complete": {
                name: "Finalize Attack-Save",
                description: "Apply effects based on save result",
                validationProperties: [
                    "effectApplied",
                    "finalResult",
                    "workflowComplete"
                ]
            }
        }
    },

    // Damage-Save-ApplyDamage workflow - damage, save, then apply
    "damage-save-applyDamage": {
        workflowSteps: ["start", "damage", "save", "applyDamage", "complete"],
        steps: {
            "start": {
                name: "Initialize Damage-Save",
                description: "Set up damage and save parameters",
                validationProperties: [
                    "actorId",
                    "itemId",
                    "targetId",
                    "damageType",
                    "saveType"
                ]
            },
            "damage": {
                name: "Calculate Damage",
                description: "Calculate base damage amount",
                validationProperties: [
                    "damageRoll",
                    "damageResult",
                    "baseDamage"
                ]
            },
            "save": {
                name: "Target Saving Throw",
                description: "Target attempts save to reduce damage",
                validationProperties: [
                    "saveRoll",
                    "saveResult",
                    "saveSuccess"
                ]
            },
            "applyDamage": {
                name: "Apply Final Damage",
                description: "Apply damage based on save result",
                validationProperties: [
                    "finalDamage",
                    "damageApplied",
                    "damageReduced"
                ]
            },
            "complete": {
                name: "Finalize Damage Application",
                description: "Complete damage workflow and update target",
                validationProperties: [
                    "targetUpdated",
                    "finalResult",
                    "workflowComplete"
                ]
            }
        }
    }
};

/**
 * Get workflow configuration by ID
 * @param {string} workflowId - The workflow identifier
 * @returns {Object|null} Workflow configuration or null if not found
 */
export function getWorkflowConfig(workflowId) {
    return WORKFLOW_CONFIG[workflowId] || null;
}

/**
 * Get all workflow configurations
 * @returns {Object} All workflow configurations
 */
export function getAllWorkflowConfigs() {
    return WORKFLOW_CONFIG;
}

/**
 * Get step configuration for a specific workflow and step
 * @param {string} workflowId - The workflow identifier
 * @param {string} stepId - The step identifier
 * @returns {Object|null} Step configuration or null if not found
 */
export function getStepConfig(workflowId, stepId) {
    const workflow = WORKFLOW_CONFIG[workflowId];
    return workflow && workflow.steps[stepId] ? workflow.steps[stepId] : null;
}

/**
 * Get validation properties for a specific workflow step
 * @param {string} workflowId - The workflow identifier
 * @param {string} stepId - The step identifier
 * @returns {Array} Array of validation property names
 */
export function getStepValidationProperties(workflowId, stepId) {
    const stepConfig = getStepConfig(workflowId, stepId);
    return stepConfig ? stepConfig.validationProperties : [];
}

/**
 * Validate state object against step requirements
 * @param {string} workflowId - The workflow identifier
 * @param {string} stepId - The step identifier
 * @param {Object} state - State object to validate
 * @returns {Object} Validation result with isValid and missingProperties
 */
export function validateStepState(workflowId, stepId, state) {
    const requiredProperties = getStepValidationProperties(workflowId, stepId);
    const missingProperties = [];
    
    requiredProperties.forEach(prop => {
        if (state[prop] === undefined || state[prop] === null) {
            missingProperties.push(prop);
        }
    });
    
    return {
        isValid: missingProperties.length === 0,
        missingProperties: missingProperties,
        requiredProperties: requiredProperties
    };
}
