import { featureManager } from './feature-manager.js';
import { API } from '../api.js';

/**
 * Initialize the feature system using Foundry hooks
 */
Hooks.once('ready', async () => {
    try {
        await featureManager.init();
        API.log('info', 'SW5E QoL: Feature system initialized');
    } catch (error) {
        API.log('error', 'SW5E QoL: Feature system initialization failed', error);
    }
});

/**
 * Clear feature cache when actors are updated
 */
Hooks.on('updateActor', (actor, changes, options, userId) => {
    if (game.user.id === userId) {
        featureManager.clearActorCache(actor.id);
    }
});

/**
 * Clear feature cache when items are updated
 */
Hooks.on('updateItem', (item, changes, options, userId) => {
    if (game.user.id === userId && item.actor) {
        featureManager.clearActorCache(item.actor.id);
    }
});
