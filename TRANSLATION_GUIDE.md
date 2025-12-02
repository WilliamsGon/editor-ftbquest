# 🌐 Guía de Traducción Automática con IA

## Características Implementadas

### ✨ Funcionalidades Principales

1. **Traducción Masiva de Todo el Archivo**
   - Botón "🌐 Traducir Todo" en la barra de herramientas
   - Traduce todos los grupos de traducción automáticamente
   - Muestra progreso en tiempo real
   - Soporta múltiples servicios de IA y traducción tradicionales

2. **Traducción Individual por Propiedad**
   - Botón "🌐 Traducir" en cada pestaña del editor
   - Traduce solo la propiedad activa
   - Panel desplegable con selector de idiomas
   - Traducción instantánea con un clic

3. **Preservación de Formato Minecraft**
   - Los modelos de IA entienden y preservan códigos de color (`&a`, `&c`, etc.)
   - Mantiene códigos de formato (`&l`, `&o`, etc.)
   - Contexto mejorado para traducciones más naturales

## 🤖 Servicios de Traducción Disponibles

### ⭐ 1. Groq AI con LLaMA 3.3 (MÁS RECOMENDADO) 🚀
- **Tipo**: Inteligencia Artificial avanzada
- **Estado**: Gratuito con nivel generoso
- **Modelo**: LLaMA 3.3 70B Versatile
- **Calidad**: ⭐⭐⭐⭐⭐ Excelente - Traducciones contextuales
- **Velocidad**: ⚡ Ultra rápida (más rápido que servicios tradicionales)
- **Límites**: ~6000 traducciones/día en tier gratuito
- **Ventajas**:
  - Traducciones naturales y contextuales
  - Entiende el contexto de videojuegos y Minecraft
  - Preserva automáticamente códigos de formato
  - Sin necesidad de procesamiento especial de placeholders
- **API Key**: Gratis en [console.groq.com](https://console.groq.com)
- **Configuración**: 
  1. Crea cuenta en console.groq.com
  2. Genera API key gratuita
  3. Pega en la app

### 🤗 2. Hugging Face (Meta NLLB) 🟢
- **Tipo**: Inteligencia Artificial - Modelo de Meta
- **Estado**: Gratuito con API key
- **Modelo**: NLLB-200 Distilled 600M
- **Calidad**: ⭐⭐⭐⭐ Muy buena
- **Límites**: Generoso en tier gratuito
- **API Key**: Gratis en [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### 🧠 3. OpenAI (GPT-4o Mini) 💰
- **Tipo**: IA Premium - GPT-4 optimizado
- **Estado**: Requiere API key de pago
- **Calidad**: ⭐⭐⭐⭐⭐ Máxima calidad
- **Costo**: ~$0.15 USD por 1M tokens (~50,000 traducciones)
- **Ventaja**: Mejor comprensión de contexto y jerga gaming
- **API Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

### 📦 Servicios Tradicionales (Backup)

### 4. LibreTranslate 🟢
- **Tipo**: Traducción tradicional open source
- **Estado**: Completamente gratuito
- **Calidad**: ⭐⭐⭐ Buena
- **Límites**: Sin límites estrictos
- **Servidores**: Múltiples instancias con failover automático

### 5. MyMemory 🟡
- **Estado**: Gratis con límite diario
- **Límites**: 1000 palabras/día
- **Calidad**: ⭐⭐⭐ Buena
- **Nota**: Útil como respaldo secundario

### 6. Google Translate (No oficial) 🔴
- **Estado**: No oficial, sin garantías
- **Calidad**: ⭐⭐⭐⭐ Excelente cuando funciona
- **Advertencia**: Puede dejar de funcionar en cualquier momento

## 📋 Cómo Usar

### 🚀 Configuración Inicial (Solo primera vez con IA)

#### Para Groq AI (Recomendado - MÁS RÁPIDO):
1. Ve a [console.groq.com](https://console.groq.com)
2. Crea cuenta gratuita (con email o GitHub)
3. Ve a "API Keys" y genera una nueva key
4. Copia la API key

#### Para Hugging Face:
1. Ve a [huggingface.co](https://huggingface.co)
2. Crea cuenta gratuita
3. Ve a Settings → Access Tokens
4. Crea nuevo token (read access es suficiente)
5. Copia el token

#### Para OpenAI (Opcional - Pago):
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea cuenta y agrega créditos ($5 USD mínimo)
3. Ve a API Keys y genera nueva key
4. Copia la API key

### Traducción de Todo el Archivo

1. Ve a la sección **Translation** en la app
2. Importa tu archivo `.snbt` de traducción
3. Haz clic en el botón **"🌐 Traducir Todo"**
4. En el modal de configuración:
   - Selecciona el **Idioma de Origen** (ej: English)
   - Selecciona el **Idioma de Destino** (ej: Español)
   - Elige el **Servicio de Traducción**:
     - ⭐ **Groq AI** (recomendado - rápido y preciso con IA)
     - 🤗 Hugging Face (alternativa IA gratuita)
     - 🧠 OpenAI (máxima calidad, requiere pago)
     - 📦 LibreTranslate (backup sin IA)
   - Si elegiste un servicio de IA, **pega tu API key** en el campo que aparecerá
   - Opcional: Prueba la traducción con el campo de texto
5. Haz clic en **"🌐 Traducir Todo (X grupos)"**
6. Espera a que se complete (verás el progreso detallado)
7. **Importante**: Exporta el archivo traducido con el botón **"💾 Export"**

### Traducción Individual

1. Selecciona un grupo haciendo clic en el botón de editar (✏️)
2. En el modal, navega por las pestañas de propiedades
3. Haz clic en **"🌐 Traducir"** en la propiedad que desees traducir
4. Selecciona los idiomas de origen y destino
5. Haz clic en el botón **✨** para traducir
6. El texto se traducirá automáticamente
7. Puedes editar manualmente el resultado
8. Haz clic en **"Save All Changes"** al terminar

## 🎯 Idiomas Soportados

- 🇬🇧 English (en)
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇮🇹 Italiano (it)
- 🇵🇹 Português (pt)
- 🇷🇺 Русский (ru)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇨🇳 中文 (zh)
- Y muchos más...

## ⚠️ Consideraciones Importantes

### Límites y Rendimiento
- **Con IA (Groq)**: Mucho más rápido, traducciones en ~1-2 segundos cada una
- **Servicios tradicionales**: Traducción masiva puede tomar varios minutos
- Hay un delay de 500ms entre traducciones para evitar saturar el servicio
- Los resultados se cachean para evitar traducciones repetidas
- **Groq tier gratuito**: ~6000 traducciones/día
- **Hugging Face tier gratuito**: Generoso pero puede tener cold start

### Calidad de Traducción

#### Con Servicios de IA:
- ⭐ **Groq (LLaMA 3.3)**: Excelente comprensión de contexto gaming/Minecraft
- ⭐ **OpenAI (GPT-4o)**: Máxima calidad, entiende jerga y contexto cultural
- ⭐ Traducciones más naturales y fluidas
- ⭐ Mejor manejo de nombres propios y términos técnicos
- ⭐ Respeta automáticamente códigos de formato sin procesamiento adicional

#### Con Servicios Tradicionales:
- Calidad variable según el par de idiomas
- Términos técnicos pueden no traducirse correctamente
- Traducciones más literales

### Recomendaciones:
- **Siempre revisa** las traducciones automáticas
- **Edita manualmente** nombres propios si es necesario
- **Usa "Probar Traducción"** antes de traducir todo el archivo
- **Para mejor calidad**: Groq AI (gratis) > OpenAI (pago) > LibreTranslate

### Códigos de Minecraft
- Los códigos de formato Minecraft (`&a`, `&l`, etc.) se preservan automáticamente
- Los modelos de IA entienden su función y no los traducen
- El preview muestra cómo se verá el texto con los códigos aplicados

### Arrays y Textos Multilínea
- Los arrays (descripción multi-línea) se traducen línea por línea
- El formato se preserva automáticamente
- Las líneas vacías se mantienen

## 🔧 Solución de Problemas

### "All LibreTranslate instances failed"
- Intenta con otro servicio (MyMemory o Google)
- Verifica tu conexión a internet
- Espera unos minutos y vuelve a intentar

### "MyMemory translation failed"
- Puede que hayas alcanzado el límite diario
- Cambia a LibreTranslate o Google Translate

### Traducción muy lenta
- Es normal, hay un delay intencional de 500ms entre traducciones
- Puedes cancelar y traducir grupos específicos manualmente

### Algunos textos no se traducen
- Verifica que el servicio esté funcionando con la prueba de traducción
- Algunos textos muy cortos pueden no traducirse bien
- Edita manualmente los que fallen

## 💡 Consejos y Mejores Prácticas

1. **Haz una copia de seguridad** antes de traducir todo el archivo
2. **Prueba primero** con el campo de prueba en la configuración
3. **Traduce grupos específicos** si solo necesitas actualizar algunas partes
4. **Revisa siempre** las traducciones automáticas, especialmente términos técnicos
5. **Usa LibreTranslate** como primera opción (más confiable)
6. **Exporta frecuentemente** para no perder cambios

## 🚀 Ejemplos de Uso

### Ejemplo 1: Traducir de Inglés a Español
```
1. Click "🌐 Traducir Todo"
2. Source: English (en)
3. Target: Español (es)
4. Service: LibreTranslate
5. Click "🌐 Traducir Todo"
6. Espera ~5-10 minutos para ~100 grupos
7. Export el archivo traducido
```

### Ejemplo 2: Traducir Solo Títulos
```
1. Busca y filtra por el prefijo que necesites
2. Edita cada grupo individualmente
3. En la pestaña "title", click "🌐 Traducir"
4. Traduce solo esa propiedad
5. Save y continúa con el siguiente
```

### Ejemplo 3: Traducir de Español a Múltiples Idiomas
```
1. Exporta el archivo en español
2. Haz una copia
3. Importa la primera copia
4. Traduce de es → en
5. Exporta como en_us.snbt
6. Repite para otros idiomas (fr_fr.snbt, de_de.snbt, etc.)
```

## 📝 Notas Técnicas

- **Cache**: Las traducciones se cachean en memoria durante la sesión
- **Failover**: Si un servicio falla, automáticamente intenta con LibreTranslate
- **Rate Limiting**: Delay de 500ms entre requests para no saturar APIs gratuitas
- **Placeholders**: Los códigos Minecraft se reemplazan temporalmente durante la traducción
- **Batch Processing**: Las traducciones masivas se procesan secuencialmente

---

¿Necesitas ayuda? Contacta al desarrollador o abre un issue en el repositorio.
