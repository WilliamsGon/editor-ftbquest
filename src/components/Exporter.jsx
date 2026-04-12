import React, { useState } from 'react';
import { SNBT } from '../utils/snbt';

function Exporter({ data, filename, currentVersion }) {
    const [targetVersion, setTargetVersion] = useState(currentVersion || '1.21.1');

    const handleExport = () => {
        try {
            if (!data) {
                alert('No data to export');
                return;
            }

            // Deep clone data to avoid mutating actual state
            const exportData = JSON.parse(JSON.stringify(data));

            // Run converter logic
            if (exportData.quests && Array.isArray(exportData.quests)) {
                exportData.quests.forEach(quest => {
                    // Tasks iteration
                    if (quest.tasks && Array.isArray(quest.tasks)) {
                        quest.tasks.forEach(task => {
                            if (task.type === 'item') {
                                if (targetVersion === '1.20.1') {
                                    if (typeof task.item === 'object' && task.item !== null) {
                                        delete task.item.components;
                                        if (task.item.Count !== undefined) {
                                            task.item.count = task.item.Count; // Normalize to lowercase count if it was uppercase
                                            delete task.item.Count;
                                        }
                                        const keys = Object.keys(task.item);
                                        if (keys.length === 1 && keys[0] === 'id') {
                                            task.item = task.item.id;
                                        } else if (keys.length === 2 && keys.includes('id') && keys.includes('count')) {
                                            task.item = task.item.id;
                                        }
                                    }
                                } else {
                                    if (typeof task.item === 'string') {
                                        task.item = { id: task.item };
                                    }
                                }
                            }
                        });
                    }

                    // Rewards iteration
                    if (quest.rewards && Array.isArray(quest.rewards)) {
                        quest.rewards.forEach(reward => {
                            if (reward.type === 'command') {
                                if (targetVersion === '1.20.1') {
                                    // Remove permission level, add elevate_perms
                                    delete reward.permission_level;
                                    reward.elevate_perms = reward.elevate_perms !== undefined ? reward.elevate_perms : true;
                                } else {
                                    // Remove elevate_perms, add permission_level
                                    delete reward.elevate_perms;
                                    reward.permission_level = reward.permission_level !== undefined ? reward.permission_level : 2;
                                }
                            }
                            if (reward.type === 'item') {
                                if (targetVersion === '1.20.1') {
                                    if (typeof reward.item === 'object' && reward.item !== null) {
                                        delete reward.item.components;
                                        const keys = Object.keys(reward.item);
                                        if (keys.length === 1 && keys[0] === 'id') {
                                            reward.item = reward.item.id;
                                        } else if (keys.length === 2 && keys.includes('id') && keys.includes('count')) {
                                            reward.item = reward.item.id;
                                        }
                                    }
                                } else {
                                    if (typeof reward.item === 'string') {
                                        reward.item = { id: reward.item };
                                    }
                                }
                            }
                        });
                    }
                });
            }

            const snbtString = SNBT.stringify(exportData);

            // Create blob with explicit UTF-8 encoding
            const blob = new Blob([snbtString], { type: 'text/plain;charset=utf-8' });

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = filename || 'export.snbt';

            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

        } catch (e) {
            console.error('Export error:', e);
            alert("Error exporting: " + e.message + "\n\nCheck console for details.");
        }
    };

    return (
        <div className="exporter" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
                value={targetVersion} 
                onChange={e => setTargetVersion(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '4px', background: '#2c2c2c', color: 'white', border: '1px solid #444' }}
            >
                <option value="1.21.1">Export Format: Minecraft 1.21+</option>
                <option value="1.20.1">Export Format: Minecraft 1.20-</option>
            </select>
            <button className="btn" onClick={handleExport}>
                Export SNBT
            </button>
        </div>
    );
}

export default Exporter;
