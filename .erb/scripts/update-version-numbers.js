const fs = require('fs');
const packageJson = require('../../release/app/package.json');
const { format } = require('date-fns'); // You may need to install this library using `yarn add date-fns` if you haven't already.

// Update the .flatpak/com.github.ransome1.sleek.desktop file
let desktopContent = fs.readFileSync('../../flatpak/com.github.ransome1.sleek.desktop', 'utf8');
desktopContent = desktopContent.replace(/Version=.*\n/, `Version=${packageJson.version}\n`);
fs.writeFileSync('../../flatpak/com.github.ransome1.sleek.desktop', desktopContent);

console.log('Updated com.github.ransome1.sleek.desktop with version', packageJson.version);

// Update the com.github.ransome1.sleek.appdata.xml file
let appdataContent = fs.readFileSync('../../flatpak/com.github.ransome1.sleek.appdata.xml', 'utf8');
const today = new Date();
const formattedDate = format(today, 'yyyy-MM-dd');
appdataContent = appdataContent.replace(/<release version=".*?" date=".*?"\/>/, `<release version="${packageJson.version}" date="${formattedDate}"/>`);
fs.writeFileSync('../../flatpak/com.github.ransome1.sleek.appdata.xml', appdataContent);

console.log('Updated com.github.ransome1.sleek.appdata.xml with version', packageJson.version, 'and date', formattedDate);

// Update the snapcraft.yaml file
let snapcraftContent = fs.readFileSync('../../snap/snapcraft.yaml', 'utf8');
snapcraftContent = snapcraftContent.replace(/version: ".*?"/, `version: "${packageJson.version}"`);
fs.writeFileSync('../../snap/snapcraft.yaml', snapcraftContent);

console.log('Updated snapcraft.yaml with version', packageJson.version);