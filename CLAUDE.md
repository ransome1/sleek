# CLAUDE.md - AI Assistant Guide for Sleek0

## Project Overview

**Sleek0** is a minimal todo.txt manager for macOS built with Electron, React, and TypeScript. It provides a clean, intuitive interface for managing tasks using the open [todo.txt syntax](https://github.com/todotxt/todo.txt), enhanced with a scientifically-grounded task management methodology.

- **Version:** 2.0.22
- **License:** MIT
- **Platform:** macOS (arm64 and x64)

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Electron 39.0.0, Node.js 22+ |
| UI Framework | React 19.1.0 |
| Language | TypeScript 5.8.3 (strict mode) |
| Build Tool | electron-vite 4.0.0 |
| Packaging | electron-builder 26.0.12 |
| UI Library | Material-UI (MUI) 7.2.0 |
| Styling | SASS, Emotion (CSS-in-JS) |
| State Storage | electron-store 11.0.2 |
| Testing | Vitest 4.0.14 |
| Parser Generator | Peggy 5.0.5 (for filter language) |
| i18n | react-i18next 16.0.0, i18next 25.3.2 |
| Date Handling | dayjs 1.11.13, luxon 3.7.1 |
| Drag & Drop | @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0 |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SLEEK APPLICATION                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼─────┐      ┌─────▼─────┐
    │   Main   │◄────►│  Renderer │
    │ Process  │ IPC  │  Process  │
    │(Electron)│      │ (React)   │
    └────┬─────┘      └─────┬─────┘
         │                   │
    ┌────▼──────────┐   ┌────▼────────────┐
    │ File System   │   │ UI Components   │
    │ - Watcher     │   │ - Grid Views    │
    │ - Read/Write  │   │ - Calendar      │
    │ - Archive     │   │ - Bi-Daily View │
    └────┬──────────┘   │ - Smart Views   │
         │              └─────────────────┘
    ┌────▼──────────────┐
    │ Data Processing   │
    │ - Filters/Search  │
    │ - BiDaily Units   │
    │ - Quota System    │
    │ - Review System   │
    └───────────────────┘
```

## Directory Structure

```
sleek/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # App entry point, window management
│   │   ├── IpcMain.ts           # IPC handlers (main↔renderer bridge)
│   │   ├── config.ts            # App configuration with migrations
│   │   ├── Stores.ts            # Persistent storage (electron-store)
│   │   ├── Menu.ts              # Application menu & shortcuts
│   │   ├── Tray.ts              # System tray integration
│   │   ├── Theme.ts             # Dark/light theme management
│   │   ├── Notifications.ts     # Desktop notifications
│   │   ├── DataRequest/         # Business logic
│   │   │   ├── DataRequest.ts   # Main data query/filtering
│   │   │   ├── BiDailyUnit.ts   # Bi-daily task grouping (A/B/C units)
│   │   │   ├── QuotaSystem.ts   # 1-2-3-5 quota management
│   │   │   ├── ReviewSystem.ts  # Task review tracking
│   │   │   ├── CreateTodoObjects.ts
│   │   │   ├── CreateRecurringTodo.ts
│   │   │   ├── ChangeCompleteState.ts
│   │   │   ├── RestorePreviousPriority.ts
│   │   │   ├── Group.ts         # Task grouping logic
│   │   │   └── Sort.ts          # Sorting logic
│   │   ├── File/                # File system operations
│   │   │   ├── File.ts          # File metadata
│   │   │   ├── Watcher.ts       # File change monitoring (chokidar)
│   │   │   ├── Write.ts         # Write todos to file
│   │   │   ├── Archive.ts       # Archive to done.txt
│   │   │   ├── Active.ts        # Active file state
│   │   │   └── Dialog.ts        # File selection dialogs
│   │   └── Filters/             # Filter system
│   │       ├── FilterLang.pegjs # PEG grammar (compiled to TS)
│   │       ├── FilterLang.ts    # Generated parser
│   │       ├── FilterLang.d.ts  # Parser type definitions
│   │       ├── FilterQuery.ts   # Query execution
│   │       ├── Filters.ts       # Filter definitions
│   │       └── Search.ts        # Search implementation
│   │
│   ├── renderer/                # React UI
│   │   ├── App.tsx              # Root component with state management
│   │   ├── index.tsx            # React mount point
│   │   ├── IpcRenderer.tsx      # Renderer IPC communication hooks
│   │   ├── Grid/                # Task list & view modes
│   │   │   ├── Grid.tsx         # Task list container (drag & drop)
│   │   │   ├── Row.tsx          # Single task row
│   │   │   ├── DraggableRow.tsx # Draggable row with @dnd-kit
│   │   │   ├── Group.tsx        # Task group renderer
│   │   │   ├── Renderer.tsx     # Dynamic view renderer
│   │   │   ├── CalendarView.tsx # Month/week calendar display
│   │   │   ├── BiDailyView.tsx  # Bi-daily unit grouping view
│   │   │   ├── EnergyView.tsx   # Batch processing energy indicator
│   │   │   ├── QuotaDashboard.tsx # Priority quota display
│   │   │   ├── ViewModeSwitcher.tsx # Normal/focus/batch modes
│   │   │   └── DatePickerInline.tsx
│   │   ├── Header/              # Top bar
│   │   │   ├── Header.tsx       # Main header
│   │   │   ├── FileTabs.tsx     # Multiple file tabs
│   │   │   ├── QuickAddBar.tsx  # Natural language quick add
│   │   │   ├── LanguageSwitcher.tsx # EN/中文 toggle
│   │   │   └── Search/          # Search functionality
│   │   │       ├── Search.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Option.tsx
│   │   ├── Drawer/              # Sidebar panel
│   │   │   ├── Drawer.tsx       # Main drawer with tabs
│   │   │   ├── Attributes.tsx   # Task attributes editor
│   │   │   ├── Filters.tsx      # Filter management
│   │   │   ├── Sorting.tsx      # Sort options
│   │   │   └── SmartViews.tsx   # Today/Next7Days/All views
│   │   ├── Batch/               # Batch operations
│   │   │   └── BatchOperationsBar.tsx # Bulk actions
│   │   ├── Dialog/              # Task creation/editing modal
│   │   │   ├── Dialog.tsx       # Main edit dialog
│   │   │   ├── DatePicker.tsx   # Date selection
│   │   │   ├── PriorityPicker.tsx # Priority A-D selector
│   │   │   ├── RecurrencePicker.tsx # Recurrence pattern
│   │   │   ├── PomodoroPicker.tsx # Pomodoro time estimation
│   │   │   └── AutoSuggest.tsx  # Context/project autocomplete
│   │   ├── Review/              # Review modals
│   │   │   ├── ReviewModal.tsx  # Unit review (A/B/C units)
│   │   │   └── WeeklyReviewModal.tsx # Weekly summary review
│   │   ├── Settings/            # Settings modal
│   │   │   ├── Settings.tsx     # Configuration UI
│   │   │   └── LanguageSelector.tsx # i18n provider
│   │   ├── Navigation.tsx       # Left sidebar navigation
│   │   ├── ContextMenu.tsx      # Right-click context menu
│   │   ├── Prompt.tsx           # Confirmation dialogs
│   │   ├── Archive.tsx          # Archive view modal
│   │   ├── SplashScreen.tsx     # Loading screen
│   │   ├── Themes.tsx           # Theme definitions
│   │   ├── Shared.tsx           # Shared utilities & hooks
│   │   └── *.scss               # Component styles
│   │
│   ├── preload/                 # Electron preload scripts
│   │   └── index.ts             # Context bridge (secure IPC)
│   │
│   ├── locales/                 # i18n translations (16 languages)
│   │   ├── en.json, zh.json     # Primary languages
│   │   ├── de.json, fr.json, es.json, it.json
│   │   ├── pt.json, pt-br.json, jp.json, ko.json
│   │   └── ru.json, pl.json, cs.json, tr.json, hu.json, hi.json
│   │
│   └── Types.ts                 # Shared TypeScript interfaces
│
├── docs/                        # Documentation
│   └── METHODOLOGY.md           # Task management methodology
├── build/                       # Build resources (icons, entitlements)
├── resources/                   # App resources
├── electron-builder.yml         # Packaging configuration
├── electron.vite.config.ts      # Vite + Electron config
├── tsconfig.json                # Base TypeScript config
├── tsconfig.node.json           # Main/preload TS config
└── tsconfig.web.json            # Renderer TS config
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run coverage

# Type checking
npm run typecheck

# Build application
npm run build

# Build macOS DMG
npm run build:mac

# Build for Mac App Store
npm run build:mas

# Regenerate filter parser from PEG grammar
npm run peggy
```

## IPC Channels

The main and renderer processes communicate via Electron IPC. Key channels:

### Data & Filtering
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `requestData` | renderer→main→renderer | Request filtered todo data |
| `writeTodoToFile` | renderer→main | Save todo changes |
| `updateAttributeFields` | renderer→main→renderer | Update todo object |
| `updateTodoObject` | renderer→main→renderer | Modify specific attribute |
| `removeLineFromFile` | renderer→main | Delete todo |
| `reorderTodo` | renderer→main | Change task order (drag & drop) |

### File Management
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `setFile` / `removeFile` / `addFile` | renderer→main | File operations |
| `openFile` / `createFile` | renderer→main | File dialogs |
| `archiveTodos` / `requestArchive` | renderer→main→renderer | Archiving |
| `saveToClipboard` | renderer→main | Copy to clipboard |
| `revealInFileManager` | renderer→main | Show in Finder |

### Configuration
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `storeGetConfig` / `storeSetConfig` | sync | Settings storage |
| `storeGetFilters` / `storeSetFilters` | sync | Filter preferences |

### Quota & Review Systems
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `getQuotaDashboard` | renderer→main→renderer | Quota status for unit |
| `getAllQuotaStatus` | renderer→main→renderer | Quota across all units |
| `quotaExceeded` | main→renderer | Notify when quota is full |
| `checkReviewTrigger` | renderer→main→renderer | Check if review should show |
| `getReviewStats` | renderer→main→renderer | Unit review statistics |
| `saveReviewNote` | renderer→main→renderer | Save review notes |
| `markReviewCompleted` | renderer→main | Mark unit reviewed |
| `getWeeklyReviewStats` | renderer→main→renderer | Weekly review data |
| `saveWeeklyReview` | renderer→main→renderer | Save weekly review |
| `skipWeeklyReview` | renderer→main→renderer | Skip weekly review |

### Batch Operations
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `batchUpdateTodo` | renderer→main | Bulk update multiple todos |

## Key Conventions

### Code Style
- Follow React coding style guide for components
- Use meaningful, descriptive variable and function names
- Write lean, efficient code - avoid unnecessary complexity
- Prioritize readability over cleverness
- Add comments only when necessary

### File Organization
- Test files colocated with source: `Module.ts` + `Module.test.ts`
- SCSS files colocated with components in renderer/
- Each main process feature has its own subdirectory

### TypeScript
- Strict type checking enabled
- Shared interfaces in `src/Types.ts`
- Use proper type annotations for function parameters and returns

### Commit Messages
- Start with verb in imperative mood (Add, Fix, Update)
- Keep subject under 50 characters
- Separate subject from body with blank line
- Reference issues when applicable: `Fixes #123`

### Testing
- Use Vitest for unit tests
- Write tests for new features and bug fixes
- Aim for high test coverage
- Run `npm test` before committing

## Key Domain Concepts

### todo.txt Format
Standard todo.txt syntax with extensions:
- Priority: `(A)`, `(B)`, `(C)`, `(D)`
- Dates: `due:YYYY-MM-DD`, `t:YYYY-MM-DD` (threshold)
- Recurrence: `rec:+1w` (weekly), `rec:+1m` (monthly)
- Projects: `+ProjectName`
- Contexts: `@ContextName`
- Key-value: `key:value`

### Bi-Daily Units
Tasks are grouped into 2-day time units for organization and review:
- **Unit A**: Sunday + Monday (11 tasks)
- **Unit B**: Tuesday + Wednesday (11 tasks)
- **Unit C**: Thursday + Friday (11 tasks)
- **Saturday**: Rest & Review day

The bi-daily structure provides antifragile buffering - if Day 1 underperforms, Day 2 allows recovery.

### Quota System (1-2-3-5)
A scientifically-grounded task management system. Priority-based limits per bi-daily unit:

| Priority | Limit | Type | Energy Level | Duration |
|----------|-------|------|--------------|----------|
| **(A)** | 1 | Core Challenge | High | ~90-120 min |
| **(B)** | 2 | Key Progress | Medium | ~45-60 min each |
| **(C)** | 3 | Standard Tasks | Low-Medium | ~25-30 min each |
| **(D)** | 5 | Admin/Batch | Any | ~10-15 min each |

**Total**: 11 tasks per unit = **5.5 tasks/day** (aligns with Ivy Lee Method's 6-task recommendation)

**Theoretical foundations** (see `docs/METHODOLOGY.md` for details):
- **Ivy Lee Method** (1903): ~6 tasks/day optimal for focus
- **Flow State Research** (Csikszentmihalyi): Deep focus for complex tasks
- **Ultradian Rhythms** (Kleitman): 90-120min natural work cycles
- **Antifragile Principles** (Taleb): Buffer time for resilience
- **Energy Management** (Schwartz): Match tasks to energy levels

### Review System
Periodic review of completed tasks with:
- **Unit reviews**: Stats calculation per bi-daily unit
- **Weekly reviews**: Summary across all units
- User notes for reflection
- Review completion tracking
- Antifragile learning from incomplete tasks

## View Modes & Features

### Grid/List View (`Grid.tsx`)
- Standard task list with drag & drop sorting
- Priority group organization
- Supports filtering and searching
- Uses @dnd-kit for drag & drop with priority zone detection

### Bi-Daily View (`BiDailyView.tsx`)
3-column layout showing Unit A, B, C with quota dashboard per unit. Supports 3 modes:
- **Normal**: Show all tasks
- **Focus**: Highlight A priority, dim others (deep work mode)
- **Batch**: Show only D priority tasks for quick batch processing

### Calendar View (`CalendarView.tsx`)
- Month/week calendar display
- Tasks displayed by due date
- Bi-daily unit indicators on calendar days
- Priority dot indicators and task count badges
- Quick task creation on date double-click
- Selected date detail panel

### Smart Views (`SmartViews.tsx`)
Quick filter buttons in drawer sidebar:
- **All**: Show all tasks (no date filter)
- **Today**: Show tasks due today
- **Next 7 Days**: Show tasks due in next week

### Quick Add Bar (`QuickAddBar.tsx`)
Natural language task creation:
- Recognizes dates: "today", "tomorrow", "next week", day names
- Chinese date support: "今天", "明天", "下周"
- Priority patterns: "!1", "!2", "high", "urgent", "紧急"
- Auto-formats to todo.txt syntax

### Batch Operations (`BatchOperationsBar.tsx`)
Multi-select and bulk actions:
- Complete multiple tasks
- Delete multiple tasks
- Archive multiple tasks
- Change priority in bulk

### Drag & Drop Sorting
- Uses `@dnd-kit/core` and `@dnd-kit/sortable`
- `DraggableRow.tsx` wraps each task
- Detects priority zone changes when dragging between groups
- Prompts for priority confirmation on cross-group drag

## Common Development Tasks

### Adding a New Feature
1. Create main process logic in `src/main/` if needed
2. Add IPC handler in `IpcMain.ts`
3. Create React components in `src/renderer/`
4. Add IPC calls in `IpcRenderer.tsx`
5. Add translations to all locale files (16 languages)
6. Write tests

### Adding a Translation
1. Add string to `src/locales/en.json`
2. Add translations to all other locale files
3. Use in component: `const { t } = useTranslation(); t('key')`

### Modifying the Filter Language
1. Edit grammar in `src/main/Filters/FilterLang.pegjs`
2. Run `npm run peggy` to regenerate parser
3. Update `FilterQuery.ts` if needed

### Adding a Setting
1. Add to `SettingsStore` schema in `src/main/Stores.ts`
2. Add migration in `src/main/config.ts` if needed
3. Add UI in `src/renderer/Settings/Settings.tsx`
4. Add translation strings

### Adding a New View Mode
1. Create component in `src/renderer/Grid/`
2. Add to `Renderer.tsx` for dynamic rendering
3. Update `ViewModeSwitcher.tsx` if needed
4. Add translations for view name

## Build & Distribution

The app is packaged using electron-builder for:
- macOS DMG (arm64 + x64)
- Mac App Store (universal binary)

Build configuration is in `electron-builder.yml`. Key settings:
- App ID: `com.todotxt.sleek`
- Hardened runtime enabled
- File associations: `.txt`, `.md`
- Dark mode support

## Troubleshooting

### Build Issues
- Run `npm run postinstall` to rebuild native deps
- Clear `node_modules` and reinstall if deps conflict

### Type Errors
- Run `npm run typecheck` to check both node and web configs
- Check `tsconfig.node.json` for main/preload issues
- Check `tsconfig.web.json` for renderer issues

### Filter Parser Issues
- Regenerate with `npm run peggy`
- Check grammar syntax in `FilterLang.pegjs`

### IPC Communication Issues
- Check channel names match between `IpcMain.ts` and `IpcRenderer.tsx`
- Verify handler is registered in both files
- Check preload script exposes the channel in `preload/index.ts`
