# Sleek0

### Sleek0 is an open-source (FOSS) todo manager based on the todo.txt syntax. It's available for macOS

Sleek0 is an open-source (FOSS) todo manager based on the [todo.txt syntax](https://github.com/todotxt/todo.txt). Stripped down to only the most necessary features, and with a clean and simple interface, Sleek0 aims to help you focus on getting things done.

All classic todo.txt attributes are supported and enhanced by additional features. Creating todos is straightforward, and tag-based filtering in tandem with highly customisable grouping and smart full-text search allows for rapid information retrieval. Completed todos can be hidden or archived into separate done.txt files. Easy integration with other todo.txt apps is facilitated by continuously scanning todo.txt files for changes.

## Features

### Core Features
- **todo.txt Syntax Support**: Full support for standard todo.txt format including priorities, dates, projects, contexts, and key-value pairs
- **Recurrence**: Support for recurring tasks with flexible patterns (`rec:+1w`, `rec:+1m`, etc.)
- **Smart Filtering**: Powerful filter language with tag-based filtering and full-text search
- **Customizable Grouping & Sorting**: Organize tasks your way
- **Auto-archiving**: Move completed todos to done.txt files
- **File Watching**: Real-time sync with external changes to todo.txt files
- **Multi-language Support**: Available in 16 languages

### Advanced Features
- **Bi-Daily Units**: Group tasks into AM/PM time-based units for better daily organization
- **Quota System (1-2-3-5)**: Priority-based task limits per time unit
  - Priority A: 1 task limit
  - Priority B: 2 task limit
  - Priority C: 3 task limit
  - Priority D: 5 task limit
- **Review System**: Periodic review of completed tasks with stats and notes
- **Energy View**: Batch processing mode for bi-daily units

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Electron 39.0.0, Node.js 22+ |
| UI Framework | React 19.1.0 |
| Language | TypeScript 5.8.3 (strict mode) |
| Build Tool | electron-vite 4.0.0 |
| UI Library | Material-UI (MUI) 7.2.0 |
| Testing | Vitest 4.0.14 |
| i18n | react-i18next |

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Build application
npm run build

# Build macOS DMG
npm run build:mac
```

## License

MIT
