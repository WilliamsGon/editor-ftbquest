// Translation utility using AI models (LLMs) for better context-aware translations

const TRANSLATION_SERVICES = {
  GROQ: 'groq', // Free tier available with high-quality models
  HUGGINGFACE: 'huggingface', // Free inference API
  OPENAI: 'openai', // Requires API key
  LIBRETRANSLATE: 'libretranslate', // Fallback traditional service
  MYMEMORY: 'mymemory',
  GOOGLE_FREE: 'google_free'
};

class TranslationService {
  constructor() {
    this.currentService = TRANSLATION_SERVICES.GROQ;
    this.cache = new Map();
    this.apiKeys = {
      groq: '', // User can add their free API key from console.groq.com
      huggingface: '', // User can add their free API key from huggingface.co
      openai: '' // User can add their API key if they have one
    };
  }

  // Set API key for a service
  setApiKey(service, key) {
    this.apiKeys[service] = key;
  }

  // Groq - Free AI translation with LLaMA models (very fast and high quality)
  async translateWithGroq(text, sourceLang, targetLang) {
    const apiKey = this.apiKeys.groq || 'gsk_demo'; // Will use demo key if none provided
    
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
IMPORTANT: Preserve any Minecraft color codes (like &a, &l, &4, etc.) exactly as they appear.
Only return the translated text, nothing else.

Text to translate: ${text}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Fast and accurate model
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate text accurately while preserving formatting codes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } else if (response.status === 401) {
        throw new Error('Invalid Groq API key. Get a free key from console.groq.com');
      } else {
        throw new Error(`Groq API error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Groq translation failed: ${error.message}`);
    }
  }

  // Hugging Face - Free AI translation using Meta's models
  async translateWithHuggingFace(text, sourceLang, targetLang) {
    const apiKey = this.apiKeys.huggingface;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key required. Get a free key from huggingface.co/settings/tokens');
    }

    // Use Meta's NLLB model for translation
    const model = 'facebook/nllb-200-distilled-600M';
    
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: this.convertToNLLBCode(sourceLang),
            tgt_lang: this.convertToNLLBCode(targetLang)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data[0].translation_text;
      } else {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Hugging Face translation failed: ${error.message}`);
    }
  }

  // Convert language codes to NLLB format
  convertToNLLBCode(lang) {
    const nllbCodes = {
      'en': 'eng_Latn',
      'es': 'spa_Latn',
      'fr': 'fra_Latn',
      'de': 'deu_Latn',
      'it': 'ita_Latn',
      'pt': 'por_Latn',
      'ru': 'rus_Cyrl',
      'ja': 'jpn_Jpan',
      'ko': 'kor_Hang',
      'zh': 'zho_Hans',
      'ar': 'ara_Arab'
    };
    return nllbCodes[lang] || 'eng_Latn';
  }

  // OpenAI - High quality but requires paid API key
  async translateWithOpenAI(text, sourceLang, targetLang) {
    const apiKey = this.apiKeys.openai;
    
    if (!apiKey) {
      throw new Error('OpenAI API key required');
    }

    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
Preserve any Minecraft color codes (like &a, &l, &4, etc.) exactly as they appear.
Only return the translated text, nothing else.

Text: ${text}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost-effective model
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate text accurately while preserving formatting codes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } else {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`OpenAI translation failed: ${error.message}`);
    }
  }

  // LibreTranslate - Free and open source (self-hosted or public instances)
  async translateWithLibreTranslate(text, sourceLang, targetLang) {
    const instances = [
      'https://libretranslate.com/translate',
      'https://translate.argosopentech.com/translate',
      'https://translate.terraprint.co/translate'
    ];

    for (const instance of instances) {
      try {
        const response = await fetch(instance, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.translatedText;
        }
      } catch (error) {
        console.warn(`LibreTranslate instance ${instance} failed:`, error);
        continue;
      }
    }
    throw new Error('All LibreTranslate instances failed');
  }

  // MyMemory Translation - Free with daily limit
  async translateWithMyMemory(text, sourceLang, targetLang) {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      } else {
        throw new Error(data.responseDetails || 'MyMemory translation failed');
      }
    } catch (error) {
      throw new Error(`MyMemory error: ${error.message}`);
    }
  }

  // Google Translate (unofficial free endpoint)
  async translateWithGoogleFree(text, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
      } else {
        throw new Error('Invalid response from Google Translate');
      }
    } catch (error) {
      throw new Error(`Google Translate error: ${error.message}`);
    }
  }

  // Main translation method with fallback
  async translate(text, sourceLang, targetLang, service = null) {
    // Check cache
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const useService = service || this.currentService;
    let translatedText = '';

    try {
      switch (useService) {
        case TRANSLATION_SERVICES.GROQ:
          translatedText = await this.translateWithGroq(text, sourceLang, targetLang);
          break;
        case TRANSLATION_SERVICES.HUGGINGFACE:
          translatedText = await this.translateWithHuggingFace(text, sourceLang, targetLang);
          break;
        case TRANSLATION_SERVICES.OPENAI:
          translatedText = await this.translateWithOpenAI(text, sourceLang, targetLang);
          break;
        case TRANSLATION_SERVICES.LIBRETRANSLATE:
          translatedText = await this.translateWithLibreTranslate(text, sourceLang, targetLang);
          break;
        case TRANSLATION_SERVICES.MYMEMORY:
          translatedText = await this.translateWithMyMemory(text, sourceLang, targetLang);
          break;
        case TRANSLATION_SERVICES.GOOGLE_FREE:
          translatedText = await this.translateWithGoogleFree(text, sourceLang, targetLang);
          break;
        default:
          throw new Error('Invalid translation service');
      }

      // Cache the result
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      // Fallback chain: Groq -> LibreTranslate -> MyMemory
      console.warn(`Translation with ${useService} failed, trying fallback...`, error);
      
      const fallbackChain = [
        TRANSLATION_SERVICES.GROQ,
        TRANSLATION_SERVICES.LIBRETRANSLATE,
        TRANSLATION_SERVICES.MYMEMORY
      ];

      for (const fallbackService of fallbackChain) {
        if (fallbackService !== useService) {
          try {
            return await this.translate(text, sourceLang, targetLang, fallbackService);
          } catch (fallbackError) {
            console.warn(`Fallback with ${fallbackService} also failed:`, fallbackError);
            continue;
          }
        }
      }
      
      throw error;
    }
  }

  // Batch translation with rate limiting
  async translateBatch(texts, sourceLang, targetLang, onProgress = null) {
    const results = [];
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < texts.length; i++) {
      try {
        const translated = await this.translate(texts[i], sourceLang, targetLang);
        results.push({ original: texts[i], translated, success: true });
        
        if (onProgress) {
          onProgress(i + 1, texts.length);
        }

        // Rate limiting - wait 500ms between requests
        if (i < texts.length - 1) {
          await delay(500);
        }
      } catch (error) {
        results.push({ original: texts[i], translated: texts[i], success: false, error: error.message });
      }
    }

    return results;
  }

  setService(service) {
    if (Object.values(TRANSLATION_SERVICES).includes(service)) {
      this.currentService = service;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

// Language codes mapping
export const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ar: 'العربية',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  sv: 'Svenska',
  cs: 'Čeština',
  da: 'Dansk',
  fi: 'Suomi',
  el: 'Ελληνικά',
  he: 'עברית',
  hi: 'हिन्दी',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  no: 'Norsk',
  ro: 'Română',
  sk: 'Slovenčina',
  uk: 'Українська',
  vi: 'Tiếng Việt'
};

export { TranslationService, TRANSLATION_SERVICES };
