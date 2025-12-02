import React, { useState, useEffect } from 'react';
import { TranslationService, LANGUAGES, TRANSLATION_SERVICES } from '../utils/translator';

function TranslationConfig({ onClose, onTranslateAll, groupCount }) {
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const [service, setService] = useState(TRANSLATION_SERVICES.GROQ);
    const [isTranslating, setIsTranslating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [testText, setTestText] = useState('Hello, this is a test translation.');
    const [testResult, setTestResult] = useState('');
    const [testError, setTestError] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [apiKeys, setApiKeys] = useState({
        groq: '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',
        huggingface: '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',
        openai: ''
    });

    const translator = new TranslationService();

    const handleTestTranslation = async () => {
        setTestResult('');
        setTestError('');
        setIsTranslating(true);

        try {
            translator.setService(service);
            const result = await translator.translate(testText, sourceLang, targetLang);
            setTestResult(result);
        } catch (error) {
            setTestError(`Error: ${error.message}`);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleTranslateAll = async () => {
        const estimatedMinutes = Math.ceil(groupCount * 0.5 / 60);
        if (window.confirm(`¿Estás seguro de que deseas traducir ${groupCount} grupos de ${LANGUAGES[sourceLang]} a ${LANGUAGES[targetLang]}?\n\n⏱️ Tiempo estimado: ~${estimatedMinutes} minuto(s)\n\n⚠️ No cierres la ventana durante el proceso.`)) {
            setIsTranslating(true);
            setStartTime(Date.now());
            translator.setService(service);
            
            try {
                await onTranslateAll(translator, sourceLang, targetLang, (current, total) => {
                    setProgress({ current, total });
                });
                
                // Calculate actual time taken
                const timeTaken = Math.round((Date.now() - startTime) / 1000);
                alert(`✅ ¡Traducción completada exitosamente!\n\n📊 ${groupCount} grupos traducidos\n⏱️ Tiempo: ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}\n\n💾 No olvides exportar el archivo.`);
            } catch (error) {
                alert(`❌ Error durante la traducción: ${error.message}`);
            } finally {
                setIsTranslating(false);
                setProgress({ current: 0, total: 0 });
                setStartTime(null);
            }
        }
    };

    return (
        <div className="quest-editor-overlay" onClick={(e) => {
            if (e.target.className === 'quest-editor-overlay') {
                onClose();
            }
        }}>
            <div className="quest-editor translation-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="editor-header">
                    <h2>🌍 Configuración de Traducción</h2>
                    <p className="config-subtitle">
                        {isTranslating 
                            ? '⚠️ Traducción en progreso - No cierres esta ventana' 
                            : 'Traduce automáticamente todos los textos del archivo'}
                    </p>
                </div>

                {isTranslating && (
                    <div className="translation-status-banner">
                        <div className="status-icon">🔄</div>
                        <div className="status-text">
                            <strong>Traducción activa</strong>
                            <span>Por favor no cierres la aplicación ni esta ventana</span>
                        </div>
                    </div>
                )}

                <div className="editor-content-scroll">
                    <div className={`config-section ${isTranslating ? 'disabled' : ''}`}>
                        <h3>⚙️ Configuración de Idiomas</h3>
                        
                        <div className="language-selectors">
                            <div className="language-field">
                                <label>Idioma de Origen:</label>
                                <select 
                                    value={sourceLang} 
                                    onChange={(e) => setSourceLang(e.target.value)}
                                    className="form-select"
                                    disabled={isTranslating}
                                >
                                    {Object.entries(LANGUAGES).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="arrow-icon">→</div>

                            <div className="language-field">
                                <label>Idioma de Destino:</label>
                                <select 
                                    value={targetLang} 
                                    onChange={(e) => setTargetLang(e.target.value)}
                                    className="form-select"
                                    disabled={isTranslating}
                                >
                                    {Object.entries(LANGUAGES).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`config-section ${isTranslating ? 'disabled' : ''}`}>
                        <h3>🤖 Servicio de Traducción con IA</h3>
                        
                        <div className="service-options">
                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.GROQ}
                                    checked={service === TRANSLATION_SERVICES.GROQ}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>🚀 Groq AI (LLaMA 3.3)</strong>
                                    <span className="service-badge ai">IA Avanzada</span>
                                    <span className="service-badge free">Gratis</span>
                                    <p>Traducción con IA de última generación. Muy rápido y preciso. Recomendado.</p>
                                </div>
                            </label>

                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.HUGGINGFACE}
                                    checked={service === TRANSLATION_SERVICES.HUGGINGFACE}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>🤗 Hugging Face (Meta NLLB)</strong>
                                    <span className="service-badge ai">IA</span>
                                    <span className="service-badge free">Gratis</span>
                                    <p>Modelo de IA de Meta. Requiere API key gratuita de huggingface.co</p>
                                </div>
                            </label>

                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.OPENAI}
                                    checked={service === TRANSLATION_SERVICES.OPENAI}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>🧠 OpenAI (GPT-4o Mini)</strong>
                                    <span className="service-badge ai">IA Premium</span>
                                    <span className="service-badge paid">Requiere API Key</span>
                                    <p>Máxima calidad con GPT-4. Requiere cuenta de OpenAI con créditos.</p>
                                </div>
                            </label>

                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.LIBRETRANSLATE}
                                    checked={service === TRANSLATION_SERVICES.LIBRETRANSLATE}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>LibreTranslate</strong>
                                    <span className="service-badge free">Gratis</span>
                                    <p>Servicio tradicional libre y de código abierto. Backup recomendado.</p>
                                </div>
                            </label>

                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.MYMEMORY}
                                    checked={service === TRANSLATION_SERVICES.MYMEMORY}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>MyMemory</strong>
                                    <span className="service-badge limited">Límite Diario</span>
                                    <p>Gratis con límite de 1000 palabras/día.</p>
                                </div>
                            </label>

                            <label className="service-option">
                                <input
                                    type="radio"
                                    value={TRANSLATION_SERVICES.GOOGLE_FREE}
                                    checked={service === TRANSLATION_SERVICES.GOOGLE_FREE}
                                    onChange={(e) => setService(e.target.value)}
                                    disabled={isTranslating}
                                />
                                <div className="service-info">
                                    <strong>Google Translate (No oficial)</strong>
                                    <span className="service-badge warning">Sin garantía</span>
                                    <p>Puede dejar de funcionar sin aviso.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {(service === TRANSLATION_SERVICES.GROQ || 
                      service === TRANSLATION_SERVICES.HUGGINGFACE || 
                      service === TRANSLATION_SERVICES.OPENAI) && (
                        <div className="config-section api-key-section">
                            <h3>🔑 Configuración de API Key</h3>
                            <p className="api-key-info">
                                {service === TRANSLATION_SERVICES.GROQ && (
                                    <>
                                        Obtén tu API key gratuita en: <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">console.groq.com</a>
                                        <br />
                                        <small>✅ Groq ofrece nivel gratuito generoso con modelos LLaMA de alta velocidad</small>
                                    </>
                                )}
                                {service === TRANSLATION_SERVICES.HUGGINGFACE && (
                                    <>
                                        Obtén tu API key gratuita en: <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">huggingface.co/settings/tokens</a>
                                        <br />
                                        <small>✅ Token de acceso gratuito para inference API</small>
                                    </>
                                )}
                                {service === TRANSLATION_SERVICES.OPENAI && (
                                    <>
                                        Necesitas una API key de OpenAI con créditos: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a>
                                        <br />
                                        <small>⚠️ Servicio de pago - aproximadamente $0.15 por 1M tokens con GPT-4o Mini</small>
                                    </>
                                )}
                            </p>
                            <input
                                type="password"
                                className="api-key-input"
                                placeholder="Pega tu API key aquí..."
                                value={apiKeys[service] || ''}
                                onChange={(e) => {
                                    const newKeys = { ...apiKeys, [service]: e.target.value };
                                    setApiKeys(newKeys);
                                    translator.setApiKey(service, e.target.value);
                                }}
                                disabled={isTranslating}
                            />
                        </div>
                    )}

                    <div className="config-section">
                        <h3>🧪 Probar Traducción</h3>
                        
                        <div className="test-section">
                            <textarea
                                className="test-input"
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Escribe un texto para probar..."
                                rows={3}
                            />
                            
                            <button 
                                className="btn-test"
                                onClick={handleTestTranslation}
                                disabled={isTranslating || !testText}
                            >
                                {isTranslating ? '🔄 Traduciendo...' : '✨ Probar Traducción'}
                            </button>

                            {testResult && (
                                <div className="test-result success">
                                    <strong>Resultado:</strong>
                                    <p>{testResult}</p>
                                </div>
                            )}

                            {testError && (
                                <div className="test-result error">
                                    <strong>Error:</strong>
                                    <p>{testError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {progress.total > 0 && (
                        <div className="progress-section-active">
                            <div className="progress-header">
                                <div className="progress-icon">🔄</div>
                                <div className="progress-details">
                                    <h4>Traduciendo en progreso...</h4>
                                    <p>Por favor espera, esto puede tomar varios minutos</p>
                                </div>
                            </div>
                            <div className="progress-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Grupos procesados:</span>
                                    <span className="stat-value">{progress.current} / {progress.total}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Progreso:</span>
                                    <span className="stat-value">{Math.round((progress.current / progress.total) * 100)}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Restantes:</span>
                                    <span className="stat-value">{progress.total - progress.current}</span>
                                </div>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-modern">
                                    <div 
                                        className="progress-fill-modern"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    >
                                        <span className="progress-percentage">
                                            {Math.round((progress.current / progress.total) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="progress-note">
                                <span>⏱️ Tiempo estimado restante: ~{Math.ceil((progress.total - progress.current) * 0.5 / 60)} min</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions translation-modal-footer">
                    <button 
                        className="btn-cancel-modern" 
                        onClick={onClose} 
                        disabled={isTranslating}
                    >
                        <span className="btn-icon">❌</span>
                        <span className="btn-text">Cancelar</span>
                    </button>
                    <button 
                        className={`btn-translate-modern ${isTranslating ? 'translating' : ''}`}
                        onClick={handleTranslateAll}
                        disabled={isTranslating || sourceLang === targetLang}
                    >
                        <span className="btn-icon">{isTranslating ? '🔄' : '🌐'}</span>
                        <span className="btn-text">
                            {isTranslating ? 'Traduciendo...' : `Traducir ${groupCount} grupos`}
                        </span>
                        {isTranslating && <span className="btn-spinner"></span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TranslationConfig;
