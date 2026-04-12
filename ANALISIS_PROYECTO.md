# Análisis del Proyecto: SNBT Editor para FTBQuests

**Directorio:** `C:\Proyectos\MinecraftProyects\Proyectos\editor-ftbquest`
**Tecnologías Base:** React 19, Vite, JavaScript, CSS.

## 🎯 Objetivo Principal

**snbt-editor** es una Single Page Application (SPA) especializada en la lectura, edición y traducción visual de los archivos de configuración `.snbt` (String NBT) que utiliza el popular mod de Minecraft **FTBQuests**.

La herramienta soluciona un gran problema para los creadores de *modpacks*: editar manualmente archivos de texto con una sintaxis compleja predispuesta a errores (como los sufijos especiales `L`, `d`, `b` en los números, o los intrincados códigos de color de Minecraft). Este editor ofrece un entorno visual seguro donde las misiones (`quests`), tareas (`tasks`) y recompensas (`rewards`) pueden ser manipuladas y traducidas de forma intuitiva, para luego exportarlas manteniendo la validez del formato original.

---

## 🛠️ Arquitectura y Componentes Clave

El proyecto emplea las convenciones de una aplicación moderna de React impulsada por Vite:

1. **Estructura Base (`src/`)**
   - El punto de entrada es `main.jsx` procesando el árbol a través de `App.jsx`.
   - Utiliza CSS puro y directo en `App.css` e `index.css` en lugar de frameworks, brindando gran flexibilidad de estética.

2. **Tipos de Modelo de Datos (`utils/questTypes.js`)**
   - El proyecto mapea estáticamente los diferentes tipos de "tasks" y "rewards" que son nativas para FTBQuests y para algunos add-ons de terceros (como Nature's Aura o Productive Bees). 
   - Define cómo cada tipo de tarea (`item`, `kill`, `dimension`, `xp`, `command`, etc.) debe estructurarse.

3. **Vistas e Interfaces (`components/`)**
   - **`QuestEditor.jsx`** y **`DynamicFields.jsx`**: Un sistema de formularios que se adapta dinámicamente y expone diferentes campos de entrada en base a la necesidad del objetivo a configurar.
   - **`TableView.jsx`**: Permite a los modpackers tener un panorama a modo "hoja de cálculo" para visualizar decenas de misiones e interactuar de forma inmediata con variables críticas mediante campos o filtros masivos.

4. **Preservación Estricta del Formato SNBT (`_snbt_number`)**
   - Ya que el formato NBT de Java requiere una estricta declaración de tipos para algunas variables (por ejemplo `10L` en vez de `10` para un valor de tipo *Long*), este editor serializa el código en objetos protegidos (`{_snbt_number: true, value: "10L"}`) a través de su ciclo de vida interno. Al exportarse la tarea configurada, estas etiquetas se devuelven intactas para que FTBQuests no falle.

---

## ✨ Funcionalidades y Casos de Uso

### 1. Edición Dinámica
El editor reconocerá al instante la "forma" de tu misión y expondrá sólo lo que se necesita. 
- Para un `Task` de tipo `kill`, mostrará campos amigables para `Entity ID` (El ID a matar) y `Kill Count` (Cuántos matar).
- Para un `Reward` de tipo `command`, expondrá la consola para escribir el `Command`, qué `Permission Level` requiere el jugador en el servidor, y si debe ejecutarse modo `Silent`.

### 2. Visor Multifuncional Tabular
Un gestor que permite agilizar procesos repetitivos revisando componentes al por mayor. Las columnas se organizan en función del contenido de cada Misión, ahorrando muchísimo espacio horizontal y agilizando la organización en modpacks colosales.

### 3. Motor de Traducción de IA Dedicado
*(Tal y como se instruye en `AI_TRANSLATION_SETUP.md` y `TRANSLATION_GUIDE.md`)*
El pilar de un despliegue internacional. Facilita traducir todo el libro de misiones y lore usando capacidades avanzadas de lenguaje.
- **Traducción Automatizada Contextual**: Se integra con LLMs (Inteligencia Artificial capaz de razonamiento de texto, con soporte para Groq LLaMA, HuggingFace NLLB, u OpenAI) ofreciendo un vocabulario directamente adaptado al argot del *gaming* y evitando traducciones abstractas.
- **Respeto Codificado de Variables**: Ignora y sobrepasa por defecto los prefijos de color en el chat de Minecraft (los códigos `&a`, `&o`, `&l`) mientras cambia idiomáticamente el texto circundante.
- **Adaptabilidad en Fallos**: Si un punto de conexión (API) hacia las Inteligencias Artificiales sufre caídas de red, el traductor hace saltos graciosos (failbacks) automáticamente a APIs simples e inagotables como LibreTranslate.
- **Controles Granulares UI**: Soporta traducir tanto el mapa de *quests* al completo usando botones de despliegue ("Traducir Todo"), así como traducir línea por línea manualmente verificando por parte con un solo clic.

---

## 🎯 Conclusión

El repositorio del proyecto presenta una excelente y muy refinada aplicación complementaria de entorno de desarrollo (`DevTool`) para la comunidad del modding de Minecraft. Consigue mitigar dos de los mayores cuellos de botella al planificar aventuras inmersivas y recompensas; el fastidio de navegar código estricto a ciegas en un IDE y las formidables barreras de la localización internacional integrándose enérgicamente con la Inteligencia Artificial.
