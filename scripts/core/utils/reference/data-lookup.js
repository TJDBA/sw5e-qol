// ============================================================================
// DATA PATH RESOLUTION
// ============================================================================

/**
 * Get the data paths for types stored on an object
 * Returns an object with the paths to various items related to the resource type.
 * The paths are information returned will have place holders for items that are name or array specific
 * Example category = power, type = ForcePowers: Return {basePath: "{Actor}.itemTypes.power", isArray: true, filters: {school: ["Universal", "Light", "Dark"]}, subpaths: {...}}
 * Example category = power, type = TechPowers: Return {basePath: "{Actor}.itemTypes.power", isArray: true, filters: {school: ["Tech"]}, subpaths: {...}}
 * 
 * @param {string} category - The category of data (power, etc.)
 * @param {string} type - The specific type within the category
 * @param {Object} options - Additional options for path resolution
 * @returns {Object|null} Object containing basePath, isArray, filters, and subpaths, or null if not found
 */
function getDataPaths(category, type, options = {}) {
    try {
        // Load the data paths configuration
        const dataPaths = JSON.parse(FileLib.read("sw5e-qol", "presets/data/data-paths.json"));
        
        // Check if category exists
        if (!dataPaths[category]) {
            API.log('warning', `Category '${category}' not found in data paths`);
            return null;
        }
        
        // Check if type exists within category
        if (!dataPaths[category][type]) {
            API.log('warning', `Type '${type}' not found in category '${category}'`);
            return null;
        }
        
        // Get the path configuration
        const pathConfig = dataPaths[category][type];
        
        // Return the configuration object with all properties
        return {
            basePath: pathConfig.basePath,
            isArray: pathConfig.isArray || false,
            filters: pathConfig.filters || {},
            subpaths: pathConfig.subpaths || {}
        };
        
    } catch (error) {
        API.log('error', `Error loading data paths: ${error.message}`);
        return null;
    }
}

/**
 * Resolve a data path by replacing placeholders with object type
 * @param {string} path - Path with placeholders like {Actor}
 * @param {string} objectType - Type of object (Actor, Item, etc.)
 * @returns {string} Resolved path
 */
function resolveDataPath(path, objectType) {
    return path.replace(/{Actor}/g, 'object')
              .replace(/{Item}/g, 'object');
}

/**
 * Apply filter criteria to an array
 * @param {Array} array - Array to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered array
 */
function filterArrayByCriteria(array, filters) {
    if (!filters || Object.keys(filters).length === 0) {
        return array;
    }

    return array.filter(item => {
        return Object.entries(filters).every(([key, values]) => {
            const itemValue = getProperty(item, key);
            return Array.isArray(values) ? values.includes(itemValue) : itemValue === values;
        });
    });
}

/**
 * Get array from object using path configuration
 * @param {Object} object - Object to search
 * @param {Object} pathConfig - Path configuration from getDataPaths
 * @param {Object} additionalFilter - Additional filter (optional)
 * @returns {Array} Array of items
 */
function getArrayFromPath(object, pathConfig, additionalFilter = null) {
    if (!pathConfig) {
        API.log('warning', 'No path configuration provided');
        return [];
    }

    try {
        // Get the base array
        const basePath = resolveDataPath(pathConfig.basePath, 'object');
        let array = getProperty(object, basePath.replace('object', ''));

        if (!Array.isArray(array)) {
            API.log('warning', `Base path does not resolve to an array: ${basePath}`);
            return [];
        }

        // Apply filters if specified
        if (pathConfig.filters) {
            array = filterArrayByCriteria(array, pathConfig.filters);
        }

        // Apply additional filter if provided
        if (additionalFilter) {
            array = filterArrayByCriteria(array, additionalFilter);
        }

        return array;
    } catch (error) {
        API.log('error', `Error getting array from path: ${error.message}`);
        return [];
    }
}

export { getDataPaths, resolveDataPath, filterArrayByCriteria, getArrayFromPath };
