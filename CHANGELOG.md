# SNBT Editor - Actualización de Tipos de Tasks y Rewards

## Resumen de Cambios

La aplicación ha sido actualizada para soportar todos los tipos de **tasks** y **rewards** encontrados en los archivos SNBT de FTBQuests.

## Nuevos Archivos Creados

### 1. `src/utils/questTypes.js`
Define todos los tipos de tasks y rewards con sus propiedades:

**Tipos de Tasks Soportados:**
- `item` - Tareas de recolección de items
- `checkmark` - Tareas manuales de verificación
- `kill` - Tareas de matar entidades
- `dimension` - Tareas de visitar dimensiones
- `biome` - Tareas de visitar biomas
- `advancement` - Tareas de logros
- `structure` - Tareas de encontrar estructuras
- `location` - Tareas de ubicación específica
- `xp` - Tareas de obtener XP
- `observation` - Tareas de observación
- `loot` - Tareas de loot tables
- Tasks de mods personalizados (naturesaura, productivebees)

**Tipos de Rewards Soportados:**
- `item` - Recompensas de items
- `xp` - Recompensas de experiencia
- `xp_levels` - Recompensas de niveles de experiencia
- `choice` - Recompensas de elección
- `command` - Recompensas de comandos
- `loot` - Recompensas de loot tables
- `random` - Recompensas aleatorias
- `toast` - Notificaciones toast
- `blood` - Recompensas de blood (mod específico)

### 2. `src/components/DynamicFields.jsx`
Componentes React que renderizan campos dinámicamente según el tipo:

- **`TaskFields`** - Renderiza campos específicos para cada tipo de task
- **`RewardFields`** - Renderiza campos específicos para cada tipo de reward

## Archivos Modificados

### `src/components/QuestEditor.jsx`
- Ahora usa `TaskFields` y `RewardFields` para renderizar campos dinámicamente
- Muestra el tipo de task/reward en el formulario
- Los campos se adaptan automáticamente al tipo

### `src/components/TableView.jsx`
- **Tabla de Tasks**: Agregadas columnas para:
  - `Entity/Dim/Biome` - Muestra entity, dimension, biome, advancement o structure según el tipo
  - `Value` - Muestra valores numéricos (kill count, xp, etc.)
  
- **Tabla de Rewards**: Agregadas columnas para:
  - `Count/Amount` - Muestra count o amount según el tipo de reward
  - `XP/XP Levels` - Muestra xp o xp_levels
  - `Command` - Muestra comandos para rewards tipo command

## Características Principales

### 1. Campos Específicos por Tipo de Task

#### ITEM Task
- Item ID
- Count
- Consume Items (checkbox)
- Match Components (opcional)

#### KILL Task
- Entity ID
- Kill Count (con sufijo L)

#### DIMENSION Task
- Dimension (ej: minecraft:overworld)

#### BIOME Task
- Biome (ej: minecraft:plains)

#### ADVANCEMENT Task
- Advancement
- Criterion (opcional)

#### LOCATION Task
- Position [x, y, z]
- Size [width, height, depth]
- Ignore Dimension (checkbox)

### 2. Campos Específicos por Tipo de Reward

#### ITEM Reward
- Item ID
- Count
- Random Bonus (opcional)

#### XP Reward
- XP Amount

#### XP_LEVELS Reward
- XP Levels

#### COMMAND Reward
- Command
- Permission Level
- Silent (checkbox)

### 3. Preservación de Tipos SNBT

El editor preserva correctamente:
- Valores booleanos como `true`/`false` (no como 0/1)
- Números con sufijos (`L` para long, `d` para double, etc.)
- Estructuras anidadas de objetos

## Uso

### Editar Tasks
1. Abre el QuestEditor para una quest
2. Ve a la pestaña "Tasks"
3. Los campos mostrados se adaptarán automáticamente al tipo de task
4. Edita los valores según el tipo

### Editar Rewards
1. Abre el QuestEditor para una quest
2. Ve a la pestaña "Rewards"
3. Los campos mostrados se adaptarán automáticamente al tipo de reward
4. Edita los valores según el tipo

### Tabla de Tasks
- Muestra todas las tasks con columnas adaptadas
- Filtra por Quest ID, Task ID, Type, Item ID, Entity, etc.
- Edita directamente en la tabla

### Tabla de Rewards
- Muestra todas las rewards con columnas adaptadas
- Filtra por Quest ID, Reward ID, Type, Item ID, Command, etc.
- Edita directamente en la tabla

## Notas Técnicas

- Los valores SNBT con sufijos (L, d, b, f, s) se preservan como objetos con `_snbt_number: true`
- Los valores booleanos se mantienen explícitamente como `true` o `false`
- Los campos vacíos u opcionales no se muestran en la tabla
- Los tipos de tasks/rewards personalizados de mods muestran mensaje genérico

## Compatibilidad

La aplicación es compatible con:
- FTBQuests 2001.x
- Minecraft 1.20+
- Todos los tipos de tasks y rewards estándar
- Tasks y rewards de mods populares (Nature's Aura, Productive Bees, etc.)
