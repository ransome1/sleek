# sleek
[![Code scan and test cases](https://github.com/ransome1/sleek/actions/workflows/code-scan.yml/badge.svg?branch=develop)](https://github.com/ransome1/sleek/actions/workflows/code-scan.yml)
[![sleek](https://snapcraft.io/sleek/badge.svg)](https://snapcraft.io/sleek)

## ❤️ Become a contributer.
[sleek is currently being rewritten.](https://github.com/ransome1/sleek/discussions/501) Now is a good time to join us in our mission to provide a user-friendly, free, and open-source todo.txt client. We're actively inviting passionate contributors skilled in `React`, `TypeScript`, `Electron`, and `Jest/Playwright` to join our collaborative effort. The `develop` branch reflects the most recent progress. Here you'll find our roadmap: https://github.com/users/ransome1/projects/3.

For those interested, we've updated our contribution guidelines, which you can find here: https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md.

## sleek is an open-source (FOSS) todo manager based on the todo.txt syntax. It's available for Windows, MacOS and Linux
sleek is an open-source (FOSS) todo manager based on the todo.txt syntax. Stripped down to only the most necessary features, and with a clean and simple interface, sleek aims to help you focus on getting things done.

All classic todo.txt attributes are supported and enhanced by additional features. Creating todos is straightforward, and tag-based filtering in tandem with highly customisable grouping and smart full-text search allows for rapid information retrieval. Completed todos can be hidden or archived into separate done.txt files. Easy integration with other todo.txt apps is facilitated by continuously scanning todo.txt files for changes.

sleek is available for Windows, MacOS and Linux, and in several languages. For a detailed list of features, see below. Useful information can be found in <a href="https://github.com/ransome1/sleek/wiki">sleek's wiki</a>.

+ [Sponsor sleek](#sponsor-sleek)
+ [Get sleek from Apple Mac App Store](#get-sleek-from-apple-mac-app-store)
+ [Get sleek from Microsoft Store](#get-sleek-from-microsoft-store)
+ [Get sleek from Snap Store](#get-sleek-from-snap-store)
+ [Get sleek from Flathub](#get-sleek-from-flathub)
+ [Get sleek from Homebrew](#get-sleek-from-homebrew)
+ [Get sleek from Arch User Repository](#get-sleek-from-arch-user-repository)
+ [Download sleek](#download-sleek)
+ [Build sleek from source code](#build-sleek-from-source-code)
+ [sleek's features](#sleeks-features)

### Sponsor sleek
Pushing sleek to the Apple and Microsoft app stores creates annual costs. You can help covering these by <a href="https://github.com/sponsors/ransome1">sponsoring the project</a>.

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
1. Setup <a href="https://docs.github.com/en/github/getting-started-with-github/set-up-git" target="blank">Git</a> and <a href="https://nodejs.org/" target="blank">node.js</a>.
2. Clone sleek `git clone https://github.com/ransome1/sleek.git` and cd into sleek's directory
3. Install dependencies `npm install`
4. Build and package sleek `npm run package`
5. The binaries will be placed in the working directory, in a subfolder named `release/build`

### sleek's features
* Uses existing todo.txt files or creates new ones
* Add and search for todos by
  - priority
  - context
  - project
  - due date
  - creation date
  - completion date
  - recurrence (repeating todo)
  - threshold dates
  - pomodoro timer
* Filter, sort, and group todos by all available attributes
* Invert the sorting of each group
* Find todos using full-text search compatible with todo.txt syntax
* Inline autocomplete available for adding contexts and projects
* Dates and priorities can be selected by built-in picker elements 
* Navigable via keyboard shortcuts
* Tabindex available
* Due date notifications
* Toggle between dark and light mode
* Compact view and zoom available
* Completed todos can be shown, hidden, and archived
* Multiline todos can be created
* Filters are sorted alphanummerically
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

A more detailed documentation can be found in <a href="https://github.com/ransome1/sleek/wiki/">sleek's wiki</a>.