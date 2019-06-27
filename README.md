# crypto-weddings

## What is crypto-weddings?

crypto-weddings is a DApp which allows anyone to display their marriage for the world to see forever on the ethereum blockchain. crypto-weddings has no opinions on who can marry.

## Who might be interested?

Anyone who wants to show their love forever to the world. There are few things more permanent and unchangeable than the ethereum blockchain.

The ethereum blockchain is immutable and uncensorable.

This means that non traditional couples in more conservative societies are able freely participate no matter what the political situation is at their current location. Because of the immutable nature of blockchain technology, no government or person can ever deny or change a blockchain marriage.

## Key Terms

* admin
  * the owner of the project.
  * owns the WeddingManager contract
* Fiances
  * two people who intend to get married on the blockchain
* blockchain marriage
  * a non official marriage which is a smart contract on the ethereum blockchain which will exist forever. marriage is confirmed after mutual agreement
* blockchain divorce
  * end non official marriage by wedding contract destruction after mutual agreement
* DApp
  * distributed application. An application which can run anywhere and uses data and functions from smart contracts on the ethereum network. Works in a web browser.
* etherscan
  * a block explorer for the ethereum network. Can find smart contracts, balances, and transactions on the ethereum network here.
* transaction
  * an ethereum transaction. This can be sending money or running a function on a smart contract. This always costs gas.
* gas
  * essentially the fee you are paying to the ethereum network for doing something. This something includes running most functions as well as sending money to someone. Gas fees are normally very small and inexpensive.
* metamask
  * metamask is a browser plugin which allows users to interact with ethereum smart contracts from the browser. It also acts as a wallet which has ethereum accounts.
* ether
  * the monetary unit of the ethereum network

## What Can crypto-weddings do?

* blockchain marriage
  * a smart contract is deployed for every couple wishing to marry
  * the wedding is set to initialized/inProgress until both persons agree to marry
  * either person can reject the marriage and destroy the contract
  * once both agree, the marriage is confirmed and stays on the blockchain
* wedding gifts
  * anyone can send ether to the wedding contract
    * can be claimed in full by either fiance/partner
    * messages can be added when sending wedding gifts
    * bad comments can be blocked on the DApp side
    * messages can be blocked altogether on the DApp side
* blockchain divorce
  * need both persons to agree to divorce
  * if wedding gift money is still in wedding contract gift money goes to last person to divorce
* add/change wedding photo
  * photo can either be an ipfs hash or a link to a photo elsewhere

### What Can the Admin do?

* register/deregister weddings
  * this is done to prevent griefing etc.
  * wedding can still be found if address is known
  * deregistering a wedding will do the following:
    * remove wedding from being displayed on DApp
      * weddings can still be found directly by address on DApp
    * stop wedding events from being emitted (this is due to all events going through WeddingManager)
    * wedding gift messages will no longer be displayed (gifts use events)

### What Can the Admin NOT do?

  * cannot delete/destroy wedding contracts
    * the admin can only register/deregister wedding contracts
  * cannot claim wedding gifts from wedding contracts 

### What Can the Fiances do?
  * create a custom wedding smart contract
  * agree to marriage
  * agree to divorce 
  * disagree to marriage when pending
    * destroys the wedding smart contract
  * change wedding photo
  * claim gifts
  * adjust wedding gift minimum amount
    * used for limiting griefing
  * set preferences for showing wedding gift events
    * wedding gifts and messages can still be sent but will or will not be shown on DApp depending on this setting
  * ban a user from sending wedding gifts
    * will still allow user to send money/messages, however based on setting messages will be replaced with "best wishes!"

### What Can the Fiances NOT do?

  * destroy wedding alone after marriage finalized (must have mutual agreement to divorce between partners)
  * register their own wedding after being deregistered
  * register/deregister other weddings

### What Can the Fiances do Through Mutual Consent?
  * marry
  * divorce
    * destroys the contract

### Technical

The following smart contracts perform all needed functions:

1. `WeddingManager.sol`
1. `Wedding.sol`
1. `WeddingEventEmitter.sol`
1. `WeddingProxy.sol`
1. `Upgradeable.sol`
1. `UpgradeableProxy.sol`

Contracts in `/interfaces` are used for communication between contracts.

Contracts in `/stubs` for making testing certain functionality easier.

#### WeddingEventEmitter
Because all events are emitted through the `WeddingManager` contract and event emitting permissions are only given to registered weddings,
`Wedding` contracts which are not registered would not be able to do anything due to failing calls to `WeddingManager` in order to allow
for failing calls to `WeddingManager`, low level `call`s are used and encapsulated in its own contract with internal methods which can be used by `Wedding`
which inherits from `WeddingEventEmitter`. Encapsulating this in a seperate contract also alows for better testing through stubs.

#### Upgradeable & UpgradeableProxy
These two contracts enable upgrades through the upgradeable proxy pattern. This is only used for the `WeddingManager` contract.
`Wedding` contracts are not upgradeable! That would invalidate the whole idea of an immmutable wedding.
For more information on how upgradeable proxies work, [check here](https://blog.indorse.io/a-well-tested-guide-to-upgradeable-proxy-ethereum-smart-contracts-f4b5111c12b0).

#### WeddingProxy
This contract enables for much, much cheaper weddings to be created through proxies. `WeddingProxy` is NOT upgradeable! It simply uses the proxy pattern
for cost savings. 

#### WeddingManager

`WeddingManager.sol` is a smart contract that does the following:
* creates new wedding contracts
  * anyone can create a new `Wedding` from `WeddingManager`
    * weddings are created in the form of unupgradeable proxies
* keeps a list of `weddings` that have been created/registered
  * modified when a new wedding is created or a weddings is deregistered
* handles centralized event emitting

#### Wedding

`Wedding.sol` contracts do the following:

* agree to marriage
  * agreement is done through the `acceptProposal` function
  * must be one of the fiances
  * can only be called when marriage is in `Initialized` or `InProgress` status
  * once both agree wedding is put to `Married` status
  * `Married` event emitted
* disagree to marriage
  * either can disagree through `rejectProposal` function
  * must be in `Initialized` or `InProgress` status
  * `FlexibleWedding` contract instance destroyed
  * any funds in contract sent to caller (person rejecting)
* divorce
  * divorce successfully occurs when:
    * both `partner1` and `partner2` have run the divorce function
  * when divorce conditions are met
    * `Divorce` event emitted
    * `Wedding` `selfdestruct`s
    * `Wedding` is deregistered from `WeddingManager`
* change wedding photo
  * either `partner1` or `partner2` can change the `weddingPhoto`
  * shows in the DApp
* send wedding gifts
  * anyone can send ether to this contract
  * these wedding gifts can be claimed in full by either fiance
