[![sleek](https://snapcraft.io/sleek/badge.svg)](https://snapcraft.io/sleek)
# sleek
## A simple todo manager based on the concept of todo.txt
sleek is a simple todo manager based on the <a href="https://github.com/todotxt/todo.txt">concept of todo.txt</a>. That means you will use a simple but powerful syntax to add contexts and projects to your todos, you will prioritize them or set due dates. According to this input you will be able to filter your todos using typical filter elements. There is no native cloud integration in sleek. But as sleek writes your data to a local text file you can put or sync this file anywhere you need it to be. That also means that if you don't have sleek at hand or if you don't like sleek anymore you can just edit the todo.txt file with a basic text editor or any other todo.txt app.

### Work in progress
sleek is under active development. For detailed information on what is being currently developed, what will be and what already has been, you can take a look at this <a href="https://datenkrake.eu/kanboard/?controller=BoardViewController&action=readonly&token=7a2e9e391ee6d324070a0bebcbc7a42b6eef4b19117b4cd3d434933edad9">Kanboard</a>.

![Alt text](assets/sleek.screenshot_main.png?raw=true "Screenshot of sleek")

### Get it from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install --beta sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### or download the binary
You can find binaries for Windows, MacOS and Linux on the <a href="https://github.com/ransome1/sleek/releases/latest">release page</a>.

### Done
* [x] Onboarding with two functions: Open existing todo.txt file or create a new one
* [x] Open a todo.txt file and parse it into a table (path to file will be persisted)
* [x] Todos are grouped by priority
* [x] Contexts and projects are added as tags to each item
* [x] State of completion is visible
* [x] Open todos can be checked to mark them as completed
* [x] Completed todos can be checked to mark them as in progress
* [x] New todos can be added
* [x] Existing todos can be edited
* [x] Todos can be filtered by contexts and projects (setting will be persisted)
* [x] Filters can be reset
* [x] Completed todos can be hidden (setting will be persisted)
* [x] If set the due date is shown on each todo
* [x] Basic keyboard shortcuts are available: CMD/CTRL + n (new todo), CMD/CTRL + f (show filter drawer), CMD/CTRL + o (open file), CMD/CTRL + h (hide completed todos))
* [x] Todos can be deleted
* [x] A basic tabindex is available
* [x] Due date can be set using a datepicker
* [x] Todos that include either contexts or projects or both can now be hidden (setting will be persisted)

### To be done
* [ ] Extensive testing & bug fixing
* [ ] Code refinement and better error handling
* [ ] Multi language support
* [ ] Implement a notification function for due dates
* [ ] Dark theme
* [ ] Full text search
* [ ] More visual guidance when adding new todos

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://www.electron.build/
- Bulma CSS: https://bulma.io/
- Font Awesome: https://fontawesome.com
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
