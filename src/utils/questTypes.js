/**
 * Quest Types Definitions
 * Defines all task and reward types with their properties
 */

export const TASK_TYPES = {
    ITEM: 'item',
    CHECKMARK: 'checkmark',
    KILL: 'kill',
    DIMENSION: 'dimension',
    BIOME: 'biome',
    ADVANCEMENT: 'advancement',
    STRUCTURE: 'structure',
    LOCATION: 'location',
    XP: 'xp',
    OBSERVATION: 'observation',
    LOOT: 'loot',
    // Custom mod tasks
    NATURESAURA_END: 'naturesaura:end',
    NATURESAURA_NETHER: 'naturesaura:nether',
    NATURESAURA_OVERWORLD: 'naturesaura:overworld',
    PRODUCTIVEBEES_ARCANE_CRYSTAL: 'productivebees:arcane_crystal',
    PRODUCTIVEBEES_AWAKENED_SUPREMIUM: 'productivebees:awakened_supremium',
};

export const REWARD_TYPES = {
    ITEM: 'item',
    XP: 'xp',
    XP_LEVELS: 'xp_levels',
    CHOICE: 'choice',
    COMMAND: 'command',
    LOOT: 'loot',
    RANDOM: 'random',
    TOAST: 'toast',
    BLOOD: 'blood',
};

/**
 * Task field definitions - defines which fields each task type has
 */
export const TASK_FIELDS = {
    [TASK_TYPES.ITEM]: [
        { key: 'item', label: 'Item', type: 'object', subfields: [
            { key: 'id', label: 'Item ID', type: 'text', required: true },
            { key: 'count', label: 'Count', type: 'number', default: 1 },
            { key: 'components', label: 'Components', type: 'object', advanced: true }
        ]},
        { key: 'count', label: 'Count', type: 'number', default: 1 },
        { key: 'consume_items', label: 'Consume Items', type: 'boolean', default: false },
        { key: 'match_components', label: 'Match Components', type: 'select', options: ['strict', 'fuzzy'], optional: true }
    ],
    [TASK_TYPES.CHECKMARK]: [
        { key: 'title', label: 'Title', type: 'text', optional: true }
    ],
    [TASK_TYPES.KILL]: [
        { key: 'entity', label: 'Entity ID', type: 'text', required: true },
        { key: 'value', label: 'Kill Count', type: 'number', default: 1, suffix: 'L' }
    ],
    [TASK_TYPES.DIMENSION]: [
        { key: 'dimension', label: 'Dimension', type: 'text', required: true, 
          placeholder: 'minecraft:overworld' }
    ],
    [TASK_TYPES.BIOME]: [
        { key: 'biome', label: 'Biome', type: 'text', required: true, 
          placeholder: 'minecraft:plains' }
    ],
    [TASK_TYPES.ADVANCEMENT]: [
        { key: 'advancement', label: 'Advancement', type: 'text', required: true },
        { key: 'criterion', label: 'Criterion', type: 'text', optional: true }
    ],
    [TASK_TYPES.STRUCTURE]: [
        { key: 'structure', label: 'Structure', type: 'text', required: true }
    ],
    [TASK_TYPES.LOCATION]: [
        { key: 'position', label: 'Position [x, y, z]', type: 'array', itemType: 'number' },
        { key: 'size', label: 'Size [width, height, depth]', type: 'array', itemType: 'number' },
        { key: 'ignore_dimension', label: 'Ignore Dimension', type: 'boolean', default: false }
    ],
    [TASK_TYPES.XP]: [
        { key: 'value', label: 'XP Points', type: 'number', required: true, suffix: 'L' }
    ],
    [TASK_TYPES.OBSERVATION]: [
        { key: 'observe_type', label: 'Observe Type', type: 'text', optional: true },
        { key: 'timer', label: 'Timer (ticks)', type: 'number', optional: true, suffix: 'L' }
    ],
    [TASK_TYPES.LOOT]: [
        { key: 'loot_table', label: 'Loot Table', type: 'text', required: true }
    ]
};

/**
 * Reward field definitions - defines which fields each reward type has
 */
export const REWARD_FIELDS = {
    [REWARD_TYPES.ITEM]: [
        { key: 'item', label: 'Item', type: 'object', subfields: [
            { key: 'id', label: 'Item ID', type: 'text', required: true },
            { key: 'count', label: 'Count', type: 'number', default: 1 },
            { key: 'components', label: 'Components', type: 'object', advanced: true }
        ]},
        { key: 'count', label: 'Count', type: 'number', default: 1 },
        { key: 'random_bonus', label: 'Random Bonus', type: 'number', optional: true }
    ],
    [REWARD_TYPES.XP]: [
        { key: 'xp', label: 'XP Amount', type: 'number', required: true }
    ],
    [REWARD_TYPES.XP_LEVELS]: [
        { key: 'xp_levels', label: 'XP Levels', type: 'number', required: true }
    ],
    [REWARD_TYPES.CHOICE]: [
        { key: 'table_id', label: 'Loot Table ID', type: 'text', optional: true }
    ],
    [REWARD_TYPES.COMMAND]: [
        { key: 'command', label: 'Command', type: 'text', required: true },
        { key: 'permission_level', label: 'Permission Level', type: 'number', default: 2 },
        { key: 'silent', label: 'Silent', type: 'boolean', default: true }
    ],
    [REWARD_TYPES.LOOT]: [
        { key: 'loot_table', label: 'Loot Table', type: 'text', required: true }
    ],
    [REWARD_TYPES.RANDOM]: [
        { key: 'table_id', label: 'Random Table ID', type: 'text', optional: true }
    ],
    [REWARD_TYPES.TOAST]: [
        { key: 'description', label: 'Description', type: 'text', required: true }
    ],
    [REWARD_TYPES.BLOOD]: [
        { key: 'amount', label: 'Blood Amount', type: 'number', required: true }
    ]
};

/**
 * Get field definition for a specific task type
 */
export function getTaskFields(taskType) {
    return TASK_FIELDS[taskType] || [];
}

/**
 * Get field definition for a specific reward type
 */
export function getRewardFields(rewardType) {
    return REWARD_FIELDS[rewardType] || [];
}

/**
 * Check if a value should have a suffix when stringified
 */
export function getFieldSuffix(taskType, fieldKey) {
    const fields = TASK_FIELDS[taskType] || [];
    const field = fields.find(f => f.key === fieldKey);
    return field?.suffix || '';
}
