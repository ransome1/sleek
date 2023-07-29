# sleek

## Are you familiar with writing effective tests or do you have experience working with React?
I am presently seeking developers who can assist me in creating both `end-to-end` and `unit` tests. I started writing unit tests but just cannot keep up with it.

Additionally, I would greatly appreciate help from someone experienced in `React` to review our existing components and aid in refactoring them.

I invite you to explore the current state of development on GitHub at the following link: https://github.com/ransome1/sleek/tree/2.x. This will give you an opportunity to see the progress I've made so far.

Here you can find the updated contribution guidelines: https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md. Your contributions will be greatly appreciated and will help propel the development of sleek to new heights.

## sleek is an open-source (FOSS) todo manager based on the todo.txt syntax. It's available for Windows, MacOS and Linux
+ [Screenshots](#screenshots)
+ [Development](#development)
+ [Support sleek](#support-sleek)
+ [Sponsor sleek](#sponsor-sleek)
+ [Get it from Mac App Store](#get-sleek-from-apple-mac-app-store)
+ [Get it from Microsoft Store](#get-sleek-from-microsoft-store)
+ [Get it from Snap Store](#get-sleek-from-snap-store)
+ [Get it from Flathub](#get-sleek-from-flathub)
+ [Get it from Homebrew](#get-sleek-from-homebrew)
+ [Get it from Arch User Repository](#get-sleek-from-arch-user-repository)
+ [Download it](#download-sleek)
+ [Build it from source code](#build-sleek-from-source-code)
+ [Features](#features)
+ [Used libraries](#used-libraries)

sleek is an open-source (FOSS) todo manager based on the todo.txt syntax. Stripped down to only the most necessary features, and with a clean and simple interface, sleek aims to help you focus on getting things done.

All classic todo.txt attributes are supported and enhanced by additional features. Creating todos is straightforward, and tag-based filtering in tandem with highly customisable grouping and smart full-text search allow for rapid information retrieval. Completed todos can be hidden or archived into separate done.txt files. Easy integration with other todo.txt apps is facilitated by continuously scanning todo.txt files for changes.

sleek is available for Windows, MacOS and Linux, and in several languages. For a detailed list of features, see below. Many useful information can be found in <a href="https://github.com/ransome1/sleek/wiki">sleek's wiki</a>.

### Screenshots
![Alt text](assets/screenshots/mac/main.png?raw=true "Screenshot of sleek's todo list view")
![Alt text](assets/screenshots/mac/drawer.png?raw=true "Screenshot of sleek's auto complete function and multi line todo feature")

### Development
A prioritized backlog of new features and known issues as well as an overview on what is being worked on at the moment can be found <a href="https://github.com/ransome1/sleek/projects/2">here</a>.

### Support sleek
* Star, fork and watch it on Github.
* Review it on <a href="https://apps.apple.com/us/app/sleek-todo-manager/id1614704209" target="blank">Mac App Store</a>, <a href="https://sourceforge.net/projects/sleek/reviews" target="blank">SourceForge</a> or <a href="https://www.microsoft.com/store/apps/9NWM2WXF60KR" target="blank">Windows Store</a>
* <a href="https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md">Contribute to sleek</a>

### Sponsor sleek
Pushing sleek to Apple's and Micosoft's app stores creates anual costs. You can support me by covering these costs and <a href="https://github.com/sponsors/ransome1">sponsor me</a>.

### Get sleek from Apple Mac App Store
<a href="https://apps.apple.com/us/app/sleek-todo-manager/id1614704209" target="blank"><img src='assets/store_badges/Download_on_the_Mac_App_Store.png' alt='Get sleek from Apple Mac App Store' width='180'/></a>

### Get sleek from Microsoft Store
<a href="//www.microsoft.com/store/apps/9NWM2WXF60KR?cid=storebadge&ocid=badge" target="blank"><img src='https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png' alt='English badge' width='180'/></a>

### Get sleek from Snap Store
[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

Install sleek from <a href="https://snapcraft.io/sleek" target="blank">Snap Store</a> using: `sudo snap install sleek`

### Get sleek from Flathub
<a href="https://flathub.org/apps/details/com.github.ransome1.sleek" target="blank"><img width='180' alt="Download on Flathub" src="https://flathub.org/assets/badges/flathub-badge-en.png"/></a>

Install sleek from <a href="https://flathub.org/apps/details/com.github.ransome1.sleek" target="blank">Flathub</a> using: `flatpak install flathub com.github.ransome1.sleek`

Run it using: `flatpak run com.github.ransome1.sleek`

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
5. The binaries will be placed in the working directory, in a subfolder named `dist`

### Features
* Uses existing todo.txt files or creates new ones
* Add and search for todos by
  - priorities
  - contexts
  - projects
  - due dates
  - creation dates
  - recurrences (repeating todos)
  - threshold dates
* Sort and group todos by priority, due and creation date, context and project or as they occur in the text file
* Filter todos by context, project and priority
* Find todos using full-text search compatible with todo.txt syntax
* Inline autocomplete available
* Dates and priorities can be selected by built-in picker elements 
* Navigable via keyboard shortcuts
* Tabindex available
* Options for due date reminders and notification badges
* Easily toggle between dark and light mode
* Compact view and zoom available
* Completed todos can be shown, hidden and archived
* Multi line todos can be created
* Filters are sorted alphanummerically and can be renamed or deleted
* Hyperlinks detected automatically
* File watcher scans todo.txt files for changes
* Simultaneously manage multiple todo.txt files
* Language options
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
  - Polish
  - Russian

A more detailed documentation can be found in <a href="https://github.com/ransome1/sleek/wiki/">sleeks wiki</a>.

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://github.com/electron-userland/electron-builder
- Electron Notarize: https://github.com/electron/electron-notarize
- Electron Windows Badge: https://github.com/viktor-shmigol/electron-windows-badge
- electron-reloader: https://github.com/sindresorhus/electron-reloader
- Bulma CSS: https://github.com/jgthms/bulma
- Font Awesome: https://github.com/FortAwesome/Font-Awesome
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- Marked: https://github.com/markedjs/marked
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
- i18next-fs-backend: https://github.com/i18next/i18next-fs-backend
- Matomo: https://github.com/matomo-org/matomo
- chokidar: https://github.com/paulmillr/chokidar
- Sugar: https://github.com/andrewplummer/Sugar
- PEG.js: https://github.com/pegjs/pegjs
- Playwright: https://github.com/microsoft/playwright 
- Sass: https://github.com/sass/sass
- eslint: https://github.com/eslint/eslint
