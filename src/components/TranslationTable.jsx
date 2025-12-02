import React, { useState } from 'react';
import TranslationEditor from './TranslationEditor';
import TranslationConfig from './TranslationConfig';
import { TranslationService } from '../utils/translator';

function TranslationTable({ data, onUpdate }) {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPrefix, setFilterPrefix] = useState('');
    const [showTranslationConfig, setShowTranslationConfig] = useState(false);
    const [translationService] = useState(() => new TranslationService());

    // Convert data object to grouped entries
    const entries = Object.entries(data || {}).filter(([key]) => !key.startsWith('_'));

    // Group entries by prefix.id (e.g., "quest.0000A88BB40B2149")
    const groupedEntries = entries.reduce((groups, [key, value]) => {
        const parts = key.split('.');
        if (parts.length >= 2) {
            const groupKey = `${parts[0]}.${parts[1]}`; // e.g., "quest.0000A88BB40B2149"
            const propertyName = parts.slice(2).join('.'); // e.g., "title" or "quest_desc"
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    prefix: parts[0],
                    id: parts[1],
                    groupKey: groupKey,
                    properties: {}
                };
            }
            
            if (propertyName) {
                groups[groupKey].properties[propertyName] = value;
            }
        }
        return groups;
    }, {});

    const groupedArray = Object.values(groupedEntries);

    // Filter groups based on search
    const filteredGroups = groupedArray.filter((group) => {
        const matchesSearch = searchTerm === '' || 
            group.groupKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
            Object.values(group.properties).some(val => 
                typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
            );
        
        const matchesFilter = filterPrefix === '' || group.prefix === filterPrefix;
        
        return matchesSearch && matchesFilter;
    });

    const handleEditGroup = (group) => {
        setSelectedGroup(group);
    };

    const handleUpdateGroup = (groupKey, updatedProperties) => {
        const newData = { ...data };
        
        // Update all properties for this group
        Object.entries(updatedProperties).forEach(([propName, propValue]) => {
            const fullKey = `${groupKey}.${propName}`;
            newData[fullKey] = propValue;
        });
        
        onUpdate(newData);
    };

    const handleCloseEditor = () => {
        setSelectedGroup(null);
    };

    const handleTranslateAll = async (translator, sourceLang, targetLang, onProgress) => {
        const newData = { ...data };
        let processedCount = 0;

        for (const group of groupedArray) {
            try {
                // Translate each property in the group
                for (const [propName, propValue] of Object.entries(group.properties)) {
                    if (typeof propValue === 'string') {
                        const translated = await translator.translate(propValue, sourceLang, targetLang);
                        const fullKey = `${group.groupKey}.${propName}`;
                        newData[fullKey] = translated;
                    } else if (Array.isArray(propValue)) {
                        // Translate array items
                        const translatedArray = [];
                        for (const item of propValue) {
                            const translated = await translator.translate(item, sourceLang, targetLang);
                            translatedArray.push(translated);
                        }
                        const fullKey = `${group.groupKey}.${propName}`;
                        newData[fullKey] = translatedArray;
                    }
                }
                processedCount++;
                onProgress(processedCount, groupedArray.length);
            } catch (error) {
                console.error(`Error translating group ${group.groupKey}:`, error);
            }
        }

        onUpdate(newData);
        setShowTranslationConfig(false);
        alert(`✅ Traducción completada! ${processedCount} grupos traducidos.`);
    };

    // Get unique prefixes for filtering
    const prefixes = [...new Set(groupedArray.map(g => g.prefix))].sort();

    // Get property count and preview for a group
    const getGroupPreview = (group) => {
        const propCount = Object.keys(group.properties).length;
        const firstProp = Object.entries(group.properties)[0];
        if (firstProp) {
            const [key, value] = firstProp;
            const preview = typeof value === 'string' ? value : JSON.stringify(value);
            return { propCount, preview: preview.substring(0, 100) + (preview.length > 100 ? '...' : '') };
        }
        return { propCount, preview: '' };
    };

    return (
        <div className="translation-table-container">
            <div className="translation-table-header">
                <div className="translation-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-box">
                        <select
                            value={filterPrefix}
                            onChange={(e) => setFilterPrefix(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            {prefixes.map(prefix => (
                                <option key={prefix} value={prefix}>{prefix}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className="btn-translate-all"
                        onClick={() => setShowTranslationConfig(true)}
                        title="Traducir todo el archivo automáticamente"
                    >
                        🌐 Traducir Todo
                    </button>
                    <div className="entry-count">
                        {filteredGroups.length} / {groupedArray.length} groups
                    </div>
                </div>
            </div>

            <div className="translation-table-wrapper">
                <table className="translation-table">
                    <thead>
                        <tr>
                            <th style={{ width: '35%' }}>Group Key</th>
                            <th style={{ width: '10%' }}>Properties</th>
                            <th style={{ width: '45%' }}>Preview</th>
                            <th style={{ width: '10%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-state">
                                    No translation groups found
                                </td>
                            </tr>
                        ) : (
                            filteredGroups.map((group) => {
                                const { propCount, preview } = getGroupPreview(group);
                                return (
                                    <tr key={group.groupKey}>
                                        <td className="key-cell">
                                            <code>{group.groupKey}</code>
                                            <div className="group-badge">{group.prefix}</div>
                                        </td>
                                        <td className="prop-count-cell">
                                            <span className="prop-badge">{propCount}</span>
                                        </td>
                                        <td className="value-cell">
                                            <div className="value-preview">
                                                {preview}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditGroup(group)}
                                                title="Edit translation group"
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {selectedGroup && (
                <TranslationEditor
                    group={selectedGroup}
                    onUpdate={handleUpdateGroup}
                    onClose={handleCloseEditor}
                    translationService={translationService}
                />
            )}

            {showTranslationConfig && (
                <TranslationConfig
                    onClose={() => setShowTranslationConfig(false)}
                    onTranslateAll={handleTranslateAll}
                    groupCount={groupedArray.length}
                />
            )}
        </div>
    );
}

export default TranslationTable;
