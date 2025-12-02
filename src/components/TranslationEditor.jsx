import React, { useState, useRef, useEffect } from 'react';
import { SNBT } from '../utils/snbt';
import { LANGUAGES } from '../utils/translator';

function TranslationEditor({ group, onUpdate, onClose, translationService }) {
    // Initialize edited properties from group
    const [editedProperties, setEditedProperties] = useState({});
    const [activeTab, setActiveTab] = useState('');
    const textareaRefs = useRef({});
    const [isTranslating, setIsTranslating] = useState({});
    const [showQuickTranslate, setShowQuickTranslate] = useState({});
    const [quickTranslateLangs, setQuickTranslateLangs] = useState({ source: 'en', target: 'es' });

    useEffect(() => {
        if (group && group.properties) {
            // Convert array properties to string format for editing
            const initialProps = {};
            Object.entries(group.properties).forEach(([key, value]) => {
                initialProps[key] = Array.isArray(value) 
                    ? value.join('\n')
                    : typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : value || '';
            });
            setEditedProperties(initialProps);
            
            // Set first property as active tab
            const firstProp = Object.keys(group.properties)[0];
            if (firstProp) {
                setActiveTab(firstProp);
            }
        }
    }, [group]);

    // Minecraft color codes
    const minecraftColors = [
        { code: '&0', name: 'Black', color: '#000000' },
        { code: '&1', name: 'Dark Blue', color: '#0000AA' },
        { code: '&2', name: 'Dark Green', color: '#00AA00' },
        { code: '&3', name: 'Dark Aqua', color: '#00AAAA' },
        { code: '&4', name: 'Dark Red', color: '#AA0000' },
        { code: '&5', name: 'Dark Purple', color: '#AA00AA' },
        { code: '&6', name: 'Gold', color: '#FFAA00' },
        { code: '&7', name: 'Gray', color: '#AAAAAA' },
        { code: '&8', name: 'Dark Gray', color: '#555555' },
        { code: '&9', name: 'Blue', color: '#5555FF' },
        { code: '&a', name: 'Green', color: '#55FF55' },
        { code: '&b', name: 'Aqua', color: '#55FFFF' },
        { code: '&c', name: 'Red', color: '#FF5555' },
        { code: '&d', name: 'Light Purple', color: '#FF55FF' },
        { code: '&e', name: 'Yellow', color: '#FFFF55' },
        { code: '&f', name: 'White', color: '#FFFFFF' },
    ];

    const minecraftFormats = [
        { code: '&l', name: 'Bold', style: 'bold' },
        { code: '&o', name: 'Italic', style: 'italic' },
        { code: '&n', name: 'Underline', style: 'underline' },
        { code: '&m', name: 'Strikethrough', style: 'strikethrough' },
        { code: '&r', name: 'Reset', style: 'reset' },
    ];

    const handleColorInsert = (colorCode, propertyName) => {
        const textarea = textareaRefs.current[propertyName];
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = editedProperties[propertyName] || '';
        const newValue = currentValue.substring(0, start) + colorCode + currentValue.substring(end);
        
        setEditedProperties(prev => ({
            ...prev,
            [propertyName]: newValue
        }));
        
        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + colorCode.length, start + colorCode.length);
        }, 0);
    };

    const handlePropertyChange = (propertyName, value) => {
        setEditedProperties(prev => ({
            ...prev,
            [propertyName]: value
        }));
    };

    const handleQuickTranslate = async (propertyName) => {
        if (!translationService) {
            alert('Servicio de traducción no disponible');
            return;
        }

        const currentValue = editedProperties[propertyName] || '';
        if (!currentValue.trim()) {
            alert('No hay texto para traducir');
            return;
        }

        setIsTranslating(prev => ({ ...prev, [propertyName]: true }));

        try {
            const { source, target } = quickTranslateLangs;
            const translated = await translationService.translate(currentValue, source, target);
            
            setEditedProperties(prev => ({
                ...prev,
                [propertyName]: translated
            }));

            setShowQuickTranslate(prev => ({ ...prev, [propertyName]: false }));
        } catch (error) {
            alert(`Error al traducir: ${error.message}`);
        } finally {
            setIsTranslating(prev => ({ ...prev, [propertyName]: false }));
        }
    };

    const toggleQuickTranslate = (propertyName) => {
        setShowQuickTranslate(prev => ({
            ...prev,
            [propertyName]: !prev[propertyName]
        }));
    };

    const renderPreview = (text) => {
        const parts = (text || '').split(/(&[0-9a-flmnor])/g);
        let currentColor = '#FFFFFF';
        let currentStyles = [];
        const elements = [];

        parts.forEach((part, index) => {
            if (part.startsWith('&')) {
                const colorMatch = minecraftColors.find(c => c.code === part);
                const formatMatch = minecraftFormats.find(f => f.code === part);
                
                if (colorMatch) {
                    currentColor = colorMatch.color;
                } else if (formatMatch) {
                    if (formatMatch.style === 'reset') {
                        currentColor = '#FFFFFF';
                        currentStyles = [];
                    } else {
                        currentStyles.push(formatMatch.style);
                    }
                }
            } else if (part) {
                // Split by \n to handle line breaks
                const lines = part.split('\\n');
                
                lines.forEach((line, lineIndex) => {
                    const style = {
                        color: currentColor,
                        fontWeight: currentStyles.includes('bold') ? 'bold' : 'normal',
                        fontStyle: currentStyles.includes('italic') ? 'italic' : 'normal',
                        textDecoration: [
                            currentStyles.includes('underline') ? 'underline' : '',
                            currentStyles.includes('strikethrough') ? 'line-through' : ''
                        ].filter(Boolean).join(' ') || 'none'
                    };
                    
                    elements.push(<span key={`${index}-${lineIndex}`} style={style}>{line}</span>);
                    
                    // Add line break if not the last line
                    if (lineIndex < lines.length - 1) {
                        elements.push(<br key={`${index}-${lineIndex}-br`} />);
                    }
                });
            }
        });

        return elements;
    };

    const handleSave = () => {
        // Convert edited properties back to their original format
        const finalProperties = {};
        
        Object.entries(editedProperties).forEach(([key, value]) => {
            const originalValue = group.properties[key];
            
            if (Array.isArray(originalValue)) {
                // Convert back to array format
                finalProperties[key] = value.split('\n').filter(line => line.trim() !== '');
            } else {
                finalProperties[key] = value;
            }
        });
        
        onUpdate(group.groupKey, finalProperties);
        onClose();
    };

    if (!group) return null;

    const propertyNames = Object.keys(editedProperties);

    return (
        <div className="quest-editor-overlay" onClick={(e) => {
            if (e.target.className === 'quest-editor-overlay') {
                onClose();
            }
        }}>
            <div className="quest-editor translation-editor-modal translation-group-editor" onClick={(e) => e.stopPropagation()}>
                <div className="editor-header">
                    <h2>🌐 Edit Translation Group</h2>
                    <div className="group-info">
                        <span className="group-key-badge">{group.groupKey}</span>
                        <span className="group-prefix-badge">{group.prefix}</span>
                    </div>
                </div>

                <div className="translation-tabs">
                    {propertyNames.map(propName => (
                        <button
                            key={propName}
                            className={`tab-btn ${activeTab === propName ? 'active' : ''}`}
                            onClick={() => setActiveTab(propName)}
                        >
                            {propName}
                        </button>
                    ))}
                </div>

                <div className="editor-content-scroll">
                    <div className="translation-fields">
                        {propertyNames.map(propName => (
                            <div 
                                key={propName}
                                className={`form-field tab-content ${activeTab === propName ? 'active' : ''}`}
                                style={{ display: activeTab === propName ? 'block' : 'none' }}
                            >
                                <div className="form-label-row">
                                    <label className="form-label">
                                        <span className="field-key">{group.groupKey}.{propName}</span>
                                    </label>
                                    <button
                                        className="btn-quick-translate"
                                        onClick={() => toggleQuickTranslate(propName)}
                                        title="Traducir esta propiedad"
                                    >
                                        🌐 Traducir
                                    </button>
                                </div>

                                {showQuickTranslate[propName] && (
                                    <div className="quick-translate-panel">
                                        <div className="quick-translate-langs">
                                            <select
                                                value={quickTranslateLangs.source}
                                                onChange={(e) => setQuickTranslateLangs(prev => ({ ...prev, source: e.target.value }))}
                                                className="lang-select-small"
                                            >
                                                {Object.entries(LANGUAGES).map(([code, name]) => (
                                                    <option key={code} value={code}>{name}</option>
                                                ))}
                                            </select>
                                            <span className="arrow-small">→</span>
                                            <select
                                                value={quickTranslateLangs.target}
                                                onChange={(e) => setQuickTranslateLangs(prev => ({ ...prev, target: e.target.value }))}
                                                className="lang-select-small"
                                            >
                                                {Object.entries(LANGUAGES).map(([code, name]) => (
                                                    <option key={code} value={code}>{name}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn-translate-now"
                                                onClick={() => handleQuickTranslate(propName)}
                                                disabled={isTranslating[propName] || quickTranslateLangs.source === quickTranslateLangs.target}
                                            >
                                                {isTranslating[propName] ? '🔄' : '✨'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="minecraft-color-toolbar">
                                    <div className="color-section">
                                        <span className="toolbar-label">Colors:</span>
                                        <div className="color-buttons">
                                            {minecraftColors.map(color => (
                                                <button
                                                    key={color.code}
                                                    className="color-btn"
                                                    style={{ backgroundColor: color.color }}
                                                    onClick={() => handleColorInsert(color.code, propName)}
                                                    title={`${color.name} (${color.code})`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="format-section">
                                        <span className="toolbar-label">Format:</span>
                                        <div className="format-buttons">
                                            {minecraftFormats.map(format => (
                                                <button
                                                    key={format.code}
                                                    className="format-btn"
                                                    onClick={() => handleColorInsert(format.code, propName)}
                                                    title={`${format.name} (${format.code})`}
                                                >
                                                    {format.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    ref={el => textareaRefs.current[propName] = el}
                                    className="form-textarea minecraft-textarea"
                                    value={editedProperties[propName] || ''}
                                    onChange={(e) => handlePropertyChange(propName, e.target.value)}
                                    placeholder={`Enter ${propName}...`}
                                    rows={Array.isArray(group.properties[propName]) ? 10 : 5}
                                />

                                <div className="minecraft-preview">
                                    <div className="preview-label">Preview:</div>
                                    <div className="preview-content">
                                        {renderPreview(editedProperties[propName])}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions translation-modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TranslationEditor;
