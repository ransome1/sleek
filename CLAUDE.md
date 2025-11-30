# CLAUDE.md - AI Assistant Guide for Sleek0

## Project Overview

**Sleek0** is a minimal todo.txt manager for macOS built with Electron, React, and TypeScript. It provides a clean, intuitive interface for managing tasks using the open [todo.txt syntax](https://github.com/todotxt/todo.txt).

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
| i18n | react-i18next, i18next |
| Date Handling | dayjs, luxon |

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
    │ File System   │   │ Material-UI     │
    │ - Watcher     │   │ Components      │
    │ - Read/Write  │   └─────────────────┘
    │ - Archive     │
    └────┬──────────┘
         │
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
│   │   │   ├── BiDailyUnit.ts   # Bi-daily task grouping
│   │   │   ├── QuotaSystem.ts   # 1-2-3-5 quota management
│   │   │   ├── ReviewSystem.ts  # Task review tracking
│   │   │   ├── CreateTodoObjects.ts
│   │   │   ├── CreateRecurringTodo.ts
│   │   │   ├── ChangeCompleteState.ts
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
│   │       ├── FilterQuery.ts   # Query execution
│   │       └── Filters.ts       # Filter definitions
│   │
│   ├── renderer/                # React UI
│   │   ├── App.tsx              # Root component
│   │   ├── index.tsx            # React mount point
│   │   ├── IpcRenderer.tsx      # Renderer IPC communication
│   │   ├── Grid/                # Task list display
│   │   │   ├── Grid.tsx         # Task list container
│   │   │   ├── Row.tsx          # Single task row
│   │   │   ├── BiDailyView.tsx  # Bi-daily grouping view
│   │   │   └── QuotaDashboard.tsx
│   │   ├── Dialog/              # Task creation/editing
│   │   │   ├── Dialog.tsx       # Main edit dialog
│   │   │   ├── DatePicker.tsx
│   │   │   ├── PriorityPicker.tsx
│   │   │   └── RecurrencePicker.tsx
│   │   ├── Header/              # Top bar
│   │   │   ├── Header.tsx
│   │   │   ├── FileTabs.tsx
│   │   │   └── Search/
│   │   ├── Drawer/              # Sidebar
│   │   │   ├── Drawer.tsx
│   │   │   ├── Filters.tsx
│   │   │   ├── Sorting.tsx
│   │   │   └── Attributes.tsx
│   │   ├── Settings/            # Settings modal
│   │   │   └── Settings.tsx
│   │   ├── Review/              # Review modal
│   │   │   └── ReviewModal.tsx
│   │   └── *.scss               # Component styles
│   │
│   ├── preload/                 # Electron preload scripts
│   │   └── index.ts             # Context bridge (secure IPC)
│   │
│   ├── locales/                 # i18n translations (16 languages)
│   │   ├── en.json, de.json, fr.json, es.json, it.json
│   │   ├── pt.json, pt-br.json, zh.json, jp.json, ko.json
│   │   ├── ru.json, pl.json, cs.json, tr.json, hu.json, hi.json
│   │
│   └── Types.ts                 # Shared TypeScript interfaces
│
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

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `requestData` | renderer→main→renderer | Request filtered todo data |
| `writeTodoToFile` | renderer→main | Save todo changes |
| `updateAttributeFields` | renderer→main→renderer | Update todo object |
| `archiveTodos` | renderer→main→renderer | Archive completed todos |
| `storeGetConfig` / `storeSetConfig` | sync | Settings storage |
| `storeGetFilters` / `storeSetFilters` | sync | Filter preferences |
| `setFile` / `removeFile` / `addFile` | renderer→main | File management |
| `openFile` / `createFile` | renderer→main | File dialogs |
| `getQuotaDashboard` | renderer→main→renderer | Quota status |
| `checkReviewTrigger` | renderer→main→renderer | Review system |
| `getReviewStats` | renderer→main→renderer | Review statistics |
| `saveReviewNote` | renderer→main→renderer | Save review notes |

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
- Priority: `(A)`, `(B)`, `(C)`, etc.
- Dates: `due:YYYY-MM-DD`, `t:YYYY-MM-DD` (threshold)
- Recurrence: `rec:+1w` (weekly), `rec:+1m` (monthly)
- Projects: `+ProjectName`
- Contexts: `@ContextName`
- Key-value: `key:value`

### Bi-Daily Units
Tasks are grouped into 2-day time units for organization and review:
- **Unit A**: Sunday + Monday
- **Unit B**: Tuesday + Wednesday
- **Unit C**: Thursday + Friday
- **Saturday**: Rest & Review day

The bi-daily structure provides antifragile buffering - if Day 1 underperforms, Day 2 allows recovery.

### Quota System (1-2-3-5)
A scientifically-grounded task management system. Priority-based limits per bi-daily unit:

| Priority | Limit | Type | Energy Level | Duration |
|----------|-------|------|--------------|----------|
| **(A)** | 1 | Core Challenge | High | ~90 min |
| **(B)** | 2 | Key Progress | Medium | ~45 min each |
| **(C)** | 3 | Standard Tasks | Low | ~25 min each |
| **(D)** | 5 | Admin/Batch | Any | ~10 min each |

**Total**: 11 tasks per unit = **5.5 tasks/day** (aligns with Ivy Lee Method's 6-task recommendation)

**Theoretical foundations** (see `docs/METHODOLOGY.md` for details):
- **Ivy Lee Method** (1903): ~6 tasks/day optimal for focus
- **Flow State Research** (Csikszentmihalyi): Deep focus for complex tasks
- **Ultradian Rhythms** (Kleitman): 90-120min natural work cycles
- **Antifragile Principles** (Taleb): Buffer time for resilience
- **Energy Management** (Schwartz): Match tasks to energy levels

### Review System
Periodic review of completed tasks with:
- Stats calculation per unit
- User notes for reflection
- Review completion tracking
- Antifragile learning from incomplete tasks

## Common Development Tasks

### Adding a New Feature
1. Create main process logic in `src/main/` if needed
2. Add IPC handler in `IpcMain.ts`
3. Create React components in `src/renderer/`
4. Add IPC calls in `IpcRenderer.tsx`
5. Add translations to all locale files
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
