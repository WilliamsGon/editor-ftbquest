
import React, { useState } from 'react';

function QuestList({ quests, onSelect, exportButton, onCreateQuest }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuests = quests.filter(q => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        // Search by ID or by item in tasks
        if (q.id && q.id.toLowerCase().includes(searchLower)) return true;
        if (q.tasks) {
            return q.tasks.some(t => {
                const tItemId = typeof t.item === 'string' ? t.item : t.item?.id;
                return (t.id && t.id.toLowerCase().includes(searchLower)) ||
                       (tItemId && tItemId.toLowerCase().includes(searchLower));
            });
        }
        return false;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search quests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    {onCreateQuest && (
                        <button className="btn btn-create" onClick={onCreateQuest}>
                            + Nueva Quest
                        </button>
                    )}
                    {exportButton}
                </div>
            </div>

            <div className="quest-grid">
                {filteredQuests.map(quest => {
                    // Try to find a meaningful label
                    let label = quest.id;
                    let subLabel = '';

                    if (quest.tasks && quest.tasks.length > 0) {
                        const task = quest.tasks[0];
                        const itemId = typeof task.item === 'string' ? task.item : task.item?.id;
                        if (itemId) {
                            const count = task.count ? (task.count.value || task.count) : 1;
                            if (itemId === 'ftbfiltersystem:smart_filter' && task.item?.tag?.["ftbfiltersystem:filter"]) {
                                const filterStr = task.item.tag["ftbfiltersystem:filter"].replace('ftbfiltersystem:item_tag(', '').replace(')', '');
                                label = `${count}x Filter: ${filterStr}`;
                            } else {
                                const itemName = itemId.split(':').pop().replace(/_/g, ' ');
                                label = `${count}x ${itemName}`;
                            }
                            subLabel = quest.id;
                        }
                    }

                    const taskCount = quest.tasks ? quest.tasks.length : 0;
                    const rewardCount = quest.rewards ? quest.rewards.length : 0;

                    return (
                        <div
                            key={quest.id}
                            className="quest-card"
                            onClick={() => onSelect(quest.id)}
                        >
                            <div className="quest-card-title">{label}</div>
                            {subLabel && <div className="quest-card-subtitle">{subLabel}</div>}

                            <div className="quest-card-stats">
                                <div className="stat-item">
                                    <span className="stat-icon">📝</span> {taskCount} Tasks
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">🎁</span> {rewardCount} Rewards
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default QuestList;
