[![sleek](https://snapcraft.io/sleek/badge.svg)](https://snapcraft.io/sleek)
# sleek
## A simple todo manager based on the concept of todo.txt
sleek is a simple todo manager based on the <a href="https://github.com/todotxt/todo.txt">concept of todo.txt</a>. That means you will use a simple but powerful syntax to add contexts and projects to your todos, you will prioritize them or set due dates. According to this input you will be able to filter or search your todos. There is no cloud integration, but as sleek writes your data to a plain text file, you can put anywhere you want. That also means if you don't have sleek at hand or if you don't like it anymore you can just edit the todo.txt file with any text editor or other todo.txt application.

### Please contribute
You can help this project by contributing <a href="https://github.com/ransome1/sleek/issues">bug reports</a>, code improvements or even new features. Also if you want to use sleek in your own language, feel free to translate it and help the project by contributing your translations. To do so just duplicate the "src/locales/en" folder, rename it according to your language code, do your translations in the "translation.json" file and send me a <a href="https://help.github.com/articles/using-pull-requests/">pull request</a>. I will include your translations into the next release.

![Alt text](assets/screenshots/main_light.png?raw=true "Screenshot of sleek")

![Alt text](assets/screenshots/main_dark.png?raw=true "Screenshot of sleek in dark mode")

### Get it from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install --beta sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### or download the binary
You can find binaries for Windows, MacOS and Linux on the <a href="https://github.com/ransome1/sleek/releases/latest">release page</a>.

### Features
* [x] An existing todo.txt file can be used or a new one can be created
* [x] Todos can be added, edited, marked as complete (and vice versa) or deleted
* [x] Completed todos can be shown or hidden
* [x] Todos are grouped by priority
* [x] Todos are sorted by due date within priority groups
* [x] Todos can be enriched by contexts, projects, due dates, start dates
* [x] Todos can be filtered by contexts and projects
* [x] Todos can be looked up using a full-text search
* [x] A due date can be set using a datepicker
* [x] Hyperlinks are detected and can be accessed by click
* [x] Basic keyboard shortcuts are available: CMD/CTRL + n (new todo), CMD/CTRL + f (find todo), CMD/CTRL + o (open file), CMD/CTRL + h (hide completed todos), CMD/CTRL + d (toggle dark mode))
* [x] Todos that include either contexts or projects can be shown or hidden
* [x] Dark and light mode can be toggled
* [x] A file watcher rereads the file if it has been changed (by hand or any other todo.txt application)
* [x] Multiple languages are supported (English & German are implemented so far)
* [x] Useful tabindex

### To be done
* [ ] Notification function for due dates
* [ ] Extensive testing & bug fixing
* [ ] Improvements on older hardware
* [ ] Code refinement and better error handling
* [ ] Interactive guidance when adding new todos

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://www.electron.build/
- Bulma CSS: https://bulma.io/
- Font Awesome: https://fontawesome.com
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
