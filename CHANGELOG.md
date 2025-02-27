# Changelog

All notable changes to sleek will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.19] - 2025-02-xx

### Added

* `Tray` icons which adapt to color theme of operating system
* Option to invert color of tray icon manually
* DMG background image
* Help button to splashscreen

### Fixed
* Bug in `notification` feature which did not suppress messages reliably

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