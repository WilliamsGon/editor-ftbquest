
import React, { useState } from 'react';
import './App.css';
import Importer from './components/Importer';
import QuestList from './components/QuestList';
import QuestEditor from './components/QuestEditor';
import Exporter from './components/Exporter';
import TableView from './components/TableView';
import MapView from './components/MapView';
import CreateQuestModal from './components/CreateQuestModal';
import TranslationTable from './components/TranslationTable';
import { SNBT } from './utils/snbt';

function App() {
  const [data, setData] = useState(null);
  const [filename, setFilename] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table', 'map', 'translation'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [translationData, setTranslationData] = useState(null);
  const [translationFilename, setTranslationFilename] = useState('');
  const [appMode, setAppMode] = useState('quests'); // 'quests' or 'translation'

  const handleFileImport = (content, name) => {
    try {
      const parsed = SNBT.parse(content);
      setData(parsed);
      setFilename(name);
      setSelectedQuestId(null);
    } catch (e) {
      alert("Error parsing file: " + e.message);
    }
  };

  const handleQuestSelect = (id) => {
    setSelectedQuestId(id);
  };

  const handleQuestUpdate = (updatedQuest) => {
    // Find and update the quest in data.quests
    const newData = { ...data };
    const index = newData.quests.findIndex(q => q.id === updatedQuest.id);
    if (index !== -1) {
      newData.quests[index] = updatedQuest;
      setData(newData);
    }
  };

  const handleCreateQuest = (newQuest) => {
    const newData = { ...data };
    newData.quests = [...(newData.quests || []), newQuest];
    setData(newData);
    setSelectedQuestId(newQuest.id);
  };

  const handleTranslationImport = (content, name) => {
    try {
      const parsed = SNBT.parse(content);
      setTranslationData(parsed);
      setTranslationFilename(name);
      setAppMode('translation');
    } catch (e) {
      alert("Error parsing translation file: " + e.message);
    }
  };

  const handleTranslationUpdate = (updatedData) => {
    setTranslationData(updatedData);
  };

  const handleExportTranslation = () => {
    if (!translationData) return;
    const content = SNBT.stringify(translationData);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = translationFilename || 'translation.snbt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <span><h1>SNBT Editor</h1> by AtilaZone</span>
          {filename && appMode === 'quests' && <span className="filename">{filename}</span>}
          {translationFilename && appMode === 'translation' && <span className="filename">{translationFilename}</span>}
        </div>
        <div className="header-right">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${appMode === 'quests' ? 'active' : ''}`}
              onClick={() => setAppMode('quests')}
            >
              📦 Quests
            </button>
            <button
              className={`mode-btn ${appMode === 'translation' ? 'active' : ''}`}
              onClick={() => setAppMode('translation')}
            >
              🌐 Translation
            </button>
          </div>
        </div>
      </header>

      <main>
        {appMode === 'quests' && !data ? (
          <Importer onImport={handleFileImport} />
        ) : appMode === 'quests' && data ? (
          <>
            {viewMode === 'grid' ? (
              <QuestList
                quests={data.quests}
                onSelect={setSelectedQuestId}
                onCreateQuest={() => setShowCreateModal(true)}
                exportButton={
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="view-toggle">
                      <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                      >
                        🔲 Grid
                      </button>
                      <button
                        className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                      >
                        📊 Table
                      </button>
                      <button
                        className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                        onClick={() => setViewMode('map')}
                      >
                        🗺️ Map
                      </button>
                    </div>
                    <Exporter data={data} filename={filename} />
                  </div>
                }
              />
            ) : viewMode === 'table' ? (
              <div className="table-view-wrapper">
                <div className="table-view-header">
                  <div className="view-toggle">
                    <button
                      className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      🔲 Grid
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      📊 Table
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                      onClick={() => setViewMode('map')}
                    >
                      🗺️ Map
                    </button>
                  </div>
                  <Exporter data={data} filename={filename} />
                </div>
                <TableView data={data} onUpdate={setData} />
              </div>
            ) : (
              <div className="table-view-wrapper">
                <div className="table-view-header">
                  <div className="view-toggle">
                    <button
                      className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      🔲 Grid
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      📊 Table
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                      onClick={() => setViewMode('map')}
                    >
                      🗺️ Map
                    </button>
                  </div>
                  <Exporter data={data} filename={filename} />
                </div>
                <MapView quests={data.quests || []} onSelect={setSelectedQuestId} />
              </div>
            )}
            {selectedQuestId && (
              <QuestEditor
                key={selectedQuestId}
                quest={data.quests.find(q => q.id === selectedQuestId)}
                onUpdate={handleQuestUpdate}
                onClose={() => setSelectedQuestId(null)}
              />
            )}
            {showCreateModal && (
              <CreateQuestModal
                data={data}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateQuest}
              />
            )}
          </>
        ) : appMode === 'translation' && !translationData ? (
          <Importer onImport={handleTranslationImport} />
        ) : appMode === 'translation' && translationData ? (
          <div className="translation-view-wrapper">
            <div className="translation-view-header">
              <h2>📝 Translation Editor</h2>
              <button 
                className="btn-export" 
                onClick={handleExportTranslation}
              >
                💾 Export
              </button>
            </div>
            <TranslationTable 
              data={translationData} 
              onUpdate={handleTranslationUpdate}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
