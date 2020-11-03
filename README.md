# sleek
## A simple todo manager based on the concept of todo.txt
sleek is a simple todo manager based on the <a href="https://github.com/todotxt/todo.txt">concept of todo.txt</a>. That means you will use a simple but powerful syntax to add contexts and projects to your todos, you will prioritize them or set due dates and according to this you will be able to filter your todos. There is no native cloud integration in sleek. But as sleek writes your data to a local text file you can put or sync this file anywhere you need. That also means that if you don't have sleek at hand or if you don't like sleek anymore you can just edit the todo.txt file with any text editor or other todo.txt app.

![Alt text](assets/sleek.screenshot_mainview.png?raw=true "Screenshot of sleek")

### Ubuntu user get it from Snap Store
Ubuntu users can install an early beta version from Snap Store using: `sudo install --beta sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### or download the binary
There is also an AppImage build compatible with most Linux distributions and builds for MacOS and Windows. You can find the binaries on the <a href="https://github.com/syncthing/syncthing-macos/releases/latest">release page</a>.

### Done
* [x] Simple onboarding with two functions: Open existing todo.txt file and create a new one
* [x] Open a todo.txt file and parse it into a table
* [x] Order todos by priority
* [x] Add contexts and projects as tags to each item
* [x] Indicate status of completion
* [x] Mark todos for completion
* [x] Unmark completed todos
* [x] Add new todos
* [x] Edit existing todos
* [x] Filter todos by contexts and projects
* [x] Reset filter settings
* [x] Sort items either according to position in todo.txt file (default) or alphabetically
* [x] Show and hide completed todos
* [x] Persist path to the todo.txt file
* [x] Persist selected filters
* [x] Persist setting for sorting
* [x] Persist setting for "show completed"
* [x] Show due date
* [x] Create a new todo.txt
* [x] Push binaries to Snapcraft
* [x] Keyboard shortcuts
* [x] Delete single todos
* [x] Tabindex

### To be done
* [ ] Extensive testing & bug fixing
* [ ] Code refinement and better error handling
* [ ] Multi language support
* [ ] Implement a notification function for due dates
* [ ] Dark theme
* [ ] Full text search
* [ ] Loading indicators
* [ ] Add interactive user support on todo creation
* [ ] Drag and drop todos

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://www.electron.build/
- Bulma CSS: https://bulma.io/
- Font Awesome: https://fontawesome.com
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
