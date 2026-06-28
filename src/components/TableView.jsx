import React, { useState } from 'react';

const ResizableHeader = ({ children }) => {
    const [width, setWidth] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    
    const startResize = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const th = e.target.parentElement;
        const startWidth = th.getBoundingClientRect().width;
        setIsResizing(true);
        
        const onMouseMove = (moveEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
            setWidth(newWidth);
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setIsResizing(false);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <th style={{ width: width ? `${width}px` : 'auto', minWidth: width ? `${width}px` : 'auto', position: 'relative' }}>
            {children}
            <div 
                onMouseDown={startResize}
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    cursor: 'col-resize',
                    zIndex: 1,
                    backgroundColor: isResizing ? 'rgba(0, 210, 255, 0.5)' : 'transparent',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => !isResizing && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
                onMouseLeave={(e) => !isResizing && (e.target.style.backgroundColor = 'transparent')}
            />
        </th>
    );
};

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

    const formatSingleTask = (task) => {
        if (!task) return null;
        let label = task.type;
        if (task.type === 'item') {
            const itemId = typeof task.item === 'string' ? task.item : (task.item?.id || '');
            label += ':' + itemId.replace('minecraft:', '');
            if (task.count && (task.count.value > 1 || task.count > 1)) {
                label += ` x${task.count.value || task.count}`;
            }
        } else if (task.type === 'kill') {
            const entity = (task.entity || '').replace('minecraft:', '');
            label += ':' + entity;
            if (task.value && (task.value.value > 1 || task.value > 1)) {
                label += ` x${task.value.value || task.value}`;
            }
        }
        return { type: task.type, label, original: task };
    };

    const getQuestTasksSummary = (quest, allQuests) => {
        const hasOnlyCheckmarks = !quest.tasks || quest.tasks.length === 0 || quest.tasks.every(t => t.type === 'checkmark');
        
        if (hasOnlyCheckmarks && quest.dependencies && quest.dependencies.length > 0) {
            // It's a dependent quest, get tasks from dependencies (1st level)
            const badges = [];
            quest.dependencies.forEach(depId => {
                const depIdStr = typeof depId === 'string' ? depId.replace(/['"]/g, '') : depId;
                const depQuest = allQuests.find(q => q.id === depIdStr);
                if (depQuest && depQuest.tasks) {
                    depQuest.tasks.forEach(t => {
                        if (t.type !== 'checkmark') {
                            const formatted = formatSingleTask(t);
                            if (formatted) {
                                badges.push({ ...formatted, isDep: true });
                            }
                        }
                    });
                }
            });
            if (badges.length > 0) return badges;
            return [{ type: 'checkmark', label: 'checkmark' }];
        } else {
            // Normal quest tasks
            if (!quest.tasks || quest.tasks.length === 0) return [];
            return quest.tasks.map(t => formatSingleTask(t)).filter(Boolean);
        }
    };

    const renderQuestsTable = () => {
        const quests = data.quests || [];

        const filterConfig = {
            id: (q) => q.id,
            x: (q) => q.x?.value || q.x,
            y: (q) => q.y?.value || q.y,
            shape: (q) => q.shape,
            size: (q) => q.size?.value || q.size,
            icon: (q) => typeof q.icon === 'string' ? q.icon : q.icon?.id,
        };

        const filteredQuests = applyFilters(quests, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <ResizableHeader>ID</ResizableHeader>
                        <ResizableHeader>X</ResizableHeader>
                        <ResizableHeader>Y</ResizableHeader>
                        <ResizableHeader>Shape</ResizableHeader>
                        <ResizableHeader>Size</ResizableHeader>
                        <ResizableHeader>Icon</ResizableHeader>
                        <ResizableHeader>Hide Dep Lines</ResizableHeader>
                        <ResizableHeader>Hide Until Complete</ResizableHeader>
                        <ResizableHeader>Tasks</ResizableHeader>
                        <ResizableHeader>Rewards</ResizableHeader>
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
                                        value={getCellValue(typeof quest.icon === 'string' ? `quests.${originalIndex}.icon` : `quests.${originalIndex}.icon.id`, typeof quest.icon === 'string' ? quest.icon : (quest.icon?.id || ''))}
                                        onChange={(e) => handleCellEdit(typeof quest.icon === 'string' ? `quests.${originalIndex}.icon` : `quests.${originalIndex}.icon.id`, e.target.value)}
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
            itemId: (t) => {
                if (typeof t.task.item === 'object' && t.task.item?.id === 'ftbfiltersystem:smart_filter') {
                    return t.task.item?.tag?.["ftbfiltersystem:filter"];
                }
                return typeof t.task.item === 'string' ? t.task.item : t.task.item?.id;
            },
            entity: (t) => t.task.entity,
            dimension: (t) => t.task.dimension,
            biome: (t) => t.task.biome,
        };

        const filteredTasks = applyFilters(tasks, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <ResizableHeader>Quest ID</ResizableHeader>
                        <ResizableHeader>Task ID</ResizableHeader>
                        <ResizableHeader>Type</ResizableHeader>
                        <ResizableHeader>Item ID</ResizableHeader>
                        <ResizableHeader>Set as Quest Icon</ResizableHeader>
                        <ResizableHeader>Count</ResizableHeader>
                        <ResizableHeader>Entity/Dim/Biome</ResizableHeader>
                        <ResizableHeader>Value</ResizableHeader>
                        <ResizableHeader>Consume Items</ResizableHeader>
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
                                <td className="readonly"><span className={`task-badge type-${task.type}`}>{task.type}</span></td>
                                <td>
                                    {task.item && (
                                        typeof task.item === 'object' && task.item?.id === 'ftbfiltersystem:smart_filter' ? (
                                            <input
                                                type="text"
                                                value={getCellValue(`quests.${qIndex}.tasks.${tIndex}.item.tag.ftbfiltersystem:filter`, task.item?.tag?.["ftbfiltersystem:filter"] || '')}
                                                onChange={(e) => handleCellEdit(`quests.${qIndex}.tasks.${tIndex}.item.tag.ftbfiltersystem:filter`, e.target.value)}
                                                className="table-input filter-input"
                                                title="Smart Filter Tag"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={getCellValue(typeof task.item === 'string' ? `quests.${qIndex}.tasks.${tIndex}.item` : `quests.${qIndex}.tasks.${tIndex}.item.id`, typeof task.item === 'string' ? task.item : (task.item?.id || ''))}
                                                onChange={(e) => handleCellEdit(typeof task.item === 'string' ? `quests.${qIndex}.tasks.${tIndex}.item` : `quests.${qIndex}.tasks.${tIndex}.item.id`, e.target.value)}
                                                className="table-input"
                                                placeholder="minecraft:item"
                                            />
                                        )
                                    )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {(task.item || task.icon) && (
                                        <button 
                                            className="checkbox-action-btn"
                                            title="Set as Quest Icon"
                                            onClick={() => handleCellEdit(`quests.${qIndex}.icon`, task.icon || task.item)}
                                        >
                                            🖼️
                                        </button>
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
            questTasks: (r) => {
                const summary = getQuestTasksSummary(r.quest, data.quests || []);
                return summary.map(t => t.label).join(' ');
            },
            rewardId: (r) => r.reward.id,
            type: (r) => r.reward.type,
            itemId: (r) => {
                if (typeof r.reward.item === 'object' && r.reward.item?.id === 'ftbfiltersystem:smart_filter') {
                    return r.reward.item?.tag?.["ftbfiltersystem:filter"];
                }
                return typeof r.reward.item === 'string' ? r.reward.item : r.reward.item?.id;
            },
            command: (r) => r.reward.command,
        };

        const filteredRewards = applyFilters(rewards, filterConfig);

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        <ResizableHeader>Quest ID</ResizableHeader>
                        <ResizableHeader>Quest Tasks</ResizableHeader>
                        <ResizableHeader>Reward ID</ResizableHeader>
                        <ResizableHeader>Type</ResizableHeader>
                        <ResizableHeader>Item ID</ResizableHeader>
                        <ResizableHeader>Set as Quest Icon</ResizableHeader>
                        <ResizableHeader>Count/Amount</ResizableHeader>
                        <ResizableHeader>XP/XP Levels</ResizableHeader>
                        <ResizableHeader>Command</ResizableHeader>
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
                                value={columnFilters.questTasks || ''}
                                onChange={(e) => handleColumnFilter('questTasks', e.target.value)}
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
                    {filteredRewards.map(({ quest, reward, rIndex, qIndex }) => {
                        const tasksSummary = getQuestTasksSummary(quest, data.quests || []);
                        return (
                        <tr key={`${quest.id}-${reward.id}`}>
                            <td className="readonly">{quest.id}</td>
                            <td>
                                <div className="task-badges-container">
                                    {tasksSummary.slice(0, 3).map((t, idx) => (
                                        <span key={idx} className={`task-badge type-${t.type} ${t.isDep ? 'is-dep' : ''}`} title={t.label}>
                                            {t.isDep && <span className="task-badge-prefix">[Dep]</span>}
                                            {t.label}
                                        </span>
                                    ))}
                                    {tasksSummary.length > 3 && (
                                        <span className="task-badge" title={tasksSummary.slice(3).map(t => t.label).join(', ')}>
                                            +{tasksSummary.length - 3} más
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="readonly">{reward.id}</td>
                            <td className="readonly"><span className={`task-badge type-${reward.type}`}>{reward.type}</span></td>
                            <td>
                                {reward.item && (
                                    typeof reward.item === 'object' && reward.item?.id === 'ftbfiltersystem:smart_filter' ? (
                                        <input
                                            type="text"
                                            value={getCellValue(`quests.${qIndex}.rewards.${rIndex}.item.tag.ftbfiltersystem:filter`, reward.item?.tag?.["ftbfiltersystem:filter"] || '')}
                                            onChange={(e) => handleCellEdit(`quests.${qIndex}.rewards.${rIndex}.item.tag.ftbfiltersystem:filter`, e.target.value)}
                                            className="table-input filter-input"
                                            title="Smart Filter Tag"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={getCellValue(typeof reward.item === 'string' ? `quests.${qIndex}.rewards.${rIndex}.item` : `quests.${qIndex}.rewards.${rIndex}.item.id`, typeof reward.item === 'string' ? reward.item : (reward.item?.id || ''))}
                                            onChange={(e) => handleCellEdit(typeof reward.item === 'string' ? `quests.${qIndex}.rewards.${rIndex}.item` : `quests.${qIndex}.rewards.${rIndex}.item.id`, e.target.value)}
                                            className="table-input"
                                            placeholder="minecraft:item"
                                        />
                                    )
                                )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {(reward.item || reward.icon) && (
                                    <button 
                                        className="checkbox-action-btn"
                                        title="Set as Quest Icon"
                                        onClick={() => handleCellEdit(`quests.${qIndex}.icon`, reward.icon || reward.item)}
                                    >
                                        🖼️
                                    </button>
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
                        );
                    })}
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
