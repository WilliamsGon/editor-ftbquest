# FTB Quests Web Editor 📝⛏️

Una poderosa herramienta web construida con React y Vite diseñada para agilizar la edición masiva, gestión y visualización de archivos **SNBT** generados por el mod **FTB Quests** para Minecraft.

Este editor proporciona una interfaz tipo tabla de datos (DataGrid) interactiva que facilita revisar y alterar misiones (Quests), tareas (Tasks) y recompensas (Rewards) de manera rápida y sin lidiar directamente con el código fuente del SNBT.

---

## 🌟 Características Principales

### 📊 Sistema de Vistas por Tablas
Alterna entre 3 vistas principales dedicadas a los aspectos clave de tus misiones:
- **Quests:** Gestiona propiedades globales, coordenadas (X/Y), tamaño, iconos y dependencias.
- **Tasks:** Administra las tareas de cada misión. Edita cantidades, IDs de ítems, tipos, entidades a matar, biomas, etc.
- **Rewards:** Controla fácilmente qué da cada misión (experiencia, ítems, comandos).

### 🔍 Filtrado Avanzado e Inteligente
Cada columna de las tablas cuenta con su propia barra de búsqueda. Puedes escribir texto en el encabezado de cualquier columna (ej. `minecraft:diamond`) para filtrar instantáneamente miles de datos y encontrar lo que buscas en segundos.

### 🏷️ Identificación Visual con "Badges" (Etiquetas)
El editor procesa la información y la presenta mediante atractivas etiquetas de colores para identificar tipos de datos rápidamente:
- **Azul:** Ítems (`item`)
- **Rojo:** Entidades/Kill (`kill`)
- **Verde:** Validaciones (`checkmark`)
- **Amarillo:** Experiencia (`xp`)

### 🧠 Resolución de Tareas y Dependencias en Recompensas
En la tabla de **Rewards**, la nueva columna *Quest Tasks* te permite ver instantáneamente qué debe hacer el jugador para conseguir esa recompensa específica sin tener que ir a buscarla manualmente.
* **Smart Dependencies:** Si la misión es solo un `checkmark` (validador) pero depende de otras misiones, el editor es lo suficientemente inteligente como para viajar al primer nivel de misiones dependientes y mostrarte las verdaderas tareas (marcadas con `[Dep]`).
* **Límite Visual Inteligente:** Si una recompensa exige más de 3 tareas o dependencias, se agrupan en una elegante etiqueta `+X más` que puedes leer al pasar el ratón.

### 📐 Columnas Redimensionables Manualmente
Personaliza tu área de trabajo a tu gusto. Todas las cabeceras de las tablas cuentan con soporte nativo de **Drag & Drop** (Arrarstrar y Soltar). Solo tienes que acercar el ratón al margen derecho de cualquier título, hacer clic y arrastrar para ensanchar o estrechar la columna. Ideal para leer *Commandos* o *IDs de ítems* muy largos.

### ⚡ Acciones Masivas (Bulk Actions)
Realiza cambios a múltiples entradas a la vez. Al filtrar la tabla de tareas, puedes usar los botones `✓` o `✗` de la cabecera para activar o desactivar propiedades booleanas masivamente (por ejemplo, `consume_items`) sobre todos los resultados mostrados actualmente.

### 🔄 Importación y Exportación de SNBT
Carga tu código `SNBT` puro en la herramienta para parsearlo y convertirlo en tablas editables. Al terminar, la herramienta reconstruye todo a formato SNBT (respetando los tipos originales de datos como bytes `b`, enteros, diccionarios y arrays) listo para copiar y pegar de nuevo en tu modpack.

---

## 🛠️ Stack Tecnológico
- **Frontend Framework:** React 
- **Build Tool:** Vite
- **Styling:** CSS puro y moderno con estética Glassmorphism, adaptado a esquemas oscuros.
- **Parser SNBT:** Motor de parsing y stringify personalizado para mantener la fidelidad de los datos del mod FTB Quests.

---

## 🚀 Cómo Empezar Localmente

1. **Clonar e instalar dependencias:**
   Abre tu terminal en el directorio del proyecto y ejecuta:
   ```bash
   npm install
   ```
2. **Levantar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
3. **Producción:**
   Para compilar los recursos optimizados listos para producción:
   ```bash
   npm run build
   ```
