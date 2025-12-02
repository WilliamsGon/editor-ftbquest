
import React, { useState } from 'react';

function TableView({ data, onUpdate }) {
    const [filter, setFilter] = useState('quests'); // 'quests', 'tasks', 'rewards'
    const [editedData, setEditedData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});

    const handleCellEdit = (path, value) => {
        setEditedData(prev => ({
            ...prev,
            [path]: value
        }));
        setHasChanges(true);
    };

    const handleColumnFilter = (column, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: value
        }));
    };

    const clearFilters = () => {
        setColumnFilters({});
    };

    const handleCheckAllColumn = (columnPath, items) => {
        items.forEach((item, index) => {
            handleCellEdit(`${columnPath}.${index}`, true);
        });
    };

    const handleUncheckAllColumn = (columnPath, items) => {
        items.forEach((item, index) => {
            handleCellEdit(`${columnPath}.${index}`, false);
        });
    };

    const handleSave = () => {
        // Apply all changes to the data
        const updatedData = { ...data };

        Object.keys(editedData).forEach(path => {
            const parts = path.split('.');
            let current = updatedData;

            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }

            const lastKey = parts[parts.length - 1];
            const value = editedData[path];

            // Handle boolean values explicitly
            if (typeof value === 'boolean') {
                current[lastKey] = value;
            }
            // Handle numeric values with SNBT type preservation
            else if (current[lastKey] && typeof current[lastKey] === 'object' && current[lastKey]._snbt_number) {
                current[lastKey] = { ...current[lastKey], value: Number(value) };
            } else if (!isNaN(value) && value !== '') {
                current[lastKey] = Number(value);
            } else {
                current[lastKey] = value;
            }
        });

        onUpdate(updatedData);
        setEditedData({});
        setHasChanges(false);
    };

    const getCellValue = (path, defaultValue) => {
        if (editedData[path] !== undefined) {
            return editedData[path];
        }

        const parts = path.split('.');
        let current = data;

        for (const part of parts) {
            if (current === undefined || current === null) return defaultValue;
            current = current[part];
        }

        if (current && typeof current === 'object' && current.value !== undefined) {
            return current.value;
        }

        return current !== undefined ? current : defaultValue;
    };

    const applyFilters = (items, filterConfig) => {
        return items.filter(item => {
            return Object.keys(columnFilters).every(column => {
                const filterValue = columnFilters[column];
                if (!filterValue) return true;

                const itemValue = filterConfig[column](item);
                if (itemValue === null || itemValue === undefined) return false;

                return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            });
        });
    };

    const renderQuestsTable = () => {
        const quests = data.quests || [];

        const filterConfig = {
            id: (q) => q.id,
            x: (q) => q.x?.value || q.x,
            y: (q) => q.y?.value || q.y,
            shape: (q) => q.shape,
            size: (q) => q.size?.value || q.size,
            icon: (q) => q.icon?.id,
        };

        const filteredQuests = applyFilters(quests, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Shape</th>
                        <th>Size</th>
                        <th>Icon</th>
                        <th>Hide Dep Lines</th>
                        <th>Hide Until Complete</th>
                        <th>Tasks</th>
                        <th>Rewards</th>
                    </tr>
                    <tr className="filter-row">
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.id || ''}
                                onChange={(e) => handleColumnFilter('id', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.x || ''}
                                onChange={(e) => handleColumnFilter('x', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.y || ''}
                                onChange={(e) => handleColumnFilter('y', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.shape || ''}
                                onChange={(e) => handleColumnFilter('shape', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.size || ''}
                                onChange={(e) => handleColumnFilter('size', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.icon || ''}
                                onChange={(e) => handleColumnFilter('icon', e.target.value)}
                            />
                        </th>
                        <th>
                            <div className="checkbox-column-actions">
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredQuests.forEach((quest) => {
                                            const originalIndex = quests.indexOf(quest);
                                            handleCellEdit(`quests.${originalIndex}.hide_dependency_lines`, true);
                                        });
                                    }}
                                    title="Marcar todos"
                                >
                                    ✓
                                </button>
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredQuests.forEach((quest) => {
                                            const originalIndex = quests.indexOf(quest);
                                            handleCellEdit(`quests.${originalIndex}.hide_dependency_lines`, false);
                                        });
                                    }}
                                    title="Desmarcar todos"
                                >
                                    ✗
                                </button>
                            </div>
                        </th>
                        <th>
                            <div className="checkbox-column-actions">
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredQuests.forEach((quest) => {
                                            const originalIndex = quests.indexOf(quest);
                                            handleCellEdit(`quests.${originalIndex}.hide_until_deps_complete`, true);
                                        });
                                    }}
                                    title="Marcar todos"
                                >
                                    ✓
                                </button>
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredQuests.forEach((quest) => {
                                            const originalIndex = quests.indexOf(quest);
                                            handleCellEdit(`quests.${originalIndex}.hide_until_deps_complete`, false);
                                        });
                                    }}
                                    title="Desmarcar todos"
                                >
                                    ✗
                                </button>
                            </div>
                        </th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredQuests.map((quest) => {
                        const originalIndex = quests.indexOf(quest);
                        return (
                            <tr key={quest.id}>
                                <td className="readonly">{quest.id}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${originalIndex}.x`, quest.x?.value || quest.x || 0)}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.x`, e.target.value)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${originalIndex}.y`, quest.y?.value || quest.y || 0)}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.y`, e.target.value)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={getCellValue(`quests.${originalIndex}.shape`, quest.shape || '')}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.shape`, e.target.value)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={getCellValue(`quests.${originalIndex}.size`, quest.size?.value || quest.size || 1)}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.size`, e.target.value)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={getCellValue(`quests.${originalIndex}.icon.id`, quest.icon?.id || '')}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.icon.id`, e.target.value)}
                                        className="table-input"
                                        placeholder="minecraft:item"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={getCellValue(`quests.${originalIndex}.hide_dependency_lines`, quest.hide_dependency_lines) === true}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.hide_dependency_lines`, e.target.checked ? true : false)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={getCellValue(`quests.${originalIndex}.hide_until_deps_complete`, quest.hide_until_deps_complete) === true}
                                        onChange={(e) => handleCellEdit(`quests.${originalIndex}.hide_until_deps_complete`, e.target.checked ? true : false)}
                                    />
                                </td>
                                <td className="readonly">{quest.tasks?.length || 0}</td>
                                <td className="readonly">{quest.rewards?.length || 0}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderTasksTable = () => {
        const tasks = [];
        (data.quests || []).forEach(quest => {
            (quest.tasks || []).forEach((task, tIndex) => {
                tasks.push({ quest, task, tIndex, qIndex: data.quests.indexOf(quest) });
            });
        });

        const filterConfig = {
            questId: (t) => t.quest.id,
            taskId: (t) => t.task.id,
            type: (t) => t.task.type,
            itemId: (t) => t.task.item?.id,
            entity: (t) => t.task.entity,
            dimension: (t) => t.task.dimension,
            biome: (t) => t.task.biome,
        };

        const filteredTasks = applyFilters(tasks, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Quest ID</th>
                        <th>Task ID</th>
                        <th>Type</th>
                        <th>Item ID</th>
                        <th>Count</th>
                        <th>Entity/Dim/Biome</th>
                        <th>Value</th>
                        <th>Consume Items</th>
                    </tr>
                    <tr className="filter-row">
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.questId || ''}
                                onChange={(e) => handleColumnFilter('questId', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.taskId || ''}
                                onChange={(e) => handleColumnFilter('taskId', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.type || ''}
                                onChange={(e) => handleColumnFilter('type', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.itemId || ''}
                                onChange={(e) => handleColumnFilter('itemId', e.target.value)}
                            />
                        </th>
                        <th></th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.entity || ''}
                                onChange={(e) => handleColumnFilter('entity', e.target.value)}
                            />
                        </th>
                        <th></th>
                        <th>
                            <div className="checkbox-column-actions">
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredTasks.forEach(({ qIndex, tIndex }) => {
                                            handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.consume_items`, true);
                                        });
                                    }}
                                    title="Marcar todos"
                                >
                                    ✓
                                </button>
                                <button 
                                    className="checkbox-action-btn" 
                                    onClick={() => {
                                        filteredTasks.forEach(({ qIndex, tIndex }) => {
                                            handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.consume_items`, false);
                                        });
                                    }}
                                    title="Desmarcar todos"
                                >
                                    ✗
                                </button>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTasks.map(({ quest, task, tIndex, qIndex }) => {
                        // Determine what to show in "Entity/Dim/Biome" column based on task type
                        let specialField = '';
                        let specialFieldKey = '';
                        if (task.entity) { specialField = task.entity; specialFieldKey = 'entity'; }
                        else if (task.dimension) { specialField = task.dimension; specialFieldKey = 'dimension'; }
                        else if (task.biome) { specialField = task.biome; specialFieldKey = 'biome'; }
                        else if (task.advancement) { specialField = task.advancement; specialFieldKey = 'advancement'; }
                        else if (task.structure) { specialField = task.structure; specialFieldKey = 'structure'; }
                        
                        return (
                            <tr key={`${quest.id}-${task.id}`}>
                                <td className="readonly">{quest.id}</td>
                                <td className="readonly">{task.id}</td>
                                <td className="readonly">{task.type}</td>
                                <td>
                                    {task.item && (
                                        <input
                                            type="text"
                                            value={getCellValue(`quests.${qIndex}.tasks.${tIndex}.item.id`, task.item?.id || '')}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.item.id`, e.target.value)}
                                            className="table-input"
                                            placeholder="minecraft:item"
                                        />
                                    )}
                                </td>
                                <td>
                                    {task.item && (
                                        <input
                                            type="number"
                                            value={getCellValue(`quests.${qIndex}.tasks.${tIndex}.count`, task.count?.value || task.count || 1)}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.count`, e.target.value)}
                                            className="table-input"
                                        />
                                    )}
                                </td>
                                <td>
                                    {specialFieldKey && (
                                        <input
                                            type="text"
                                            value={getCellValue(`quests.${qIndex}.tasks.${tIndex}.${specialFieldKey}`, specialField || '')}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.${specialFieldKey}`, e.target.value)}
                                            className="table-input"
                                            placeholder={specialFieldKey}
                                        />
                                    )}
                                </td>
                                <td>
                                    {task.value !== undefined && (
                                        <input
                                            type="number"
                                            value={getCellValue(`quests.${qIndex}.tasks.${tIndex}.value`, task.value?.value || task.value || 0)}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.value`, e.target.value)}
                                            className="table-input"
                                        />
                                    )}
                                </td>
                                <td>
                                    {task.type === 'item' && (
                                        <input
                                            type="checkbox"
                                            checked={getCellValue(`quests.${qIndex}.tasks.${tIndex}.consume_items`, task.consume_items) === true}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.consume_items`, e.target.checked ? true : false)}
                                        />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderRewardsTable = () => {
        const rewards = [];
        (data.quests || []).forEach(quest => {
            (quest.rewards || []).forEach((reward, rIndex) => {
                rewards.push({ quest, reward, rIndex, qIndex: data.quests.indexOf(quest) });
            });
        });

        const filterConfig = {
            questId: (r) => r.quest.id,
            rewardId: (r) => r.reward.id,
            type: (r) => r.reward.type,
            itemId: (r) => r.reward.item?.id,
            command: (r) => r.reward.command,
        };

        const filteredRewards = applyFilters(rewards, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Quest ID</th>
                        <th>Reward ID</th>
                        <th>Type</th>
                        <th>Item ID</th>
                        <th>Count/Amount</th>
                        <th>XP/XP Levels</th>
                        <th>Command</th>
                    </tr>
                    <tr className="filter-row">
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.questId || ''}
                                onChange={(e) => handleColumnFilter('questId', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.rewardId || ''}
                                onChange={(e) => handleColumnFilter('rewardId', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.type || ''}
                                onChange={(e) => handleColumnFilter('type', e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.itemId || ''}
                                onChange={(e) => handleColumnFilter('itemId', e.target.value)}
                            />
                        </th>
                        <th></th>
                        <th></th>
                        <th>
                            <input
                                type="text"
                                className="column-filter"
                                placeholder="Filter..."
                                value={columnFilters.command || ''}
                                onChange={(e) => handleColumnFilter('command', e.target.value)}
                            />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRewards.map(({ quest, reward, rIndex, qIndex }) => (
                        <tr key={`${quest.id}-${reward.id}`}>
                            <td className="readonly">{quest.id}</td>
                            <td className="readonly">{reward.id}</td>
                            <td className="readonly">{reward.type}</td>
                            <td>
                                {reward.item && (
                                    <input
                                        type="text"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.item.id`, reward.item?.id || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.item.id`, e.target.value)}
                                        className="table-input"
                                        placeholder="minecraft:item"
                                    />
                                )}
                            </td>
                            <td>
                                {reward.count !== undefined && (
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.count`, reward.count?.value || reward.count || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.count`, e.target.value)}
                                        className="table-input"
                                    />
                                )}
                                {reward.amount !== undefined && (
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.amount`, reward.amount?.value || reward.amount || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.amount`, e.target.value)}
                                        className="table-input"
                                    />
                                )}
                            </td>
                            <td>
                                {reward.xp !== undefined && (
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.xp`, reward.xp || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.xp`, e.target.value)}
                                        className="table-input"
                                    />
                                )}
                                {reward.xp_levels !== undefined && (
                                    <input
                                        type="number"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.xp_levels`, reward.xp_levels || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.xp_levels`, e.target.value)}
                                        className="table-input"
                                    />
                                )}
                            </td>
                            <td>
                                {reward.command && (
                                    <input
                                        type="text"
                                        value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.command`, reward.command || '')}
                                        onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.command`, e.target.value)}
                                        className="table-input"
                                        placeholder="/command"
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="table-view-container">
            <div className="table-controls">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'quests' ? 'active' : ''}`}
                        onClick={() => { setFilter('quests'); clearFilters(); }}
                    >
                        Quests ({data.quests?.length || 0})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'tasks' ? 'active' : ''}`}
                        onClick={() => { setFilter('tasks'); clearFilters(); }}
                    >
                        Tasks
                    </button>
                    <button
                        className={`filter-tab ${filter === 'rewards' ? 'active' : ''}`}
                        onClick={() => { setFilter('rewards'); clearFilters(); }}
                    >
                        Rewards
                    </button>
                </div>

                {hasChanges && (
                    <button className="save-changes-btn" onClick={handleSave}>
                        💾 Save Changes
                    </button>
                )}
            </div>

            <div className="table-scroll">
                {filter === 'quests' && renderQuestsTable()}
                {filter === 'tasks' && renderTasksTable()}
                {filter === 'rewards' && renderRewardsTable()}
            </div>
        </div>
    );
}

export default TableView;
