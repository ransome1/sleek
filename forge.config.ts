import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const os = require('os');
const isMAS = process.env.PLATFORM === 'mas';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icons/icon',
    appBundleId: 'com.todotxt.sleek',
    appVersion: '2.0.15',
    buildVersion: '50',
    appCategoryType: 'public.app-category.productivity',
    osxSign: {
      identity: isMAS
        ? `Apple Distribution: Robin Ahle (${process.env.TEAM_ID})`
        : `Developer ID Application: Robin Ahle (${process.env.TEAM_ID})`,
      optionsForFile: () => ({
        hardenedRuntime: !isMAS,
      }),
    },
    ...(!isMAS && {
      osxNotarize: {
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        teamId: process.env.TEAM_ID,
      },
    }),
  },
  //rebuildConfig: {},
  makers: [
    new MakerRpm({}),
    new MakerDeb({}),
    {
      name: '@electron-forge/maker-pkg',
      platforms: ['mas'],
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './assets/icons/icon.icns',
        background: './assets/dmg-background.png',
        format: 'ULFO',
        contents: [
          { x: 25, y: 100, type: 'file', path: `${process.cwd()}/out/sleek-darwin-${os.arch()}/sleek.app` },
          { x: 150, y: 100, type: 'link', path: '/Applications' }
        ],
        window: {
          width: 100,
          height: 100
        }
      }
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'ransome1',
        description: 'sleek - todo.txt manager for Windows, free and open-source (FOSS)'
      }
    },
    {
      name: '@electron-forge/maker-appx',
      config: {
        publisher: 'CN=2B3D4037-FF2E-4C36-84A6-CFF49F585C0C',
        packageDisplayName: 'sleek - todo.txt manager for Windows, free and open-source (FOSS)',
        packageName: 'RobinAhle.sleektodomanager'
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ransome1',
          name: 'sleek'
        },
        force: true,
        draft: true,
        generateReleaseNotes: true,
        tagPrefix: ''
      }
    }    
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/index.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.tsx',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
