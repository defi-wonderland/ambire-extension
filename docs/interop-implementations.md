# Interoperable Wallet Implementation

**End Goal:**

- Build a single, unified interface page that provides a seamless user experience for handling various onchain and cross-chain operations automatically.

- **Supported Operations:**

  - Simple Transfers (same chain)
  - Bridging (cross-chain asset movement) with OIF (Across)
  - Swaps (same chain asset exchange) with [Li.Fi](http://Li.Fi) integration
  - Swap & Bridge (combined cross-chain swap and transfer) with [Li.Fi](http://Li.Fi) integration

- **Input Address Support:**

  - Raw EVM addresses
  - ENS names (existing functionality)
  - Interoperable addresses (based on ERC-7828 and ERC-7930)

- **Other features Support:**
  - EOA Signing
  - Account Abstraction (EIP-7702) and Smart Accounts (EIP-4337)
  - EIP-5792 Wallet Actions (existing functionality)
  - Bundlers / Relayers

### User Stories

- [Intent User Stories](./intent-user-stories.md)

---

### **Milestones:**

**Stage 0: Integrate 7930**

- Create ERC-7930 parsing and formatting methods
- [Add support for 7930 in Receive Modal](./tech-implementations/receive-modal.md)

**Stage 1: Create "Bridge" Page & Integrate Intent-Based Cross-Chain Transfers (Across)**

- Create the new "Bridge" page component structure.
- Copy the existing "Swap&Bridge" page code as a starting point for the UI/UX layout of the new unified page.
- **Crucially, refactor the copied logic** to be highly modular. Separate concerns like:
  - Input handling (amount, asset, addresses)
  - Network selection (source/destination)
  - Route finding/selection (for swap, bridge, swap&bridge)
  - Transaction execution logic (adapting to EOA/AA/EIP-5792)
- Integrate the first functionality: **Intent-based cross-chain transfers** using Across Protocol.
- **Goal:** A functional "Bridge" page capable of performing cross-chain transfers via Across, built on a modular foundation.

[Bridge Technical Implementation](./tech-implementations/bridge-implementation.md)

**Stage 2: Integrate Canonical Transfers into "Bridge" Page**

- Leverage the modular framework built in **Stage 1**. Add logic to handle standard same-chain asset transfers.
- Implement the necessary UI elements/state management within the unified "Bridge" page to select and execute a simple transfer when the source and destination chains/networks are the same.
- Once functionality is verified, remove the old "Transfer" button from the main navigation and deprecate/remove the old Transfer page code.
- **Goal:** The "Bridge" page now handles both Across cross-chain bridging and standard same-chain transfers.


**Stage 3: Integrate Canonical Swap & Swap&Bridge into "Bridge" Page (current [Li.Fi](http://Li.Fi) integration)**

- Integrate the _existing_ canonical swap-and-bridge functionality into the modular framework. This might involve reusing parts of the refactored logic from Step 1.
- Ensure the UI correctly routes for Transfers, Swaps and Swap&Bridge based on user inputs (assets, networks, target address).
- Once functionality is verified, remove the old "Swap&Bridge" button from the main navigation and deprecate/remove the old Swap&Bridge page code.
- **Goal:** The "Bridge" page now handles all target operations: Transfer, Bridge (Across-based initially), Swap, and Swap&Bridge (canonical).


**Stage 4:**

- One unified page handles the specified core transaction types.
- Old, redundant pages and navigation elements are removed.
- Polish and improve error handling
- Polish and improve UX

---

## Design Criteria

### Modular Architecture Approach

The implementation will follow a modular architecture centered around a unified transaction hook system. This approach will offer:

1. **Unified Interface**: A consistent API for different transaction types
2. **Separation of Concerns**: Transaction logic is decoupled from UI components, making both easier to test and maintain
3. **Extensibility**: New transaction types can be added without modifying existing functionality
4. **Reusability**: Core utilities can be shared across different features of the application
