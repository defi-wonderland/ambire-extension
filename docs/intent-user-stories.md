# User Stories

This document outlines key user stories related to the upcoming interoperable features, specifically focusing on the concept of "Intents." These user stories serve to define the desired user experience and functional requirements from an end-user perspective, guiding the design and development process. Each story highlights a specific scenario, its rationale, and the acceptance criteria necessary to meet the user's needs effectively and safely. The primary goal is to ensure intuitive, secure, and seamless cross-chain operations.

### **US1: Basic Send to Another Chain**

**As an end-user**:

I want to send asset to any address, regardless of which chain it is on.

**Rationale**: I should be able to send assets as easily as if everything was on a single chain.

> 📌 Acceptance Criteria:
>
> - Wallet detects and shows the destination chain when interop address is provided.
> - Error prevention when sending to a non-existent account, like an unregistered address assigned to a name.
> - The chain-specific address should be clearly visualized.
> - Clear separation between source and destination chain.
> - Transfer method and costs are shown afterwards (Intents/Bridges).


### **US2: Human-Readable Name Usage Across Chains**

**As an end-user**:

I want to send assets using a human-readable name.

**Rationale**: I want to avoid dealing with raw addresses.

> 📌 Acceptance Criteria:
>
> - The human-readable name to chain-specific addresses conversion is unambiguous; the wallet must display the checksum for safety.
> - Validates the existence of resolved addresses.
> - Chain information is shown.


### **US3: Send Asset Error Prevention**

**As an end-user**:

I want to be warned if I'm sending to potentially inexistent chain or address.

**Rationale**: I want to avoid losing funds.

> 📌 Acceptance Criteria:
>
> - All US2 acceptance criteria apply here.
> - If the account is not found, warn about non-existent account.
> - If the chain is not found, warn about a non-existent destination chain.


### **US4: Sharing a Name**

**As an end-user:**

I want to share a chain-specific interop address to receive tokens.

**Rationale**: User want to receive tokens in a chain-specific address.

> 📌 Acceptance Criteria:
>
> - The chain-specific address is an ERC-7930 and can be unambiguously converted to machine code.
> - The address should have a checksum to prevent accidental collisions.


### **US5.a: Wallet Unsupported Chain**

**As an end-user**:

I want to be clearly warned and prevented from sending assets to a chain not supported by the wallet.

**Rationale**: To avoid losing funds or having them locked on an unsupported or inaccessible network.

> 📌 Acceptance Criteria:
>
> - The wallet must detect when the destination chain is not supported.
> - An explicit error message must be shown explaining the chain is unsupported.
> - The UI must block the transaction ****from proceeding (e.g., disable the "Proceed" button).
> - Optional: The unsupported chain should be clearly identified (e.g., CAIP-2 identifier).
> - Limitations: Tokens and chains are limited by the union of the wallet and protocol limitations.


### **US5.b: Intent-Protocol Based Send to Any Chain**

**As an end-user**:

I want to send assets to any chain without needing my wallet to support that chain directly, relying instead on a protocol that ensures destination compatibility.

**Rationale**: I want maximum flexibility and safety when sending cross-chain, without depending on the wallet's supported chain list.

> 📌 Acceptance Criteria:
>
> - The wallet delegates validation of destination chain and address compatibility to the Intent Protocol.
> - If the destination chain is unsupported by the intent protocol (or the route cannot be constructed), the user is warned clearly with a reason.
> - All validations of destination chain, asset support, and quoting is done through the protocol.
> - The wallet does not perform redundant checks unless for UX clarity.
> - On successful validation, a route/quotes is displayed, including:
>     - the asset and the amount to be received
>     - the receiving chain and address
>     - estimated cost/fee
> - Optional: Show whether the destination chain is not whitelisted, if applicable.
> - Limitations: Tokens and chains are limited by the Intent Protocol.
