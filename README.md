# sleek

![image](https://github.com/ransome1/sleek/assets/11188741/304d2da2-e8bd-4901-9d12-04a0f5426317)

### sleek is an open-source (FOSS) todo manager based on the todo.txt syntax. It's available for Windows, macOS and Linux

sleek is an open-source (FOSS) todo manager based on the [todo.txt syntax](https://github.com/todotxt/todo.txt). Stripped down to only the most necessary features, and with a clean and simple interface, sleek aims to help you focus on getting things done.

All classic todo.txt attributes are supported and enhanced by additional features. Creating todos is straightforward, and tag-based filtering in tandem with highly customisable grouping and smart full-text search allows for rapid information retrieval. Completed todos can be hidden or archived into separate done.txt files. Easy integration with other todo.txt apps is facilitated by continuously scanning todo.txt files for changes.

sleek is available for Windows, macOS and Linux, and in several languages. [Screenshots can be found here](https://github.com/ransome1/sleek/wiki/Screenshots). For more detailed information, [please refer to the sleek wiki](https://github.com/ransome1/sleek/wiki).

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

### ❤️ Sponsor sleek

Pushing sleek to the Apple and Microsoft app stores creates annual costs. You can help covering these by [sponsoring the project](https://github.com/sponsors/ransome1).

### 👩🏾‍💻 This project needs your support

sleek's backlog is becoming increasingly populated, yet our capacity is limited. If you are skilled in `React`, `TypeScript`, `Electron`, or `vitest` you can support this project. We need to continue refactoring the code, build reliable test coverage, and reduce bugs. Here you'll find our backlog: https://github.com/users/ransome1/projects/3. For those interested, [we've updated our contribution guidelines](https://github.com/ransome1/sleek/wiki/Contributing-Guidelines). The `develop` branch reflects the most recent progress.

### Get sleek from Apple Mac App Store

<a href="https://apps.apple.com/de/app/sleek-todo-txt-manager/id1614704209?mt=12&itscg=30200&itsct=apps_box_badge&mttnsubad=1614704209" style="display: inline-block;">
<img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1648771200" alt="Download on the App Store" style="vertical-align: middle; object-fit: contain;" width='180' />
</a>

### Get sleek from Microsoft Store

<a href="//www.microsoft.com/store/apps/9NWM2WXF60KR?cid=storebadge&ocid=badge" target="blank"><img src='https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png' alt='English badge' width='180'/></a>

### Get sleek from Snap Store

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

Install sleek from [Snap Store](https://snapcraft.io/sleek) using: `sudo snap install sleek`

### Get sleek from Flathub

<a href="https://flathub.org/apps/details/com.github.ransome1.sleek" target="blank"><img width='180' alt="Download on Flathub" src="https://flathub.org/assets/badges/flathub-badge-en.png"/></a>

Install sleek from [Flathub](https://flathub.org/apps/details/com.github.ransome1.sleek) using: `flatpak install flathub com.github.ransome1.sleek`

Run it using: `flatpak run com.github.ransome1.sleek`

### Get sleek from Homebrew

Install sleek from [Homebrew](https://formulae.brew.sh/cask/sleek-app).

`brew install --cask sleek-app`

### Get sleek from Arch User Repository

Install sleek from [AUR](https://aur.archlinux.org/packages/sleek/).

1. Setup [Yay](https://github.com/Jguer/yay#installation)
2. `yay -S sleek`

### Download sleek

You can download sleek for Windows, macOS and Linux from

- [SourceForge](https://sourceforge.net/p/sleek/)
- [GitHub](https://github.com/ransome1/sleek/releases/latest)