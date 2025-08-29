/**
 * SW5E QoL Module Configuration
 * Manages module settings, preferences, and initialization
 */

export class SW5EQoLModule {
	constructor() {
		this.name = 'sw5e-qol';
		this.title = 'SW5E Quality of Life';
		this.version = '0.1.0';
		
		// Module state
		this.initialized = false;
		this.workflows = new Map();
		this.templates = new Map();
		
		// Default settings
		this.defaultSettings = {
			autoIntercept: false,
			quickExecute: false,
			showTooltips: true,
			enableUndo: true,
			rollMode: 'publicroll',
			enableDiceAnimations: true,
			enableResourceTracking: true
		};
	}
	
	/**
	 * Register module settings with Foundry
	 */
	registerSettings() {
		// Module settings
		game.settings.register(this.name, 'autoIntercept', {
			name: 'Auto-Intercept Actions',
			hint: 'Automatically intercept SW5E actions to use enhanced dialogs',
			scope: 'world',
			config: true,
			type: Boolean,
			default: this.defaultSettings.autoIntercept
		});
		
		game.settings.register(this.name, 'quickExecute', {
			name: 'Quick Execute Mode',
			hint: 'Enable quick execution for common actions',
			scope: 'world',
			config: true,
			type: Boolean,
			default: this.defaultSettings.quickExecute
		});
		
		game.settings.register(this.name, 'showTooltips', {
			name: 'Show Tooltips',
			hint: 'Display helpful tooltips in dialogs',
			scope: 'client',
			config: true,
			type: Boolean,
			default: this.defaultSettings.showTooltips
		});
		
		game.settings.register(this.name, 'enableUndo', {
			name: 'Enable Undo System',
			hint: 'Allow undoing actions and resource changes',
			scope: 'world',
			config: true,
			type: Boolean,
			default: this.defaultSettings.enableUndo
		});
		
		game.settings.register(this.name, 'rollMode', {
			name: 'Default Roll Mode',
			hint: 'Default roll mode for dice rolls',
			scope: 'client',
			config: true,
			type: String,
			choices: {
				'publicroll': 'Public Roll',
				'gmroll': 'GM Roll',
				'blindroll': 'Blind Roll',
				'selfroll': 'Self Roll'
			},
			default: this.defaultSettings.rollMode
		});
		
		game.settings.register(this.name, 'enableDiceAnimations', {
			name: 'Enable Dice Animations',
			hint: 'Show dice animations for rolls (requires Dice So Nice)',
			scope: 'client',
			config: true,
			type: Boolean,
			default: this.defaultSettings.enableDiceAnimations
		});
		
		game.settings.register(this.name, 'enableResourceTracking', {
			name: 'Enable Resource Tracking',
			hint: 'Track Force Points, Tech Points, and other resources',
			scope: 'world',
			config: true,
			type: Boolean,
			default: this.defaultSettings.enableResourceTracking
		});
	}
	
	/**
	 * Load language files
	 */
	async loadLanguages() {
		try {
			// Load English language file
			const enLang = await fetch(`modules/${this.name}/lang/en.json`);
			const enData = await enLang.json();
			
			// Register with Foundry
			game.i18n.translations.SW5E_QOL = enData['SW5E-QOL'];
			
			console.log('SW5E QoL | Languages loaded successfully');
		} catch (error) {
			console.error('SW5E QoL | Error loading languages:', error);
		}
	}
	
	/**
	 * Initialize workflow engines
	 */
	async initializeWorkflows() {
		try {
			// Import workflow modules
			const { WorkflowOrchestrator } = await import('./workflow/workflow-orchestrator.js');
			
			// Initialize orchestrator
			this.workflowOrchestrator = new WorkflowOrchestrator();
			await this.workflowOrchestrator.initialize();
			
			console.log('SW5E QoL | Workflows initialized successfully');
		} catch (error) {
			console.error('SW5E QoL | Error initializing workflows:', error);
		}
	}
	
	/**
	 * Register Foundry hooks
	 */
	registerHooks() {
		try {
			// Import hooks module
			import('./workflow/workflow-hooks.js').then(module => {
				module.registerHooks();
			});
			
			console.log('SW5E QoL | Hooks registered successfully');
		} catch (error) {
			console.error('SW5E QoL | Error registering hooks:', error);
		}
	}
	
	/**
	 * Load Handlebars templates
	 */
	async loadTemplates() {
		try {
			// Load dialog templates
			await this.loadDialogTemplates();
			
			// Load card templates
			await this.loadCardTemplates();
			
			console.log('SW5E QoL | Templates loaded successfully');
		} catch (error) {
			console.error('SW5E QoL | Error loading templates:', error);
		}
	}
	
	/**
	 * Load dialog templates
	 */
	async loadDialogTemplates() {
		// This will be implemented when we create the template loading system
		console.log('SW5E QoL | Dialog templates loading system to be implemented');
	}
	
	/**
	 * Load card templates
	 */
	async loadCardTemplates() {
		// This will be implemented when we create the template loading system
		console.log('SW5E QoL | Card templates loading system to be implemented');
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
		switch (feature) {
			case 'autoIntercept':
				return this.getSetting('autoIntercept');
			case 'quickExecute':
				return this.getSetting('quickExecute');
			case 'undo':
				return this.getSetting('enableUndo');
			case 'resourceTracking':
				return this.getSetting('enableResourceTracking');
			case 'diceAnimations':
				return this.getSetting('enableDiceAnimations');
			default:
				return false;
		}
	}
	
	/**
	 * Cleanup module resources
	 */
	cleanup() {
		this.initialized = false;
		this.workflows.clear();
		this.templates.clear();
		
		if (this.workflowOrchestrator) {
			this.workflowOrchestrator.cleanup();
		}
	}
}
