export function detectSnbtVersion(data) {
    if (!data || !data.quests || !Array.isArray(data.quests)) {
        return '1.21.1'; // Default
    }

    let has120Indicators = false;
    let has121Indicators = false;

    // Iterate through quests to find defining characteristics
    for (const quest of data.quests) {
        // Inspect Tasks
        if (quest.tasks && Array.isArray(quest.tasks)) {
            for (const task of quest.tasks) {
                if (task.type === 'item') {
                    // Primitive string for item implies 1.20
                    if (typeof task.item === 'string') {
                        has120Indicators = true;
                    } 
                    // Lowercase count in object could imply newer, but capital Count implies 1.20 NBT
                    else if (task.item && typeof task.item === 'object') {
                        if ('Count' in task.item) {
                            has120Indicators = true;
                        }
                        if ('components' in task.item) {
                            has121Indicators = true;
                        }
                    }
                }
            }
        }

        // Inspect Rewards
        if (quest.rewards && Array.isArray(quest.rewards)) {
            for (const reward of quest.rewards) {
                if (reward.type === 'command') {
                    if ('elevate_perms' in reward) {
                        has120Indicators = true;
                    }
                    if ('permission_level' in reward) {
                        has121Indicators = true;
                    }
                }
            }
        }
    }

    if (has120Indicators && !has121Indicators) return '1.20.1';
    if (has121Indicators && !has120Indicators) return '1.21.1';

    // If ambiguous or no definitive indicators, default to 1.21.1
    return has120Indicators ? '1.20.1' : '1.21.1';
}
