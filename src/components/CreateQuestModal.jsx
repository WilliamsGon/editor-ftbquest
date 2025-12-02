import React, { useState } from 'react';
import { generateQuestId, generateTaskId, suggestQuestPosition, getAllExistingIds, createDefaultQuest, createDefaultTask, createDefaultReward } from '../utils/idGenerator';
import { TASK_TYPES, REWARD_TYPES } from '../utils/questTypes';

function CreateQuestModal({ data, onClose, onCreate }) {
    const [step, setStep] = useState(1); // 1: Quest basics, 2: Add tasks, 3: Add rewards
    const [newQuest, setNewQuest] = useState(null);
    const [taskType, setTaskType] = useState(TASK_TYPES.ITEM);
    const [rewardType, setRewardType] = useState(REWARD_TYPES.XP);

    const initializeQuest = () => {
        const existingIds = getAllExistingIds(data);
        const questId = generateQuestId(existingIds);
        const position = suggestQuestPosition(data.quests);
        
        const quest = createDefaultQuest(position, questId);
        setNewQuest(quest);
        setStep(2);
    };

    const handleAddTask = () => {
        const existingIds = getAllExistingIds(data);
        const taskId = generateTaskId(existingIds);
        const newTask = createDefaultTask(taskType, taskId);
        
        setNewQuest({
            ...newQuest,
            tasks: [...(newQuest.tasks || []), newTask]
        });
    };

    const handleRemoveTask = (index) => {
        const tasks = [...newQuest.tasks];
        tasks.splice(index, 1);
        setNewQuest({ ...newQuest, tasks });
    };

    const handleAddReward = () => {
        const existingIds = getAllExistingIds(data);
        const rewardId = generateTaskId(existingIds);
        const newReward = createDefaultReward(rewardType, rewardId);
        
        setNewQuest({
            ...newQuest,
            rewards: [...(newQuest.rewards || []), newReward]
        });
    };

    const handleRemoveReward = (index) => {
        const rewards = [...newQuest.rewards];
        rewards.splice(index, 1);
        setNewQuest({ ...newQuest, rewards });
    };

    const handleQuestFieldChange = (field, value) => {
        setNewQuest({ ...newQuest, [field]: value });
    };

    const handleCreate = () => {
        if (newQuest && newQuest.tasks.length > 0) {
            onCreate(newQuest);
            onClose();
        } else {
            alert('La quest debe tener al menos una task');
        }
    };

    return (
        <div className="quest-editor-overlay" onClick={(e) => {
            if (e.target.className === 'quest-editor-overlay') {
                onClose();
            }
        }}>
            <div className="quest-editor create-quest-modal">
                <div className="editor-header">
                    <h2>Crear Nueva Quest</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="editor-content-scroll">
                    {step === 1 && (
                        <div className="tab-pane">
                            <div className="create-quest-intro">
                                <h3>¿Deseas crear una nueva quest?</h3>
                                <p>Se generará automáticamente:</p>
                                <ul>
                                    <li>ID único para la quest</li>
                                    <li>Posición sugerida (X, Y)</li>
                                    <li>Valores predeterminados</li>
                                </ul>
                                <button className="btn btn-primary" onClick={initializeQuest}>
                                    Comenzar
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && newQuest && (
                        <div className="tab-pane">
                            <h3>Configurar Quest</h3>
                            
                            <div className="form-group">
                                <label>ID</label>
                                <input type="text" value={newQuest.id} readOnly disabled />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>X Position</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={newQuest.x}
                                        onChange={(e) => handleQuestFieldChange('x', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Y Position</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={newQuest.y}
                                        onChange={(e) => handleQuestFieldChange('y', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Icon Item ID</label>
                                <input
                                    type="text"
                                    value={newQuest.icon?.id || ''}
                                    onChange={(e) => handleQuestFieldChange('icon', { id: e.target.value })}
                                    placeholder="minecraft:stone"
                                />
                            </div>

                            <div className="form-group">
                                <label>Shape</label>
                                <select
                                    value={newQuest.shape || 'default'}
                                    onChange={(e) => handleQuestFieldChange('shape', e.target.value)}
                                >
                                    <option value="default">Default</option>
                                    <option value="circle">Circle</option>
                                    <option value="square">Square</option>
                                    <option value="diamond">Diamond</option>
                                    <option value="rsquare">Rounded Square</option>
                                    <option value="pentagon">Pentagon</option>
                                    <option value="hexagon">Hexagon</option>
                                    <option value="octagon">Octagon</option>
                                    <option value="heart">Heart</option>
                                    <option value="gear">Gear</option>
                                </select>
                            </div>

                            <hr />

                            <h3>Tasks</h3>
                            <div className="add-item-section">
                                <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                                    <option value={TASK_TYPES.ITEM}>Item</option>
                                    <option value={TASK_TYPES.CHECKMARK}>Checkmark</option>
                                    <option value={TASK_TYPES.KILL}>Kill</option>
                                    <option value={TASK_TYPES.DIMENSION}>Dimension</option>
                                    <option value={TASK_TYPES.BIOME}>Biome</option>
                                    <option value={TASK_TYPES.ADVANCEMENT}>Advancement</option>
                                    <option value={TASK_TYPES.STRUCTURE}>Structure</option>
                                    <option value={TASK_TYPES.LOCATION}>Location</option>
                                    <option value={TASK_TYPES.XP}>XP</option>
                                    <option value={TASK_TYPES.OBSERVATION}>Observation</option>
                                </select>
                                <button className="btn" onClick={handleAddTask}>
                                    + Agregar Task
                                </button>
                            </div>

                            {newQuest.tasks && newQuest.tasks.length > 0 && (
                                <div className="items-list">
                                    {newQuest.tasks.map((task, index) => (
                                        <div key={index} className="item-preview">
                                            <span>{task.type}</span>
                                            <button className="btn-remove" onClick={() => handleRemoveTask(index)}>
                                                ✗
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="btn" onClick={() => setStep(3)}>
                                    Siguiente: Agregar Rewards
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && newQuest && (
                        <div className="tab-pane">
                            <h3>Agregar Rewards (Opcional)</h3>

                            <div className="add-item-section">
                                <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}>
                                    <option value={REWARD_TYPES.ITEM}>Item</option>
                                    <option value={REWARD_TYPES.XP}>XP</option>
                                    <option value={REWARD_TYPES.XP_LEVELS}>XP Levels</option>
                                    <option value={REWARD_TYPES.COMMAND}>Command</option>
                                    <option value={REWARD_TYPES.CHOICE}>Choice</option>
                                    <option value={REWARD_TYPES.LOOT}>Loot</option>
                                    <option value={REWARD_TYPES.RANDOM}>Random</option>
                                    <option value={REWARD_TYPES.TOAST}>Toast</option>
                                </select>
                                <button className="btn" onClick={handleAddReward}>
                                    + Agregar Reward
                                </button>
                            </div>

                            {newQuest.rewards && newQuest.rewards.length > 0 && (
                                <div className="items-list">
                                    {newQuest.rewards.map((reward, index) => (
                                        <div key={index} className="item-preview">
                                            <span>{reward.type}</span>
                                            <button className="btn-remove" onClick={() => handleRemoveReward(index)}>
                                                ✗
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="btn" onClick={() => setStep(2)}>
                                    ← Volver
                                </button>
                                <button className="btn btn-primary" onClick={handleCreate}>
                                    Crear Quest
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateQuestModal;
