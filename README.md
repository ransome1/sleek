# sleek
## sleek is a todo app based on todo.txt, free and open-source. Available for Linux, Windows and MacOS
+ [Screenshots](#screenshots)
+ [Support sleek](#support-sleek)
+ [Get it from Microsoft Store](#get-sleek-from-microsoft-store)
+ [Get it from Snap Store](#get-sleek-from-snap-store)
+ [Get it from Flathub](#get-sleek-from-flathub)
+ [Get it from Homebrew](#get-sleek-from-homebrew)
+ [Get it from Arch User Repository](#get-sleek-from-arch-user-repository)
+ [Download it](#download-sleek)
+ [Build it from source code](#build-sleek-from-source-code)
+ [State of development](#sleeks-state-of-development)
+ [Features](#features)
+ [Used libraries](#used-libraries)

sleek is an open-source todo app that makes use of the todo.txt format. sleeks GUI is modern and simple but still offers a decent set of functions which help users getting things done. sleek is available as a client for Windows, MacOS and Linux.

Users can add contexts, projects, priorities, due dates, recurrences or threshold dates to their todos. These todo.txt attributes can then be used in full-text search, as filters or to group and sort the todo list.

sleek manages and watches multiple todo.txt files continuously for changes, which makes it easy to integrate sleek with other todo.txt apps. Also users can switch to dark mode and choose from multiple languages.

Todos with due date or repeating todos will trigger notifications and completed todos can be hidden or archived into separate done.txt files. If users have tons of todos, a compact view can come in handy.

### Screenshots
![Alt text](assets/screenshots/linux/todo_list.png?raw=true "Screenshot of sleek's main view on Linux")
![Alt text](assets/screenshots/linux/multiline_autocomplete_dark.png?raw=true "Screenshot of sleek's auto complete function and multi line todo feature on Linux")

### Support sleek
* Star, fork and watch it on Github.
* Review it on <a href="https://sourceforge.net/projects/sleek/reviews" target="blank">SourceForge</a> or <a href="https://www.microsoft.com/store/apps/9NWM2WXF60KR" target="blank">Windows Store</a>
* Contribute <a href="https://github.com/ransome1/sleek/issues">bug reports, code improvements or features</a>
* Translate sleek into your own language and contribute your translations

### Get sleek from Microsoft Store
You can install sleek from Microsofts Windows Store

<a href="//www.microsoft.com/store/apps/9NWM2WXF60KR?cid=storebadge&ocid=badge" target="blank"><img src='https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png' alt='English badge' width='180'/></a>

### Get sleek from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### Get sleek from Flathub
Install sleek from <a href="https://flathub.org/apps/details/com.github.ransome1.sleek" target="blank">Flathub</a> using: `flatpak install flathub com.github.ransome1.sleek`

Run it using: `flatpak run com.github.ransome1.sleek`

<a href="https://flathub.org/apps/details/com.github.ransome1.sleek" target="blank"><img width='180' alt="Download on Flathub" src="https://flathub.org/assets/badges/flathub-badge-en.png"/></a>

### Get sleek from Homebrew
Install sleek from <a href="https://formulae.brew.sh/cask/sleek" target="blank">Homebrew</a>.
`brew install --cask sleek`

### Get sleek from Arch User Repository
Install sleek from <a href="https://aur.archlinux.org/packages/sleek/" target="blank">AUR</a>.
1. Setup <a href="https://github.com/Jguer/yay#installation" target="blank">Yay</a>
2. `yay -S sleek`

### Download sleek
You can download sleek for Windows, MacOS and Linux from
- <a href="https://sourceforge.net/p/sleek/" target="blank">SourceForge</a>
- <a href="https://github.com/ransome1/sleek/releases/latest">Github</a>

### Build sleek from source code
1. Setup <a href="https://docs.github.com/en/github/getting-started-with-github/set-up-git" target="blank">Git</a>, <a href="https://nodejs.org/" target="blank">node.js</a> and <a href="https://yarnpkg.com/getting-started" target="blank">yarn</a>.
2. Clone sleek `git clone https://github.com/ransome1/sleek.git` and cd into sleeks directory
3. Install dependencies `yarn install --production`
4. Build sleek `yarn build:windows` or `yarn build:linux` or `yarn build:macos`

### sleeks state of development
A prioritized backlog of new features and known issues can be found <a href="https://github.com/ransome1/sleek/projects/2">here</a>.

### Features
* An existing todo.txt file can be used or a new one can be created
* Todos can be enriched and searched for by
  - priorities
  - contexts
  - projects
  - due dates
  - creation dates
  - <a href="https://github.com/ransome1/sleek/wiki/Recurring-todos-(rec:)">recurrences</a>
  - <a href="https://github.com/ransome1/sleek/wiki/Deferred-todos-(t:)">thresholds</a>
* Todo-List can be grouped and sorted by priorities, due dates, contexts or projects
* The sorting order can be defined on all 4 levels
* Todos can be filtered by contexts, projects and priorities
* Todos can be looked up by full-text search
* Autocomplete function suggests available contexts and projects
* <a href="https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts">Keyboard shortcuts following todotxt.net</a>
* Tabindex available
* <a href="https://github.com/ransome1/sleek/wiki/Hidden-todos">A todo can be hidden but its attributes will be available in the filter drawer and autocomplete function</a>
* Due dates trigger alarms and appear as badges in sleeks icon
* Dark and light mode can be toggled
* A compact view is available
* Completed todos can be bulk archived to a separate done.txt ([name of todo file]_done.txt) file
* Completed todos can be shown or hidden
* Multi line todos can be created
* Filters can be renamed or deleted by right clicking on them
* Filters are sorted alphanummerically
* Hyperlinks are detected automatically and can be clicked using the icon
* A file watcher rereads the todo.txt file if it has been changed
* Multiple todo.txt files can be managed and switched between using a tab bar or keyboard shortcuts
* Multiple languages are either detected or can be set by hand to
  - English
  - German
  - Italian
  - Spanish
  - French
  - Simplified Chinese
  - Brazilian Portugese
  - Japanese
  - Turkish
  - Hungarian
  - Czech
* sleek can be minimized to tray
* Existing todos can be used as templates for new ones

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://github.com/electron-userland/electron-builder
- Bulma CSS: https://github.com/jgthms/bulma
- Font Awesome: https://github.com/FortAwesome/Font-Awesome
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- Marked: https://github.com/markedjs/marked
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
- Matomo: https://github.com/matomo-org/matomo
- chokidar: https://github.com/paulmillr/chokidar
- Sugar: https://github.com/andrewplummer/Sugar
- PEG.js: https://github.com/pegjs/pegjs
