# Changelog

All notable changes to sleek will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.22] - 2025-11-30

### Added
* `pri` extension is now recognized during typing (#831)

### Enhanced
* Update metadata for com.github.ransome1.sleek by @razzeee in https://github.com/ransome1/sleek/pull/841
* Check word boundary in front of attribute keys by @Lezurex in https://github.com/ransome1/sleek/pull/825
* Added new dock icon for macOS builds to meet new Tahoe requirements
* [#821](https://github.com/ransome1/sleek/issues/821)

### Fixed
* [#828](https://github.com/ransome1/sleek/issues/828) and various CSS glitches

## [2.0.21] - 2025-09-07

### Enhanced
* Updated dependencies, which resolve major Electron issue and minor MUI CSS glitches

## [2.0.20] - 2025-08-12

### Added
* Updated all dependencies to its latest versions
* Added Saturday as option for first day of the week (#721) contributed by @Lezurex

### Enhanced
* Enhanced Italian translations contributed by @lookup82
* Enhanced archiving function (#810) contributed by @Lezurex
* Minor CSS and React component clean up

### Fixed
* Fixed #575 contributed by @Lezurex
* Fixed #728 contributed by @Lezurex
* Fixed #800 contributed by @alihamamah
* Fixed #781 contributed by @lookup82
* Fixed visual bug in recurrence picker
* Fixed visual bug in date field

## [2.0.18] - 2025-02-26

### Added

* `vitest` as new testing framework
* Test cases for `Notification` module
* Configured `codecov` for testing during pipeline runs

### Enhanced

* Refactored stores
* Refactored `Notification` module
* Refactored `compact view`

## [2.0.19] - 2025-03-06

### Added

* `Tray` icons which adapt to color theme of operating system (#593)
* Option to invert color of tray icon manually
* Option to let the app start minimized to tray (#748)
* DMG background image
* Help button to splashscreen
* Added icons for completion and creation dates (#747)
* New line is added to eof to establish wider todo.txt application compatibility (#730)

### Enhanced
* Replaced `dayjs` with `Luxon`
* Refactoring `Date`, `Theme`, `Store`, `Menu` module
* Adjusted the red color hue (discussed in #784)

### Fixed
* Bug in `notification` feature which did not suppress messages reliably
* Bug regarding missing search term (#785)
* Bugs around how the app starts and quits

## [2.0.18] - 2025-02-26

### Added

* `vitest` as new testing framework
* Test cases for `Notification` module
* Configured `codecov` for testing during pipeline runs

### Enhanced

* Refactored stores
* Refactored `Notification` module
* Refactored `compact view`

## [2.0.17] - 2025-02-24

### Added

* Compact view
* Button to remove saved filters
* Translations for Brazilian Portugese by @johnpetersa19 in #762
* Option to sort completed task at the end of the list (https://github.com/ransome1/sleek/discussions/771, #590)

### Enhanced

* Extended the zoom level to 50% to 150%
* CSS and React component refactoring
* Replaced deprecated Gitlab workflow action
* Enhanced build workflow: Not needed files are now excluded. On the macOS releases this reduces download size by roughly 10 Mb and the App size after installation by roughly 50 Mb
* The way configurations/settings are handled has been refactored, resulting in less unnecessary renderings

### Fixed

* Fixed #764
* Fixed #763
* Fixed #617 (thanks to upstream @jmhobbs, @madeindjs)
* Fixed broken Peggy integration #647