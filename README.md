[![sleek](https://snapcraft.io/sleek/badge.svg)](https://snapcraft.io/sleek)
# sleek
## A simple todo manager based on the concept of todo.txt
sleek is a simple todo manager based on the <a href="https://github.com/todotxt/todo.txt">concept of todo.txt</a>. That means you will use a simple but powerful syntax to add contexts and projects to your todos, you will prioritize them or set due dates. According to this input you will be able to filter or search your todos. There is no cloud integration, but as sleek writes your data to a plain text file, you can put anywhere you want. That also means if you don't have sleek at hand or if you don't like it anymore you can just edit the todo.txt file with any text editor or other todo.txt application.

### Please contribute
You can help this project by contributing <a href="https://github.com/ransome1/sleek/issues">bug reports</a>, code improvements or even new features. Also if you want to use sleek in your own language, feel free to translate it and help the project by contributing your translations. To do so just duplicate the "src/locales/en" folder, rename it according to your language code, do your translations in the "translation.json" file and send me a <a href="https://help.github.com/articles/using-pull-requests/">pull request</a>. I will include your translations into the next release.

![Alt text](assets/screenshots/main_light.png?raw=true "Screenshot of sleek")

![Alt text](assets/screenshots/main_filter_dark.png?raw=true "Screenshot of sleek in dark mode")

### Get it from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### or download the binary
You can find binaries for Windows, MacOS and Linux on the <a href="https://github.com/ransome1/sleek/releases/latest">release page</a>.

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
  - Contexts
  - Projects
  - Due dates
  - Start dates
* Todos can be filtered by contexts and projects
* Filters are sorted alphanummerically
* Todos can be looked up using full-text search
* A due date can be set using a datepicker
* Hyperlinks are detected automatically and can be clicked using the icon
* Todos that include either contexts or projects can be shown or hidden
* Dark and light mode can be toggled
* A file watcher rereads the file if it has been changed
* Multiple languages are automatically detected
  - German
  - English
  - Italian
* Useful tabindex
* Basic keyboard shortcuts are available:
  - New todo: CMD/CTRL + n
  - Find todo: CMD/CTRL + f
  - Open file: CMD/CTRL + o
  - Show or hide completed todos: CMD/CTRL + h
  - Toggle dark mode: CMD/CTRL + d

### To be done
* Notification function for due dates
* Extensive testing & bug fixing
* Improvements on older hardware
* Code refinement and better error handling
* Interactive guidance when adding new todos

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://www.electron.build/
- Electron packager (only for the Snap builds): https://github.com/electron/electron-packager
- electron-util: https://github.com/sindresorhus/electron-util
- Bulma CSS: https://bulma.io/
- Font Awesome: https://fontawesome.com
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
