# Ambire Wallet

<div align="center">
  <a href="https://chromewebstore.google.com/detail/ambire-wallet/ehgjhhccekdedpbkifaojjaefeohnoea" target="_blank">
    <img src="./mockups/mockup-dashboard.png" alt="Ambire Wallet Dashboard" />
  </a>

  <p>
    The secure & easy-to-use Web3 wallet. EIP-7702 ready.<br />
    <a href="https://chromewebstore.google.com/detail/ambire-wallet/ehgjhhccekdedpbkifaojjaefeohnoea" target="_blank">
      <strong>Download Extension for Webkit Browsers 🔥</strong>
    </a>
    <br />
    <em>(Chrome, Brave, Opera, Edge, Arc)</em>
    <br /><br />
    💌 Request Invite Code:
    <a href="https://discord.com/invite/Ambire" target="_blank">Discord</a> |
    <a href="https://t.me/AmbireOfficial" target="_blank">Telegram</a>
    <br />
    🐞
    <a href="https://github.com/AmbireTech/extension/issues">Report a Bug</a> ·
    <a href="https://forum.ambire.com/" target="_blank">Request Features</a>
  </p>
</div>

## Environment Setup

Built in a hybrid approach (with React Native and React Native Web) so that in a single codebase we can support building cross-browser extensions, mobile apps and web apps.

This project is built with Expo's bare workflow, allowing us to extend the default Vanilla React Native with additional expo modules in the form of installable expo libraries.

More about the environment setup and prerequisites [here](https://reactnative.dev/docs/environment-setup).

## Install

Install all dependencies:

```bash
yarn install
```

Install the [ambire-common](https://github.com/AmbireTech/ambire-common) submodule, a common ground for the Ambire apps, run:

```bash
git submodule init
git submodule update
```

## Environment Variables

Create ".env" file in the root directory and fill in all variables, see ".env-sample" for a reference.

## Editor Config

Make sure your code editor has plugins that support the following configuration files: `.editorconfig`, `.prettierrc`, `tsconfig.json`, `eslintrc.js`, [`import-sorter.json`](https://github.com/SoominHan/import-sorter).

## Browser Extensions

### Development-optimized Builds

- Start the browser extension for webkit browsers (tested mostly on Chrome and Brave):

  ```bash
  yarn web:webkit
  ```

  Then follow the instructions to load an unpacked extension [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

### Production-optimized Builds

- For webkit browsers:

  ```bash
  yarn build:web:webkit
  ```

  And find the resulting build in the "build/webkit-prod" folder.

### Extract Source Maps

The production-optimized builds come with source maps files included. When preparing a production build for a browser store release, run the following commands to extract the source maps in separate directories:

- For the webkit build:

  ```bash
  yarn export:web:webkit:sourcemaps
  ```

  As a result, build/webkit-prod will no longer include the source map files (as before). Instead, a new folder, build/webkit-prod-source-maps, will be created to hold only the source maps. This folder should also be included in the GitHub release tag we create.

### Store-prepared Builds

Automates the steps before every extension extension store release that could be otherwise done manually:

- Makes webkit and gecko extension production builds
- Exports source maps to "clean" the builds (and to prepare for upload those source maps in the GitHub release)
- Zips the "clean" builds (stores accept zips only) and the source maps

```bash
yarn build:extensions
```

And find the resulting zips in the "build" folder as `ambire-extension-<VERSION>-<TYPE>.zip`

## Benzin

Ambire's transaction explorer, that makes human readable ERC-4337 transactions and contract interactions.

Comes not only as integrated module in the Ambire extension(s), but as a standalone web app also.

### Development-optimized Build

```bash
yarn web:benzin
```

And find the resulting build in the "build/benzin-dev" folder.

### Production-optimized Build

```bash
yarn build:web:benzin
```

And find the resulting build in the "build/benzin-prod" folder.

## Ambire Legends

Ambire Legends is a gamified testing web3 app for the Ambire browser extensions. It is designed to users you discover the power of Smart Accounts via an epic onchain adventure. [Read more](https://legends.ambire.com/).

### Development-optimized Build

```bash
yarn web:legends
```

And find the resulting build in the "build/legends-dev" folder.

```bash
yarn build:web:legends
```

And find the resulting build in the "build/legends-prod" folder.

## Others

### Browser Extensions E2E Tests

#### Configuration

The best approach here is to follow `.github/workflows/tests.yml`. It contains all the necessary instructions for CI, which are also applicable locally. Make sure to:

- Set all necessary .env variables (marked as end-to-end tests configuration).
- See [#1409](https://github.com/AmbireTech/ambire-app/pull/1409) for more details.

#### Running against production

To build the webkit production version of the extension and run the E2E tests against the /webkit-prod folder, run:

```bash
yarn run test:e2e:web
```

#### Running against development

For debugging, to use the hot-reloaded webpack dev webkit build and to allow running individual tests easily run:

```bash
yarn test:e2e:web:dev
```

When debugging or writing a new test, it is easier to use this command, as the project is hot-reloaded with every change you make to the codebase (e.g., adding a new selector or debugging a state), eliminating the need for a complete production build (as before). Additionally, you can run tests for a single or multiple test files.

Here's how to run the tests for a single test file:

```json
{
  "test:e2e:web:dev": "WEBPACK_BUILD_OUTPUT_PATH=webkit-dev jest --config=./tests/jest.config.js -- ./tests/basic_account/ba_transactions.test.js"
}
```

If you are fixing a failing CI test and want to mimic CI at 100%, you should configure the display server:

First, run `Xvfb -ac :99 -screen 0 1280x1024x16 > /dev/null 2>&1 &`, then set the `DISPLAY` variable with `export DISPLAY=:99.0`. By doing this, when Jest & Puppeteer are running, they will use the newly created virtual display instead of your local display. If you want to switch back to your local display, you should run export `DISPLAY=:0`.

See [#2438](https://github.com/AmbireTech/ambire-app/pull/2438) for more details.

### Translations (Beta)

To scan the project for translation labels and to update translations JSON files, run:

```bash
yarn translations:scan
```

PS: Secondary languages not implemented / translated / fully tested yet.

# ERC-7930 Interoperable Address Implementation

### Overview

This technical design document outlines the implementation of [ERC-7930](https://github.com/ethereum/ERCs/blob/28881f003d03890552a058e10e8e0db7919ccc9e/ERCS/erc-X.md) Interoperable Addresses into an existing wallet application (Ambire). The goal is to enhance cross-chain interoperability by implementing human-readable addresses that contain chain information, allowing for a more seamless user experience when sending assets across different chains.

### [WIP] Terminology

- [**ERC-7930**](https://github.com/ethereum/ERCs/blob/28881f003d03890552a058e10e8e0db7919ccc9e/ERCS/erc-X.md): Proposal for standardizing interoperable addresses
- **Chain-specific Address or Interoperable Address**: Human-readable address format defined by [ERC-7930](https://github.com/ethereum/ERCs/blob/28881f003d03890552a058e10e8e0db7919ccc9e/ERCS/erc-X.md) that contains chain information

### Objectives

- Extend current wallet functionality to support [ERC-7930](https://github.com/ethereum/ERCs/blob/28881f003d03890552a058e10e8e0db7919ccc9e/ERCS/erc-X.md) interoperable addresses
- Minimize UI changes while improving user experience for cross-chain transactions
- Create a reusable implementation that can be shared with the broader ecosystem
- Maintain backward compatibility with existing address formats (ENS, EVM addresses)

# Implementation Roadmap

## 1. Transfer Functionality Enhancements

### Current Implementation

The transfer function currently allows users to select a token-chain pair and the destination address for transfers.

### Part 1: Interoperable Address Support in Transfer Page

- Enhance the transfer function to accept interoperable addresses that contain embedded chain information
- When an interoperable address is entered, automatically select the associated chain
- Filter token selection to show only tokens available on the detected chain
- Maintain existing address format support for backward compatibility

### Part 2: Intent Standard and Adapter Contract in Transfer Page

- Implement a toggle in the transfer page that enables advanced cross-chain interactions
- Allow users to select any token from their portfolio across different chains
- Process transfers to the destination token and chain specified by the interoperable address
- Leverage the Intent Standard and Adapter Contract to facilitate cross-chain transfers

## 2. Swap and Bridge Functionality Enhancements

### Current Implementation

The swap and bridge function allows users to select a token-chain pair from available balances, then choose the desired destination token and chain. Users cannot currently modify the recipient of the funds.

### Part 1: Interoperable Address Support

- Add a toggle enabling users to input an interoperable address for the recipient
- When an interoperable address is entered, lock the destination chain to match the address
- Users will still select the source token-chain and destination token
- Maintain the current flow for users who prefer not to use interoperable addresses

### Part 2: Intent Interface Integration

- Replace current Li.Fi implementations with our intent interface and adapter contract
- Create a unified transaction flow regardless of source or destination chains
- Improve transaction transparency and tracking for cross-chain operations

## 3. Account History Enhancements

### Current Implementation

Currently, the signTx, loadingTx, and successTx screens/modals are similar for send, swap, and bridge operations. There is no specific design for cross-chain operations, and only initial transaction data is displayed.

### Part 1: UI Differentiation for Cross-chain Operations

- Modify the current interface to visually differentiate cross-chain operations
- Leverage transaction data stored in the wallet's localStorage to enhance the display
- Add specific indicators and status trackers for cross-chain transactions

## Technical Implementations

- [[WIP] Interop SDK]()
- [Receive Modal Changes]()
- [Transfer Page (Part 1): Interop Addy Support]()
- [[TBD] Swap & Bridge (Part 1): Interop Addy Support]()
- [[TBD] Transfer Page (Part 2): Interop Transfer Functionality]()
- [[TBD] Swap & Bridge (Part 2): Intent Interface Integration]()
- [[TBD] Account History (Part 1)]()
- [[TBD] Account History (Part 2)]()

## Design Criteria [WIP]

### Modular Architecture Approach

The implementation will follow a modular architecture centered around a unified transaction hook system. This approach will offer:

1. **Unified Interface**: A consistent API for different transaction types
2. **Separation of Concerns**: Transaction logic is decoupled from UI components, making both easier to test and maintain
3. **Extensibility**: New transaction types can be added without modifying existing functionality
4. **Reusability**: Core utilities can be shared across different features of the application
