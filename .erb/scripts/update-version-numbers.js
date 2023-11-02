const fs = require('fs');
const packageJson = require('../../release/app/package.json');
const dayjs = require('dayjs');

let desktopFileContent = fs.readFileSync('../../flatpak/com.github.ransome1.sleek.desktop', 'utf8');
desktopFileContent = desktopFileContent.replace(/Version=.*\n/, `Version=${packageJson.version}\n`);
fs.writeFileSync('../../flatpak/com.github.ransome1.sleek.desktop', desktopFileContent);

console.log('Updated com.github.ransome1.sleek.desktop with version', packageJson.version);

let appdataContent = fs.readFileSync('../../flatpak/com.github.ransome1.sleek.appdata.xml', 'utf8');
const formattedDate = dayjs(new Date()).format('YYYY-MM-DD');
appdataContent = appdataContent.replace(/<release version=".*?" date=".*?"\/>/, `<release version="${packageJson.version}" date="${formattedDate}"/>`);
fs.writeFileSync('../../flatpak/com.github.ransome1.sleek.appdata.xml', appdataContent);

console.log('Updated com.github.ransome1.sleek.appdata.xml with version', packageJson.version, 'and date', formattedDate);

let snapcraftContent = fs.readFileSync('../../snap/snapcraft.yaml', 'utf8');
snapcraftContent = snapcraftContent.replace(/version: ".*?"/, `version: "${packageJson.version}"`);
fs.writeFileSync('../../snap/snapcraft.yaml', snapcraftContent);

console.log('Updated snapcraft.yaml with version', packageJson.version);

let mainPackageJsonContent = fs.readFileSync('../../package.json', 'utf8');
mainPackageJsonContent = mainPackageJsonContent.replace(/version": ".*?"/, `version": "${packageJson.version}"`);
fs.writeFileSync('../../package.json', mainPackageJsonContent);

console.log('Updated package.json with version', packageJson.version);