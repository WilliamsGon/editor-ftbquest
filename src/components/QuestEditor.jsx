
import React, { useState, useEffect } from 'react';
import { TaskFields, RewardFields } from './DynamicFields';

function QuestEditor({ quest, onUpdate, onClose, snbtVersion }) {
    const [editedQuest, setEditedQuest] = useState(quest);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        setEditedQuest(quest);
    }, [quest]);

    const handleChange = (field, value) => {
        const updated = { ...editedQuest, [field]: value };
        setEditedQuest(updated);
        onUpdate(updated);
    };

    const handleNestedChange = (parent, field, value) => {
        const parentObj = editedQuest[parent] || {};
        const updatedParent = { ...parentObj, [field]: value };
        const updated = { ...editedQuest, [parent]: updatedParent };
        setEditedQuest(updated);
        onUpdate(updated);
    };

    const handleArrayItemChange = (arrayName, index, field, value) => {
        const newArray = [...(editedQuest[arrayName] || [])];
        newArray[index] = { ...newArray[index], [field]: value };
        const updated = { ...editedQuest, [arrayName]: newArray };
        setEditedQuest(updated);
        onUpdate(updated);
    };

    const handleTaskItemCountChange = (taskIndex, value) => {
        const newTasks = [...(editedQuest.tasks || [])];
        const task = newTasks[taskIndex];

        let newCount = value;
        if (task.count && typeof task.count === 'object' && task.count._snbt_number) {
            newCount = { ...task.count, value: Number(value) };
        } else {
            newCount = Number(value);
        }

        newTasks[taskIndex] = { ...task, count: newCount };
        const updated = { ...editedQuest, tasks: newTasks };
        setEditedQuest(updated);
        onUpdate(updated);
    };

    const handleRewardCountChange = (rewardIndex, value) => {
        const newRewards = [...(editedQuest.rewards || [])];
        const reward = newRewards[rewardIndex];

        let newCount = value;
        // Check if reward has count (some do, some don't)
        if (reward.count !== undefined) {
            if (typeof reward.count === 'object' && reward.count._snbt_number) {
                newCount = { ...reward.count, value: Number(value) };
            } else {
                newCount = Number(value);
            }
            newRewards[rewardIndex] = { ...reward, count: newCount };
            const updated = { ...editedQuest, rewards: newRewards };
            setEditedQuest(updated);
            onUpdate(updated);
        }
    };

    if (!editedQuest) {
        return (
            <div className="quest-editor">
                <div className="placeholder">Error: Quest data not found.</div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'settings', label: 'Settings' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'rewards', label: 'Rewards' },
    ];

    return (
        <div className="quest-editor-overlay" onClick={(e) => {
            if (e.target.className === 'quest-editor-overlay') {
                onClose();
            }
        }}>
            <div className="quest-editor">
                <div className="editor-header">
                    <h2>{editedQuest.id}</h2>
                    <div className="tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="editor-content-scroll">
                    <div className="tab-content">
                        {activeTab === 'general' && (
                            <div className="tab-pane">
                                <div className="form-group">
                                    <label>ID</label>
                                    <input type="text" value={editedQuest.id} readOnly disabled />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>X Position</label>
                                        <input
                                            type="text"
                                            value={editedQuest.x && typeof editedQuest.x === 'object' ? editedQuest.x.value : editedQuest.x}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                let newVal = val;
                                                if (editedQuest.x && typeof editedQuest.x === 'object') {
                                                    newVal = { ...editedQuest.x, value: Number(val) };
                                                } else {
                                                    newVal = Number(val);
                                                }
                                                handleChange('x', newVal);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Y Position</label>
                                        <input
                                            type="text"
                                            value={editedQuest.y && typeof editedQuest.y === 'object' ? editedQuest.y.value : editedQuest.y}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                let newVal = val;
                                                if (editedQuest.y && typeof editedQuest.y === 'object') {
                                                    newVal = { ...editedQuest.y, value: Number(val) };
                                                } else {
                                                    newVal = Number(val);
                                                }
                                                handleChange('y', newVal);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Shape</label>
                                        <input
                                            type="text"
                                            value={editedQuest.shape || ''}
                                            onChange={(e) => handleChange('shape', e.target.value)}
                                            placeholder="default"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Size</label>
                                        <input
                                            type="text"
                                            value={editedQuest.size && typeof editedQuest.size === 'object' ? editedQuest.size.value : (editedQuest.size || '')}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (!val) {
                                                    handleChange('size', undefined);
                                                    return;
                                                }
                                                let newVal = val;
                                                if (editedQuest.size && typeof editedQuest.size === 'object') {
                                                    newVal = { ...editedQuest.size, value: Number(val) };
                                                } else {
                                                    newVal = Number(val);
                                                }
                                                handleChange('size', newVal);
                                            }}
                                            placeholder="1.0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Icon Item ID</label>
                                    <input
                                        type="text"
                                        value={typeof editedQuest.icon === 'string' ? editedQuest.icon : (editedQuest.icon?.id || '')}
                                        onChange={(e) => {
                                            if (editedQuest.icon && typeof editedQuest.icon === 'object') {
                                                handleNestedChange('icon', 'id', e.target.value);
                                            } else {
                                                handleChange('icon', e.target.value);
                                            }
                                        }}
                                        placeholder="minecraft:stone"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="tab-pane">
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editedQuest.hide_dependency_lines === true}
                                            onChange={(e) => handleChange('hide_dependency_lines', e.target.checked ? true : false)}
                                        />
                                        Hide Dependency Lines
                                    </label>
                                </div>
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editedQuest.hide_until_deps_complete === true}
                                            onChange={(e) => handleChange('hide_until_deps_complete', e.target.checked ? true : false)}
                                        />
                                        Hide Until Dependencies Complete
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>Dependencies (Comma separated IDs)</label>
                                    <textarea
                                        rows="3"
                                        value={(editedQuest.dependencies || []).join(', ')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const deps = val.split(',').map(s => s.trim()).filter(s => s);
                                            handleChange('dependencies', deps);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="tab-pane">
                                {(!editedQuest.tasks || editedQuest.tasks.length === 0) && <p>No tasks.</p>}
                                {editedQuest.tasks && editedQuest.tasks.map((task, index) => (
                                    <div key={index} className="card">
                                        <div className="card-header">Task {index + 1}: {task.type}</div>
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label>ID</label>
                                                <input type="text" value={task.id || ''} readOnly disabled />
                                            </div>
                                            <div className="form-group">
                                                <label>Type</label>
                                                <input type="text" value={task.type || ''} readOnly disabled />
                                            </div>
                                            <TaskFields 
                                                task={task}
                                                index={index}
                                                onFieldChange={(field, value) => handleArrayItemChange('tasks', index, field, value)}
                                                onSetAsIcon={() => handleChange('icon', task.icon || task.item)}
                                                snbtVersion={snbtVersion}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'rewards' && (
                            <div className="tab-pane">
                                {(!editedQuest.rewards || editedQuest.rewards.length === 0) && <p>No rewards.</p>}
                                {editedQuest.rewards && editedQuest.rewards.map((reward, index) => (
                                    <div key={index} className="card">
                                        <div className="card-header">Reward {index + 1}: {reward.type}</div>
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label>ID</label>
                                                <input type="text" value={reward.id || ''} readOnly disabled />
                                            </div>
                                            <div className="form-group">
                                                <label>Type</label>
                                                <input type="text" value={reward.type || ''} readOnly disabled />
                                            </div>
                                            <RewardFields 
                                                reward={reward}
                                                index={index}
                                                onFieldChange={(field, value) => handleArrayItemChange('rewards', index, field, value)}
                                                onSetAsIcon={() => handleChange('icon', reward.icon || reward.item)}
                                                snbtVersion={snbtVersion}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestEditor;
