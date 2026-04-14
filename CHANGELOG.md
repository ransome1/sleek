# Changelog

All notable changes to sleek will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.25] - 2026-04-14

### Added

- The search text field now shows both currently visible and total available todos (https://github.com/ransome1/sleek/issues/766)
- Test cases for Attributes.ts of main process

### Enhanced

- Replaced `dayjs` completely with `Luxon` and removed `dayjs` dependency
- Updated MUI to the next major version and fixed broken functionality
- Refactored Attributes.ts in main and renderer process
- Removed possible bottlenecks during app-startup which should speed up startup-times
- Removed material-ui-popup-state dependency
- Refactored Notifications.ts and enhanced its test cases

### Fixed

- When you set a todo’s status to 'done' and bulk creation is turned on, line breaks will no longer create new todos (https://github.com/ransome1/sleek/issues/822)
- Recurring todos using a bare interval without a number (e.g. `rec:w`, `rec:m`) now correctly receive a new due date when completed. Previously the due date was silently omitted
- Strict recurring todos (e.g. `rec:+1w`) with no existing due date now correctly fall back to the completion date plus the recurrence interval, as documented. Previously an invalid date was written
- Fixed various date issues (https://github.com/ransome1/sleek/issues/735, https://github.com/ransome1/sleek/issues/534, https://github.com/ransome1/sleek/issues/744)
- Fixed issue with hidden tasks still pushing their attributes into drawer (https://github.com/ransome1/sleek/issues/769)
- Fixed theme issue on Windows (https://github.com/ransome1/sleek/issues/743)
- On Windows, sleek no longer leaves behind a `*.tmp.ico` file in `%TEMP%` after each run. The tray icon files are now unpacked from the application archive so Windows can read them directly, avoiding the temporary copy that was never cleaned up (https://github.com/ransome1/sleek/issues/848)
- https://github.com/ransome1/sleek/issues/662
- https://github.com/ransome1/sleek/issues/664
- https://github.com/ransome1/sleek/issues/815

## [2.0.24] - 2026-04-01

### Enhanced

- Updated all dependencies including the latest Electron, which addresses performance issues on macOS (https://github.com/ransome1/sleek/issues/870)

## [2.0.23] - 2026-02-05

### Added

- Added help icon to empty attribute view

### Enhanced

- Updated all dependencies
- Replaced dayjs with luxon in Filters.ts
- Improved tray icon handling (https://github.com/ransome1/sleek/issues/853)
- Allowing capitalisation of filenames in tabs (https://github.com/ransome1/sleek/issues/845)

### Fixed

- https://github.com/ransome1/sleek/issues/824
- https://github.com/ransome1/sleek/issues/842
- https://github.com/ransome1/sleek/issues/827
- https://github.com/ransome1/sleek/issues/849

## [2.0.22] - 2025-11-30

### Added

- `pri` extension is now recognized during typing (https://github.com/ransome1/sleek/issues/831)

### Enhanced

- Update metadata for com.github.ransome1.sleek by @razzeee in https://github.com/ransome1/sleek/pull/841
- Check word boundary in front of attribute keys by @Lezurex in https://github.com/ransome1/sleek/pull/825
- Added new dock icon for macOS builds to meet new Tahoe requirements
- https://github.com/ransome1/sleek/issues/821

### Fixed

- https://github.com/ransome1/sleek/issues/828

## [2.0.21] - 2025-09-07

### Enhanced

- Updated dependencies, which resolve major Electron issue and minor MUI CSS glitches

## [2.0.20] - 2025-08-12

### Added

- Updated all dependencies to its latest versions
- Added Saturday as option for first day of the week (https://github.com/ransome1/sleek/issues/721) contributed by @Lezurex

### Enhanced

- Enhanced Italian translations contributed by @lookup82
- Enhanced archiving function (https://github.com/ransome1/sleek/issues/810) contributed by @Lezurex
- Minor CSS and React component clean up

### Fixed

- Fixed https://github.com/ransome1/sleek/issues/575 contributed by @Lezurex
- Fixed https://github.com/ransome1/sleek/issues/728 contributed by @Lezurex
- Fixed https://github.com/ransome1/sleek/issues/800 contributed by @alihamamah
- Fixed https://github.com/ransome1/sleek/issues/781 contributed by @lookup82
- Fixed visual bug in recurrence picker
- Fixed visual bug in date field

## [2.0.18] - 2025-02-26

### Added

- `vitest` as new testing framework
- Test cases for `Notification` module
- Configured `codecov` for testing during pipeline runs

### Enhanced

- Refactored stores
- Refactored `Notification` module
- Refactored `compact view`

## [2.0.19] - 2025-03-06

### Added

- `Tray` icons which adapt to color theme of operating system (#593)
- Option to invert color of tray icon manually
- Option to let the app start minimized to tray (https://github.com/ransome1/sleek/issues/748)
- DMG background image
- Help button to splashscreen
- Added icons for completion and creation dates (https://github.com/ransome1/sleek/issues/747)
- New line is added to eof to establish wider todo.txt application compatibility (https://github.com/ransome1/sleek/issues/730)

### Enhanced

- Replaced `dayjs` with `Luxon`
- Refactoring `Date`, `Theme`, `Store`, `Menu` module
- Adjusted the red color hue (discussed in https://github.com/ransome1/sleek/issues/784)

### Fixed

- Bug in `notification` feature which did not suppress messages reliably
- Bug regarding missing search term (https://github.com/ransome1/sleek/issues/785)
- Bugs around how the app starts and quits

## [2.0.18] - 2025-02-26

### Added

- `vitest` as new testing framework
- Test cases for `Notification` module
- Configured `codecov` for testing during pipeline runs

### Enhanced

- Refactored stores
- Refactored `Notification` module
- Refactored `compact view`

## [2.0.17] - 2025-02-24

### Added

- Compact view
- Button to remove saved filters
- Translations for Brazilian Portugese by @johnpetersa19 in https://github.com/ransome1/sleek/issues/762
- Option to sort completed task at the end of the list (https://github.com/ransome1/sleek/discussions/771, https://github.com/ransome1/sleek/issues/590)

### Enhanced

- Extended the zoom level to 50% to 150%
- CSS and React component refactoring
- Replaced deprecated Gitlab workflow action
- Enhanced build workflow: Not needed files are now excluded. On the macOS releases this reduces download size by roughly 10 Mb and the App size after installation by roughly 50 Mb
- The way configurations/settings are handled has been refactored, resulting in less unnecessary renderings

### Fixed

- Fixed https://github.com/ransome1/sleek/issues/764
- Fixed https://github.com/ransome1/sleek/issues/763
- Fixed https://github.com/ransome1/sleek/issues/617 (thanks to upstream @jmhobbs, @madeindjs)
- Fixed broken Peggy integration https://github.com/ransome1/sleek/issues/647
