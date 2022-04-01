#!/bin/bash

APP="sleek"
APP_PATH="dist/mas-universal/$APP.app"
PKG_PATH="dist/mas-universal/$APP-mas.pkg"
PARENT_PLIST="build/entitlements.mas.plist"
CHILD_PLIST="build/entitlements.mas.inherit.plist"
LOGINHELPER_PLIST="build/entitlements.mas.loginhelper.plist"
APP_KEY="Apple Distribution: Robin Ahle (8QSR3UZXP8)"
codesign --force --entitlements "$CHILD_PLIST" --deep --sign "$APP_KEY" "$APP_PATH"
codesign --force --entitlements "$PARENT_PLIST" --sign "$APP_KEY" "$APP_PATH"
codesign --force --entitlements "$LOGINHELPER_PLIST" --sign "$APP_KEY" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/Contents/MacOS/$APP Login Helper"
codesign --force --entitlements "$LOGINHELPER_PLIST" --sign "$APP_KEY" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/"
productbuild --component "$APP_PATH" /Applications --sign "3rd Party Mac Developer Installer: Robin Ahle (8QSR3UZXP8)" "$PKG_PATH"