/**
 * SW5E QoL Module Configuration
 * Manages module settings, preferences, and initialization
 */

export class SW5EQoLModule {
	constructor() {
		this.name = 'sw5e-qol';
		this.title = 'SW5E Quality of Life';
		this.version = '0.1.0';
		this.initialized = false;
		
		// Core systems
		this.stateManager = null;
		this.workflowOrchestrator = null;
		
		// Templates and data
		this.templates = new Map();
		this.packs = new Map();
	}
	
	/**
	 * Register module settings
	 */
	registerSettings() {
		const defaultSettings = {
			autoIntercept: true,
			quickExecute: false,
			showTooltips: true,
			enableUndo: true,
			debugMode: false
		};
		
		for (const [key, value] of Object.entries(defaultSettings)) {
			game.settings.register(this.name, key, {
				name: `SW5E-QOL.settings.${key}`,
				hint: `SW5E-QOL.settings.${key}Hint`,
				scope: 'client',
				config: true,
				default: value,
				type: typeof value === 'boolean' ? Boolean : String
			});
		}
		
		console.log('SW5E QoL | Settings registered successfully');
	}
	
	/**
	 * Load language files
	 */
	async loadLanguages() {
		try {
			const lang = await fetch(`modules/${this.name}/lang/en.json`);
			if (lang.ok) {
				const data = await lang.json();
				game.i18n.translations.SW5E_QOL = data.SW5E_QOL;
				console.log('SW5E QoL | Languages loaded successfully');
			}
		} catch (error) {
			console.warn('SW5E QoL | Could not load language file:', error);
		}
	}
	
	/**
	 * Initialize workflow system
	 */
	async initializeWorkflows() {
		try {
			// Import workflow orchestrator
			const { WorkflowOrchestrator } = await import('./workflow/workflow-orchestrator.js');
			
			// Create workflow orchestrator instance
			this.workflowOrchestrator = new WorkflowOrchestrator();
			
			// Initialize workflows
			await this.workflowOrchestrator.initializeWorkflows();
			
			console.log('SW5E QoL | Workflows initialized successfully');
		} catch (error) {
			console.error('SW5E QoL | Error initializing workflows:', error);
			// Don't fail completely - workflows can be initialized later
		}
	}
	
	/**
	 * Register Foundry hooks
	 */
	registerHooks() {
		try {
			// Basic hooks for now - more will be added as features are implemented
			Hooks.on('renderChatMessage', this.onRenderChatMessage.bind(this));
			Hooks.on('preCreateChatMessage', this.onPreCreateChatMessage.bind(this));
			
			console.log('SW5E QoL | Hooks registered successfully');
		} catch (error) {
			console.error('SW5E QoL | Error registering hooks:', error);
		}
	}
	
	/**
	 * Load dialog and card templates
	 */
	async loadTemplates() {
		try {
			// Template loading system to be implemented
			console.log('SW5E QoL | Dialog templates loading system to be implemented');
			
			// For now, just mark as loaded
			this.templates.set('dialogs', new Map());
			this.templates.set('cards', new Map());
			
			console.log('SW5E QoL | Templates loaded successfully');
		} catch (error) {
			console.error('SW5E QoL | Error loading templates:', error);
		}
	}
	
	/**
	 * Initialize the module
	 */
	async initialize() {
		try {
			console.log('SW5E QoL | Initializing...');
			
			// Register settings
			this.registerSettings();
			
			// Load languages
			await this.loadLanguages();
			
			// Initialize state manager
			const { StateManager } = await import('./core/state/state-manager.js');
			this.stateManager = new StateManager();
			
			// Initialize workflows
			await this.initializeWorkflows();
			
			// Register hooks
			this.registerHooks();
			
			// Load templates
			await this.loadTemplates();
			
			this.initialized = true;
			console.log('SW5E QoL | Module initialized successfully');
			
		} catch (error) {
			console.error('SW5E QoL | Error during initialization:', error);
			this.initialized = false;
		}
	}
	
	/**
	 * Get a setting value
	 */
	getSetting(key) {
		return game.settings.get(this.name, key);
	}
	
	/**
	 * Set a setting value
	 */
	setSetting(key, value) {
		return game.settings.set(this.name, key, value);
	}
	
	/**
	 * Check if a feature is enabled
	 */
	isFeatureEnabled(feature) {
		const featureSettings = {
			'undo': this.getSetting('enableUndo'),
			'tooltips': this.getSetting('showTooltips'),
			'autoIntercept': this.getSetting('autoIntercept'),
			'quickExecute': this.getSetting('quickExecute')
		};
		
		return featureSettings[feature] || false;
	}
	
	/**
	 * Hook handlers
	 */
	onRenderChatMessage(message, html) {
		// Chat message rendering hooks to be implemented
	}
	
	onPreCreateChatMessage(messageData) {
		// Chat message creation hooks to be implemented
	}
	
	/**
	 * Cleanup resources
	 */
	cleanup() {
		if (this.stateManager) {
			this.stateManager.cleanup();
		}
		
		if (this.workflowOrchestrator) {
			this.workflowOrchestrator.cleanup();
		}
		
		this.initialized = false;
		console.log('SW5E QoL | Module cleaned up');
	}
}
