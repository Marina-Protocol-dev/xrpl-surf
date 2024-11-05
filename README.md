# xrpl-surf

**Note:** This documentation describes the process of issuing the Marina Protocol Utility Token (SURF) within the XRP Ledger ecosystem. The key functionalities are:

1. Issuing SURF tokens from a cold wallet to a hot wallet.
2. Issuing SURF tokens based on user requests, where the number of SURF tokens corresponds to the requested amount of psurf points.

Please be aware that these functions are based on scenario-driven testing and have not yet been deployed in a production environment.

## Architecture

## XRPL Features Used in This Project

This project utilizes various features of the XRP Ledger (XRPL) to implement token issuance, transfer, and exchange functionality. Below is a summary of the XRPL features used and their locations in the codebase.

### Features and Their Locations

#### 1. Client Connection
- [surftoken.service.ts](functions/src/xrpl/v1/tokens/surftoken.service.ts): Line 12
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Line 19

#### 2. Wallet Creation and Management
- [surftoken.service.ts](functions/src/xrpl/v1/tokens/surftoken.service.ts): Lines 16, 21
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Line 48

#### 3. Trust Line Setup (TrustSet)
- [surftoken.service.ts](functions/src/xrpl/v1/tokens/surftoken.service.ts): Lines 23-31

#### 4. Token Issuance and Transfer (Payment)
- [surftoken.service.ts](functions/src/xrpl/v1/tokens/surftoken.service.ts): Lines 44-52
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Lines 64-72

#### 5. Transaction Submission and Waiting
- [surftoken.service.ts](functions/src/xrpl/v1/tokens/surftoken.service.ts): Lines 33-36, 54-57
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Lines 74-77

#### 6. Balance Checking
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Lines 49-53

#### 7. Address Validation
- [exchange.service.ts](functions/src/xrpl/v1/exchanges/exchange.service.ts): Lines 38-46

### Overview

This implementation covers core XRPL operations, including:
- Establishing connections to the XRP Ledger
- Managing wallets and addresses
- Setting up trust lines for custom tokens
- Issuing and transferring tokens
- Submitting and waiting for transaction confirmations
- Checking account balances
- Validating XRP addresses

These features enable the project to interact with the XRP Ledger for various token-related operations.

