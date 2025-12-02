/**
 * ID Generator for FTBQuests
 * Generates unique hexadecimal IDs similar to the FTBQuests format
 */

/**
 * Generate a random hex string of specified length
 */
function generateRandomHex(length) {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a unique Quest ID (16 characters)
 * Format: XXXXXXXXXXXXXXXX (16 hex chars)
 */
export function generateQuestId(existingIds = []) {
    let id;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        id = generateRandomHex(16);
        attempts++;
    } while (existingIds.includes(id) && attempts < maxAttempts);
    
    return id;
}

/**
 * Generate a unique Task/Reward ID (16 characters)
 * Format: XXXXXXXXXXXXXXXX (16 hex chars)
 */
export function generateTaskId(existingIds = []) {
    let id;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        id = generateRandomHex(16);
        attempts++;
    } while (existingIds.includes(id) && attempts < maxAttempts);
    
    return id;
}

/**
 * Calculate next position for a new quest
 * Suggests position based on existing quests
 */
export function suggestQuestPosition(quests = [], spacing = 2.5) {
    if (!quests || quests.length === 0) {
        return { x: 0, y: 0 };
    }

    // Get all existing positions
    const positions = quests.map(q => ({
        x: q.x?.value !== undefined ? q.x.value : (q.x || 0),
        y: q.y?.value !== undefined ? q.y.value : (q.y || 0)
    }));

    // Find the rightmost position
    const maxX = Math.max(...positions.map(p => p.x));
    const questsAtMaxX = positions.filter(p => p.x === maxX);
    
    if (questsAtMaxX.length > 0) {
        // Get the average Y of quests at max X
        const avgY = questsAtMaxX.reduce((sum, p) => sum + p.y, 0) / questsAtMaxX.length;
        
        // Place new quest to the right
        return {
            x: maxX + spacing,
            y: avgY
        };
    }

    // Fallback: place at origin with offset
    return { x: spacing, y: 0 };
}

/**
 * Get all existing IDs from quests, tasks, and rewards
 */
export function getAllExistingIds(data) {
    const ids = new Set();
    
    if (data.quests) {
        data.quests.forEach(quest => {
            if (quest.id) ids.add(quest.id);
            
            if (quest.tasks) {
                quest.tasks.forEach(task => {
                    if (task.id) ids.add(task.id);
                });
            }
            
            if (quest.rewards) {
                quest.rewards.forEach(reward => {
                    if (reward.id) ids.add(reward.id);
                });
            }
        });
    }
    
    return Array.from(ids);
}

/**
 * Create a default quest object
 */
export function createDefaultQuest(position, id) {
    return {
        id: id,
        x: position.x,
        y: position.y,
        shape: 'default',
        icon: {
            id: 'minecraft:stone'
        },
        tasks: [],
        rewards: []
    };
}

/**
 * Create a default task based on type
 */
export function createDefaultTask(type, id) {
    const baseTask = {
        id: id,
        type: type
    };

    switch (type) {
        case 'item':
            return {
                ...baseTask,
                item: {
                    id: 'minecraft:stone',
                    count: 1
                },
                count: 1,
                consume_items: false
            };
        case 'checkmark':
            return baseTask;
        case 'kill':
            return {
                ...baseTask,
                entity: 'minecraft:zombie',
                value: { value: 1, type: 'L', _snbt_number: true }
            };
        case 'dimension':
            return {
                ...baseTask,
                dimension: 'minecraft:overworld'
            };
        case 'biome':
            return {
                ...baseTask,
                biome: 'minecraft:plains'
            };
        case 'advancement':
            return {
                ...baseTask,
                advancement: 'minecraft:story/mine_stone',
                criterion: ''
            };
        case 'structure':
            return {
                ...baseTask,
                structure: 'minecraft:village'
            };
        case 'location':
            return {
                ...baseTask,
                position: [0, 64, 0],
                size: [10, 10, 10],
                ignore_dimension: false
            };
        case 'xp':
            return {
                ...baseTask,
                value: { value: 100, type: 'L', _snbt_number: true }
            };
        case 'observation':
            return {
                ...baseTask,
                observe_type: '',
                timer: { value: 100, type: 'L', _snbt_number: true }
            };
        default:
            return baseTask;
    }
}

/**
 * Create a default reward based on type
 */
export function createDefaultReward(type, id) {
    const baseReward = {
        id: id,
        type: type
    };

    switch (type) {
        case 'item':
            return {
                ...baseReward,
                item: {
                    id: 'minecraft:diamond',
                    count: 1
                },
                count: 1
            };
        case 'xp':
            return {
                ...baseReward,
                xp: 100
            };
        case 'xp_levels':
            return {
                ...baseReward,
                xp_levels: 1
            };
        case 'command':
            return {
                ...baseReward,
                command: '/say Quest completed!',
                permission_level: 2,
                silent: true
            };
        case 'choice':
            return {
                ...baseReward,
                table_id: ''
            };
        case 'loot':
            return {
                ...baseReward,
                loot_table: 'minecraft:chests/simple_dungeon'
            };
        case 'random':
            return {
                ...baseReward,
                table_id: ''
            };
        case 'toast':
            return {
                ...baseReward,
                description: 'Quest completed!'
            };
        default:
            return baseReward;
    }
}
