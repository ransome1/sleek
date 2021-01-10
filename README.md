# sleek
## sleek is a todo app based on todo.txt, free and open-source
sleek offers a clean and simple interface that can be used with mouse and keyboard, keyboard only or touch devices. You will use an easy to understand but powerful syntax to create todos. According to the <a href="https://github.com/todotxt/todo.txt">concept of todo.txt</a> you can add contexts to your todos or assign them to projects you're working on. Priorities can be set and if you add due dates sleek will send you notifications just in time.

All that can be done typing plain text or guided by sleeks interface that for instance will show suggestions on contexts and projects while typing, offers pickers to ease the selection of due dates or set recurrence intervals, if your todos should repeat themselves.

There is no cloud integration, but as sleek writes your todos into a plain text file, you can put it anywhere and sync it to all your devices. That also means if you don't have sleek at hand or if you don't like it any more you can just edit the todo.txt file with any text editor or other todo.txt application.

![Alt text](assets/screenshots/mac/main.png?raw=true "Screenshot of sleek's main view as seen on MacOS")
![Alt text](assets/screenshots/mac/main_filter_dark.png?raw=true "Screenshot of sleek's filter drawer in dark mode as seen on MacOS")

### Get it from Microsoft Store
You can install sleek from Microsofts Windows Store

<a href='//www.microsoft.com/store/apps/9NWM2WXF60KR?cid=storebadge&ocid=badge'><img src='https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png' alt='English badge' width='180'/></a>

### Get it from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### Get it from Flathub
Install sleek from <a href="https://flathub.org/apps/details/com.github.ransome1.sleek">Flathub</a> using: `flatpak install flathub com.github.ransome1.sleek`

Run it using: `flatpak run com.github.ransome1.sleek`

<a href='https://flathub.org/apps/details/com.github.ransome1.sleek'><img width='180' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

### Download the binary
You can find binaries for Windows, MacOS and Linux on the <a href="https://github.com/ransome1/sleek/releases/latest">release page</a>.

### This app is open source and you can help this project by
* contributing <a href="https://github.com/ransome1/sleek/issues">bug reports, code improvements, features or simply suggest new features</a>.
* opting in to the optional Matomo tracking feature. It's fully anonymized, and the data will give me a basic idea on which functions are actually used and which ones don't have a benefit you.
* translating sleek into your own language and contributing your translations. To do so just duplicate the "src/locales/en" folder, rename it according to your language code, do your translations in the "translation.json" file and send me a <a href="https://help.github.com/articles/using-pull-requests/">pull request</a>. I will include your translations into the next release.

### Features
* An existing todo.txt file can be used or a new one can be created
* Todos can be
  - added
  - edited
  - marked as complete (and vice versa)
  - deleted
* Completed todos can be shown or hidden
* Todos are grouped by priority
* Todos are sorted by due date within their priorities
* Todos can be enriched by
  - contexts
  - projects
  - start dates
  - due dates
* Todos can repeat themselves based on a given due date. You can use a dedicated picker to add the recurrence or type it in by hand:
  - "rec:d" (daily)
  - "rec:w" (weekly)
  - "rec:m" (monthly)
  - "rec:y" (annually)
* Available contexts and projects will be suggested according to your input
* Todos can be filtered by contexts and projects
* Filters are sorted alphanummerically
* Todos can be looked up using full-text search
* A due date can be set using a datepicker
* Hyperlinks are detected automatically and can be clicked using the icon
* Basic notifications: Will fire if a todo's due date is set for tomorrow or today
* Todos that include either contexts or projects can be shown or hidden entirely
* Dark and light mode can be toggled
* A file watcher rereads the file if it has been changed
* Multiple todo.txt files can be added
* Multiple languages are automatically detected or can be set by hand
  - English
  - German
  - Italian
  - Spanish
  - French
* Tabindex available
* Basic keyboard shortcuts are available:
  - New todo: CMD/CTRL + n
  - Find todo: CMD/CTRL + f
  - Show or hide completed todos: CMD/CTRL + h
  - Toggle dark mode: CMD/CTRL + d
  - Open file: CMD/CTRL + o
  - Open settings: CMD/CTRL + ,

### Contributions
- French translations by @yannicka

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://github.com/electron-userland/electron-builder
- Electron packager (only for the Snap builds): https://github.com/electron/electron-packager
- electron-util: https://github.com/sindresorhus/electron-util
- Bulma CSS: https://github.com/jgthms/bulma
- Font Awesome: https://github.com/FortAwesome/Font-Awesome
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
- Matomo: https://github.com/matomo-org/matomo
