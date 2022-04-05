# Contributing

## What is needed?

### Refactor JavaScript
sleek is written in plain vanilla JavaScript. I'm doing my best to keep the code as slim and tidy as possible. But I'm not a professional developer and limited on time I can invest into this project. You can contribute by reviewing the JavaScript with the aim of making sleek faster and more maintainable.

### Clean up the CSS
In order to create sleeks' unique look a lot of (S)CSS had been written. If you have experience in CSS you can review and optimise it.

### Work on feature requests
Over the time plenty of feature requests had been added to sleeks backlog: https://github.com/ransome1/sleek/issues. You can simply pick a feature request and start working on it. Every feature needs to be contributed with a sufficient amount of test cases (see "Write test cases"). There is a prioritised backlog too: https://github.com/ransome1/sleek/projects/2

### Enhance the CI process
sleek is being distributed through Github and many other platforms (Snap Store, Flathub, Arch User Repository, Windows Store, Mac App Store). Releasing sleek is still plenty of work and it would be of great help if the releasing process would be further automated. For instance the build process on Flathub or AUR could be triggered on tag creation on Github. The current CI configuration can be found here: https://github.com/ransome1/sleek/blob/develop/.github/workflows/github-ci.yml

### Enhance the design
If you have interface design experience you can propose design changes. As sleek has a strong focus on its design, all changes should be discussed before any implementation is being done.

### Translate sleek into your language
Plenty of languages are already available, but if yours is missing, you can translate the app to it.

### Write test cases
Test cases are written for the Playwright end to end testing environment: https://playwright.dev/docs/api/class-playwright. Creating cases it pretty much straight forward and you can take a look on how it has been done so far: https://github.com/ransome1/sleek/blob/master/test/playwright.spec.js