import React from 'react';
import { TASK_TYPES, REWARD_TYPES, getTaskFields, getRewardFields } from '../utils/questTypes';

/**
 * Component to render dynamic fields based on task type
 */
export function TaskFields({ task, index, onFieldChange, snbtVersion }) {
    const taskType = task.type;

    // Helper to get value, handling SNBT number objects
    const getValue = (val) => {
        if (val && typeof val === 'object' && val._snbt_number) {
            return val.value;
        }
        return val;
    };

    // Helper to set value, preserving SNBT number objects if they exist
    const setValue = (currentVal, newVal, hasSuffix = false) => {
        if (currentVal && typeof currentVal === 'object' && currentVal._snbt_number) {
            return { ...currentVal, value: Number(newVal) };
        }
        if (hasSuffix) {
            return { value: Number(newVal), type: hasSuffix, _snbt_number: true };
        }
        return newVal;
    };

    // ITEM type task
    if (taskType === TASK_TYPES.ITEM) {
        return (
            <>
                <div className="form-group">
                    <label>Item ID</label>
                    <input
                        type="text"
                        value={typeof task.item === 'string' ? task.item : (task.item?.id || '')}
                        onChange={(e) => {
                            const val = e.target.value;
                            const newItem = typeof task.item === 'string' ? val : { ...task.item, id: val };
                            onFieldChange('item', newItem);
                        }}
                        placeholder="minecraft:stone"
                    />
                </div>
                <div className="form-group">
                    <label>Count</label>
                    <input
                        type="number"
                        value={getValue(task.count) || 1}
                        onChange={(e) => onFieldChange('count', setValue(task.count, e.target.value))}
                    />
                </div>
                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={task.consume_items === true}
                            onChange={(e) => onFieldChange('consume_items', e.target.checked ? true : false)}
                        />
                        Consume Items
                    </label>
                </div>
                {task.match_components !== undefined && (
                    <div className="form-group">
                        <label>Match Components</label>
                        <select
                            value={task.match_components || 'strict'}
                            onChange={(e) => onFieldChange('match_components', e.target.value)}
                        >
                            <option value="strict">Strict</option>
                            <option value="fuzzy">Fuzzy</option>
                        </select>
                    </div>
                )}
            </>
        );
    }

    // CHECKMARK type task
    if (taskType === TASK_TYPES.CHECKMARK) {
        return (
            <div className="form-group">
                <label>Title (Optional)</label>
                <input
                    type="text"
                    value={task.title || ''}
                    onChange={(e) => onFieldChange('title', e.target.value)}
                    placeholder="Custom title"
                />
            </div>
        );
    }

    // KILL type task
    if (taskType === TASK_TYPES.KILL) {
        return (
            <>
                <div className="form-group">
                    <label>Entity ID</label>
                    <input
                        type="text"
                        value={task.entity || ''}
                        onChange={(e) => onFieldChange('entity', e.target.value)}
                        placeholder="minecraft:zombie"
                    />
                </div>
                <div className="form-group">
                    <label>Kill Count</label>
                    <input
                        type="number"
                        value={getValue(task.value) || 1}
                        onChange={(e) => onFieldChange('value', setValue(task.value, e.target.value, 'L'))}
                    />
                </div>
            </>
        );
    }

    // DIMENSION type task
    if (taskType === TASK_TYPES.DIMENSION) {
        return (
            <div className="form-group">
                <label>Dimension</label>
                <input
                    type="text"
                    value={task.dimension || ''}
                    onChange={(e) => onFieldChange('dimension', e.target.value)}
                    placeholder="minecraft:overworld"
                />
            </div>
        );
    }

    // BIOME type task
    if (taskType === TASK_TYPES.BIOME) {
        return (
            <div className="form-group">
                <label>Biome</label>
                <input
                    type="text"
                    value={task.biome || ''}
                    onChange={(e) => onFieldChange('biome', e.target.value)}
                    placeholder="minecraft:plains"
                />
            </div>
        );
    }

    // ADVANCEMENT type task
    if (taskType === TASK_TYPES.ADVANCEMENT) {
        return (
            <>
                <div className="form-group">
                    <label>Advancement</label>
                    <input
                        type="text"
                        value={task.advancement || ''}
                        onChange={(e) => onFieldChange('advancement', e.target.value)}
                        placeholder="minecraft:story/mine_stone"
                    />
                </div>
                <div className="form-group">
                    <label>Criterion (Optional)</label>
                    <input
                        type="text"
                        value={task.criterion || ''}
                        onChange={(e) => onFieldChange('criterion', e.target.value)}
                    />
                </div>
            </>
        );
    }

    // STRUCTURE type task
    if (taskType === TASK_TYPES.STRUCTURE) {
        return (
            <div className="form-group">
                <label>Structure</label>
                <input
                    type="text"
                    value={task.structure || ''}
                    onChange={(e) => onFieldChange('structure', e.target.value)}
                    placeholder="minecraft:village"
                />
            </div>
        );
    }

    // LOCATION type task
    if (taskType === TASK_TYPES.LOCATION) {
        return (
            <>
                <div className="form-group">
                    <label>Position [x, y, z]</label>
                    <input
                        type="text"
                        value={(task.position || []).join(', ')}
                        onChange={(e) => {
                            const coords = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                            onFieldChange('position', coords);
                        }}
                        placeholder="0, 64, 0"
                    />
                </div>
                <div className="form-group">
                    <label>Size [width, height, depth]</label>
                    <input
                        type="text"
                        value={(task.size || []).join(', ')}
                        onChange={(e) => {
                            const coords = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                            onFieldChange('size', coords);
                        }}
                        placeholder="10, 10, 10"
                    />
                </div>
                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={task.ignore_dimension === true}
                            onChange={(e) => onFieldChange('ignore_dimension', e.target.checked ? true : false)}
                        />
                        Ignore Dimension
                    </label>
                </div>
            </>
        );
    }

    // XP type task
    if (taskType === TASK_TYPES.XP) {
        return (
            <div className="form-group">
                <label>XP Points</label>
                <input
                    type="number"
                    value={getValue(task.value) || 0}
                    onChange={(e) => onFieldChange('value', setValue(task.value, e.target.value, 'L'))}
                />
            </div>
        );
    }

    // OBSERVATION type task
    if (taskType === TASK_TYPES.OBSERVATION) {
        return (
            <>
                <div className="form-group">
                    <label>Observe Type (Optional)</label>
                    <input
                        type="text"
                        value={task.observe_type || ''}
                        onChange={(e) => onFieldChange('observe_type', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Timer (ticks, Optional)</label>
                    <input
                        type="number"
                        value={getValue(task.timer) || ''}
                        onChange={(e) => e.target.value ? onFieldChange('timer', setValue(task.timer, e.target.value, 'L')) : onFieldChange('timer', undefined)}
                    />
                </div>
            </>
        );
    }

    // LOOT type task
    if (taskType === TASK_TYPES.LOOT) {
        return (
            <div className="form-group">
                <label>Loot Table</label>
                <input
                    type="text"
                    value={task.loot_table || ''}
                    onChange={(e) => onFieldChange('loot_table', e.target.value)}
                    placeholder="minecraft:chests/simple_dungeon"
                />
            </div>
        );
    }

    // Default for unknown or custom mod tasks
    return (
        <div className="form-group">
            <p className="text-muted">No specific fields for this task type. Check raw SNBT for custom properties.</p>
        </div>
    );
}

/**
 * Component to render dynamic fields based on reward type
 */
export function RewardFields({ reward, index, onFieldChange, snbtVersion }) {
    const rewardType = reward.type;

    // Helper to get value, handling SNBT number objects
    const getValue = (val) => {
        if (val && typeof val === 'object' && val._snbt_number) {
            return val.value;
        }
        return val;
    };

    // Helper to set value, preserving SNBT number objects if they exist
    const setValue = (currentVal, newVal) => {
        if (currentVal && typeof currentVal === 'object' && currentVal._snbt_number) {
            return { ...currentVal, value: Number(newVal) };
        }
        return Number(newVal);
    };

    // ITEM type reward
    if (rewardType === REWARD_TYPES.ITEM) {
        return (
            <>
                <div className="form-group">
                    <label>Item ID</label>
                    <input
                        type="text"
                        value={typeof reward.item === 'string' ? reward.item : (reward.item?.id || '')}
                        onChange={(e) => {
                            const val = e.target.value;
                            const newItem = typeof reward.item === 'string' ? val : { ...reward.item, id: val };
                            onFieldChange('item', newItem);
                        }}
                        placeholder="minecraft:diamond"
                    />
                </div>
                <div className="form-group">
                    <label>Count</label>
                    <input
                        type="number"
                        value={getValue(reward.count) || 1}
                        onChange={(e) => onFieldChange('count', setValue(reward.count, e.target.value))}
                    />
                </div>
                {reward.random_bonus !== undefined && (
                    <div className="form-group">
                        <label>Random Bonus</label>
                        <input
                            type="number"
                            value={getValue(reward.random_bonus) || 0}
                            onChange={(e) => onFieldChange('random_bonus', setValue(reward.random_bonus, e.target.value))}
                        />
                    </div>
                )}
            </>
        );
    }

    // XP type reward
    if (rewardType === REWARD_TYPES.XP) {
        return (
            <div className="form-group">
                <label>XP Amount</label>
                <input
                    type="number"
                    value={getValue(reward.xp) || 0}
                    onChange={(e) => onFieldChange('xp', Number(e.target.value))}
                />
            </div>
        );
    }

    // XP_LEVELS type reward
    if (rewardType === REWARD_TYPES.XP_LEVELS) {
        return (
            <div className="form-group">
                <label>XP Levels</label>
                <input
                    type="number"
                    value={getValue(reward.xp_levels) || 0}
                    onChange={(e) => onFieldChange('xp_levels', Number(e.target.value))}
                />
            </div>
        );
    }

    // COMMAND type reward
    if (rewardType === REWARD_TYPES.COMMAND) {
        return (
            <>
                <div className="form-group">
                    <label>Command</label>
                    <input
                        type="text"
                        value={reward.command || ''}
                        onChange={(e) => onFieldChange('command', e.target.value)}
                        placeholder="/give @p minecraft:diamond"
                    />
                </div>
                {snbtVersion === '1.20.1' ? (
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={reward.elevate_perms === true}
                                onChange={(e) => onFieldChange('elevate_perms', e.target.checked ? true : false)}
                            />
                            Elevate Perms
                        </label>
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Permission Level</label>
                        <input
                            type="number"
                            value={reward.permission_level || 2}
                            onChange={(e) => onFieldChange('permission_level', Number(e.target.value))}
                        />
                    </div>
                )}
                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={reward.silent === true}
                            onChange={(e) => onFieldChange('silent', e.target.checked ? true : false)}
                        />
                        Silent
                    </label>
                </div>
            </>
        );
    }

    // CHOICE type reward
    if (rewardType === REWARD_TYPES.CHOICE) {
        return (
            <div className="form-group">
                <label>Table ID (Optional)</label>
                <input
                    type="text"
                    value={reward.table_id || ''}
                    onChange={(e) => onFieldChange('table_id', e.target.value)}
                />
            </div>
        );
    }

    // LOOT type reward
    if (rewardType === REWARD_TYPES.LOOT) {
        return (
            <div className="form-group">
                <label>Loot Table</label>
                <input
                    type="text"
                    value={reward.loot_table || ''}
                    onChange={(e) => onFieldChange('loot_table', e.target.value)}
                    placeholder="minecraft:chests/simple_dungeon"
                />
            </div>
        );
    }

    // RANDOM type reward
    if (rewardType === REWARD_TYPES.RANDOM) {
        return (
            <div className="form-group">
                <label>Random Table ID (Optional)</label>
                <input
                    type="text"
                    value={reward.table_id || ''}
                    onChange={(e) => onFieldChange('table_id', e.target.value)}
                />
            </div>
        );
    }

    // TOAST type reward
    if (rewardType === REWARD_TYPES.TOAST) {
        return (
            <div className="form-group">
                <label>Description</label>
                <textarea
                    rows="3"
                    value={reward.description || ''}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    placeholder="Reward notification text"
                />
            </div>
        );
    }

    // BLOOD type reward
    if (rewardType === REWARD_TYPES.BLOOD) {
        return (
            <div className="form-group">
                <label>Blood Amount</label>
                <input
                    type="number"
                    value={getValue(reward.amount) || 0}
                    onChange={(e) => onFieldChange('amount', Number(e.target.value))}
                />
            </div>
        );
    }

    // Default for unknown reward types
    return (
        <div className="form-group">
            <p className="text-muted">No specific fields for this reward type. Check raw SNBT for custom properties.</p>
        </div>
    );
}
