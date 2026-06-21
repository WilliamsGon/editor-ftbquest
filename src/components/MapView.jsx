import React, { useState, useRef, useEffect } from 'react';

function MapView({ quests, onSelect }) {
    const [hoveredQuest, setHoveredQuest] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Reset view when component mounts or quests change
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // Calculate bounds of all quests
    const getBounds = () => {
        if (!quests || quests.length === 0) {
            return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
        }

        const positions = quests.map(q => ({
            x: q.x?.value !== undefined ? q.x.value : (q.x || 0),
            y: q.y?.value !== undefined ? q.y.value : (q.y || 0)
        }));

        const xs = positions.map(p => p.x);
        const ys = positions.map(p => p.y);

        return {
            minX: Math.min(...xs) - 2,
            maxX: Math.max(...xs) + 2,
            minY: Math.min(...ys) - 2,
            maxY: Math.max(...ys) + 2
        };
    };

    const bounds = getBounds();
    const gridWidth = bounds.maxX - bounds.minX;
    const gridHeight = bounds.maxY - bounds.minY;

    // Convert quest coordinates to screen coordinates
    const questToScreen = (questX, questY) => {
        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;
        
        const padding = 60;
        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;

        const scaleX = availableWidth / gridWidth;
        const scaleY = availableHeight / gridHeight;
        const scale = Math.min(scaleX, scaleY) * zoom;

        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        const relativeX = questX - (bounds.minX + gridWidth / 2);
        const relativeY = questY - (bounds.minY + gridHeight / 2);

        return {
            x: centerX + relativeX * scale + pan.x,
            y: centerY + relativeY * scale + pan.y
        };
    };

    const handleMouseDown = (e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('grid-background')) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prevZoom => Math.max(0.3, Math.min(3, prevZoom * delta)));
    };

    const handleQuestHover = (quest, e) => {
        setHoveredQuest(quest);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const handleQuestLeave = () => {
        setHoveredQuest(null);
    };

    const getQuestIcon = (quest) => {
        // Determine icon based on quest properties
        if (quest.shape) {
            switch (quest.shape) {
                case 'circle': return '⭕';
                case 'square': return '🟦';
                case 'diamond': return '🔷';
                case 'pentagon': return '⬟';
                case 'hexagon': return '⬡';
                case 'heart': return '❤️';
                case 'gear': return '⚙️';
                default: return '📦';
            }
        }
        return '📦';
    };

    const getShapeClass = (shape) => {
        // Map shape names to CSS classes - hexagon, octagon, gear remain circular
        switch (shape) {
            case 'square': return 'shape-square';
            case 'rsquare': return 'shape-rsquare';
            case 'diamond': return 'shape-diamond';
            case 'pentagon': return 'shape-pentagon';
            case 'heart': return 'shape-heart';
            case 'hexagon':
            case 'octagon':
            case 'gear':
            case 'circle':
            default:
                return 'shape-circle';
        }
    };

    const getQuestLabel = (quest) => {
        if (quest.tasks && quest.tasks.length > 0) {
            const task = quest.tasks[0];
            const itemId = typeof task.item === 'string' ? task.item : task.item?.id;
            if (itemId) {
                const count = task.count ? (task.count.value || task.count) : 1;
                if (itemId === 'ftbfiltersystem:smart_filter' && task.item?.tag?.["ftbfiltersystem:filter"]) {
                    const filterStr = task.item.tag["ftbfiltersystem:filter"].replace('ftbfiltersystem:item_tag(', '').replace(')', '');
                    return `${count}x Filter: ${filterStr}`;
                }
                const itemName = itemId.split(':').pop().replace(/_/g, ' ');
                return `${count}x ${itemName}`;
            }
            if (task.entity) {
                return `Kill ${task.entity.split(':').pop()}`;
            }
            if (task.dimension) {
                return `Visit ${task.dimension.split(':').pop()}`;
            }
            if (task.type) {
                return task.type;
            }
        }
        return quest.id.substring(0, 8);
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, []);

    return (
        <div className="map-view-container">
            <div className="map-controls">
                <button className="map-control-btn" onClick={() => setZoom(z => Math.min(3, z * 1.2))}>
                    🔍+
                </button>
                <button className="map-control-btn" onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}>
                    🔍-
                </button>
                <button className="map-control-btn" onClick={resetView}>
                    🎯 Reset
                </button>
                <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
            </div>

            <div
                ref={containerRef}
                className="map-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {/* Grid background */}
                <svg className="grid-background" width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Axes */}
                    <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="rgba(0, 210, 255, 0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                    <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="100%"
                        stroke="rgba(0, 210, 255, 0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </svg>

                {/* Dependency lines - drawn first (below quests) */}
                <svg className="dependency-lines" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                    {quests && quests.map((quest) => {
                        const questX = quest.x?.value !== undefined ? quest.x.value : (quest.x || 0);
                        const questY = quest.y?.value !== undefined ? quest.y.value : (quest.y || 0);
                        const screenPos = questToScreen(questX, questY);

                        if (quest.dependencies && Array.isArray(quest.dependencies)) {
                            return quest.dependencies.map((depId, idx) => {
                                const depQuest = quests.find(q => q.id === depId);
                                if (depQuest) {
                                    const depX = depQuest.x?.value !== undefined ? depQuest.x.value : (depQuest.x || 0);
                                    const depY = depQuest.y?.value !== undefined ? depQuest.y.value : (depQuest.y || 0);
                                    const depScreenPos = questToScreen(depX, depY);
                                    
                                    // Calculate angle for arrow direction
                                    const angle = Math.atan2(screenPos.y - depScreenPos.y, screenPos.x - depScreenPos.x) * 180 / Math.PI;
                                    
                                    // Calculate midpoint for arrow
                                    const midX = (depScreenPos.x + screenPos.x) / 2;
                                    const midY = (depScreenPos.y + screenPos.y) / 2;

                                    return (
                                        <g key={`dep-${quest.id}-${idx}`}>
                                            <line
                                                x1={depScreenPos.x}
                                                y1={depScreenPos.y}
                                                x2={screenPos.x}
                                                y2={screenPos.y}
                                                stroke="rgba(0, 210, 255, 0.4)"
                                                strokeWidth="2"
                                                markerEnd="url(#arrowhead)"
                                            />
                                            {/* Arrow marker at midpoint */}
                                            <polygon
                                                points="-6,-4 -6,4 0,0"
                                                fill="rgba(0, 210, 255, 0.6)"
                                                transform={`translate(${midX},${midY}) rotate(${angle})`}
                                            />
                                        </g>
                                    );
                                }
                                return null;
                            });
                        }
                        return null;
                    })}
                </svg>

                {/* Quest nodes - drawn on top */}
                {quests && quests.map((quest) => {
                    const questX = quest.x?.value !== undefined ? quest.x.value : (quest.x || 0);
                    const questY = quest.y?.value !== undefined ? quest.y.value : (quest.y || 0);
                    const screenPos = questToScreen(questX, questY);
                    const icon = getQuestIcon(quest);
                    
                    // Get quest size and treat 0 as 1
                    const questSize = quest.size?.value !== undefined ? quest.size.value : (quest.size || 1);
                    const effectiveSize = questSize === 0 ? 1 : questSize;

                    return (
                        <div
                            key={quest.id}
                            className="quest-node"
                            style={{
                                left: screenPos.x,
                                top: screenPos.y,
                                transform: `translate(-50%, -50%) scale(${zoom * 0.5 * effectiveSize})`,
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => handleQuestHover(quest, e)}
                            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={handleQuestLeave}
                            onClick={() => onSelect(quest.id)}
                        >
                            <div className={`quest-node-inner ${getShapeClass(quest.shape)}`}>
                                <span className="quest-node-icon">{icon}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Axis labels */}
                <div className="axis-label axis-label-x">X Axis →</div>
                <div className="axis-label axis-label-y">↑ Y Axis</div>
            </div>

            {/* Tooltip */}
            {hoveredQuest && (
                <div
                    className="map-tooltip"
                    style={{
                        left: tooltipPos.x + 15,
                        top: tooltipPos.y + 15
                    }}
                >
                    <div className="tooltip-header">
                        <span className="tooltip-icon">{getQuestIcon(hoveredQuest)}</span>
                        <strong>{getQuestLabel(hoveredQuest)}</strong>
                    </div>
                    <div className="tooltip-body">
                        <div className="tooltip-row">
                            <span className="tooltip-label">ID:</span>
                            <span className="tooltip-value">{hoveredQuest.id.substring(0, 12)}...</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Position:</span>
                            <span className="tooltip-value">
                                ({hoveredQuest.x?.value !== undefined ? hoveredQuest.x.value : hoveredQuest.x}, 
                                {hoveredQuest.y?.value !== undefined ? hoveredQuest.y.value : hoveredQuest.y})
                            </span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Shape:</span>
                            <span className="tooltip-value">{hoveredQuest.shape || 'default'}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Tasks:</span>
                            <span className="tooltip-value">{hoveredQuest.tasks?.length || 0}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Rewards:</span>
                            <span className="tooltip-value">{hoveredQuest.rewards?.length || 0}</span>
                        </div>
                        {hoveredQuest.dependencies && hoveredQuest.dependencies.length > 0 && (
                            <div className="tooltip-row">
                                <span className="tooltip-label">Dependencies:</span>
                                <span className="tooltip-value">{hoveredQuest.dependencies.length}</span>
                            </div>
                        )}
                    </div>
                    <div className="tooltip-footer">
                        Click to edit
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;
