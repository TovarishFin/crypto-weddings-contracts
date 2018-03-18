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
* fee
  * ether charged by the smart contract to do something (marriage or divorce). This are fees on top of regular ethereum network gas costs.
* metamask
  * metamask is a browser plugin which allows users to interact with ethereum smart contracts from the browser. It also acts as a wallet which has ethereum accounts.
* ether
  * the monetary unit of the ethereum network

## What Can crypto-weddings do?

* blockchain marriage
  * a smart contract is deployed for every couple wishing to marry
  * the wedding is set to pending until both persons agree to marry
  * either person can reject the marriage and destroy the contract
  * once both agree, the marriage is confirmed and stays on the blockchain
* wedding gifts
  * anyone can send ether to the wedding contract
    * can be claimed in full by either fiance/partner
* blockchain divorce
  * need both persons to agree to divorce
  * divorce fee needs to be paid to contract
    * fee can be paid by anyone, the only thing that matters is that the fee is paid.
    * fee is paid by sending ether to the contract address
    * if wedding gift money is still in wedding contract, gift money is forfeit and goes towards divorce
  * once when above conditions are met, the contract self destructs
    * fee is sent to wedding manager
* manual wedding contract verification
  * for a fee, the owner of the project will manually verify the wedding smart contract on etherscan. This means that even in the unlikely case that the DApp goes down, anyone can still clearly read the wedding contract.
  * even without verification the data is still there and can be read with even a small amount of technical knowledge
* add/change wedding photo
  * there is no fee to change the photo
  * regular ethereum transaction costs still need to be paid
  * photo can either be an ipfs hash or a link to a photo elsewhere
    * ipfs hashes handled by project owner server and the DApp

### What Can the Admin do?

* verify/unverify marriages
  * this is done to display verified marriages on the DApp
* change marriage fee
  * not for single people but the general marriage fee
  * this is done in order to accommodate rising and falling ether prices
* change divorce fee
  * also not for single cases but general divorce fee
  * this is done in order to accommodate rising and falling ether prices
* collect fees
  * used for development/maintenance costs

### What Can the Admin NOT do?

  * cannot delete/destroy wedding contracts
    * the admin can only verify/unverify wedding contracts
      * this only acts as a mechanism to decide whether or not to display the wedding on the DApp
  * cannot change fees for single cases
  * cannot refund money
  * cannot claim wedding gifts from wedding contracts (unless balance remains at time of divorce)

### What Can the Fiances do?
  * create a custom wedding smart contract for a fee
  * agree to marriage
  * agree to divorce for a fee
  * disagree to marriage when pending
    * destroys the wedding smart contract
  * change wedding photo

### What Can the Fiances NOT do?
  * change fees
  * destroy wedding alone after marriage finalized
  * verify their own wedding
  * claim wedding money (while divorce process is NOT pending)

### What Can the Fiances do Through Mutual Consent?
  * marry
  * divorce
    * destroys the contract
## Fees

* marriage fee: .25 ether (~$125)
* divorce fee: 2.5 ether (~$1250)
* manual etherscan contract verification: .1 ether (~$50)
* any transactions: regular gas costs (ether paid to do anything on the network)

## Process

The process is explained in both technical and non technical terms below.

### Non-Technical

The process is explained below as a story below

#### Key Example Terms

In order to explain the process, example names and fees are given below:

* first person to be married: Bob
* second person to be married: Ella
* marriage fee: .25 ether
* divorce fee: 2.5 ether
* etherscan verification fee: .1 ether

#### Main Example

1. Bob and Ella are in love and want to do something special.
1. Bob goes to the crypto-weddings DApp and likes what he sees.
1. Bob shows Ella and she really likes the idea.
1. Both follow the directions to get a metamask account (if they don't already have one).
1. Both get some ether and puts it in their metamask accounts.
1. Bob or Ella fill out the form, pay the fee of .25 ether plus gas costs to create a wedding, and fill in the following information:
  * Partner1's name
  * Partner1's vows
  * Partner1's ethereum address (the address ella has in her metamask account)
  * Partner2's name
  * Partner2's vows
  * Partner2's ethereum address (the address Bobb has in his metamask account)
  * They choose a traditional wedding (they are a man and a woman, though gay and lesbian weddings are also available).
1. The wedding personalized wedding smart contract has been created and is automatically found in the DApp when they are logged in with metamask and are using the same account address as in the wedding contract.
1. Bob selects "I do" in the DApp
  * gas fees need to paid here
1. Ella selects "I do" in the DApp
  * gas fees need to be paid here
1. The wedding contract status changes to married. Hooray!
1. Bob or Ella select a picture and upload it to the wedding contract.
1. Friends and family can send money to the wedding contract as a gift in ether
1. Either Ella or Bob can claim the entire wedding gift balance of the contract (marriage is about trust)

#### Two Years Later...
1. Bob and Ella hate each other now :(
1. They both want a divorce
1. both agree to pay for half of the divorce.
1. Bob selects divorce in the DApp
  * Bob selects 1.25 as the amount of ether to send (half of the fee which is 2.5 ether)
  * gas fees need to be paid here
1. Ella selects divorce in the DApp
  * Ella selects 1.25 as the amount of ether to send (half of the fee which is 2.5 ether)
  * gas fees need to be paid here
1. The wedding contract self destructs and the wedding gone as soon as both agree and the 2.5 ether fee has been sent to the contract.
  * if the wedding was verified before and showing in the DApp, it no longer is...

#### In an Alternate Reality...

1. Bob loves Ella and wants to do something special.
1. Bob goes to the crypto-weddings DApp and likes what he sees.
1. Bob shows Ella and she says ok...
1. Both follow the directions to get a metamask account (if they don't already have one).
1. Both get some ether and puts it in their metamask accounts.
1. Bob fills out the form, pays the fee of .25 ether plus gas costs to create a wedding, and fills in the following information:
  * Partner1's name
  * Partner1's vows
  * Partner1's ethereum address (the address ella has in her metamask account)
  * Partner2's name
  * Partner2's vows
  * Partner2's ethereum address (the address Bobb has in his metamask account)
  * They choose a traditional wedding (they are a man and a woman, though gay and lesbian weddings are also available).
1. The wedding personalized wedding smart contract has been created and is automatically found in the DApp when they are logged in with metamask and are using the same account address as in the wedding contract.
1. Bob selects "I do" in the DApp
  * gas fees need to paid here
1. Ella selects "I dont" in the DApp!
  * gas fees need to be paid here
1. The wedding contract self destructs!
1. Sad ending :(

### Technical

There are two smart contracts which perform all needed functions:

1. `WeddingManager.sol`
1. `FlexibleWedding.sol`

#### WeddingManager

`WeddingManager.sol` uses `Ownable.sol` from OpenZeppelin and is thus ownable.

`WeddingManager.sol` does not need any constructor arguments:

```
// constructor
function WeddingManager()
  public
{
  owner = msg.sender;
  // keep placeholder to ensure no other 0 indexed in mapping
  weddings.push(address(0));
}
```

The owner is set when first deployed. A placeholder wedding is pushed to weddings array in the constructor as well in order to avoid issues with checking for valid weddings at weddings(0). This is because the mapping weddingIndex defaults to 0 for all uninitialized entries.

`WeddingManager.sol` is a smart contract that does the following:
* sets fees
  * onlyOwner
* collects fees
  * fees come from:
    * marriage fee on `WeddingManager` contract
    * divorce fee on `FlexibleWedding` contract
  * onlyOwner
* creates new wedding contracts
  * anyone can create a new `FlexibleWedding` from `WeddingManager`
    * fee must be paid
* keeps a list of `weddings` that have been created
  * modified when a new wedding is created
* verifies weddings
  * used as a way of filtering unverified weddings from the DApp

#### FlexibleWedding

All wedding contracts are essentially the same. The FlexibleWedding contract is essentially a contract between the two fiances.

`FlexibleWedding.sol` takes the following constructor arguments:

```
// constructor function
function FlexibleWedding
(
  address _partner1Address,
  string _partner1Name,
  string _partner1Vows,
  address _partner2Address,
  string _partner2Name,
  string _partner2Vows
)
  public
{
  require(isContract(msg.sender));
  partner1 = _partner1Address;
  partner1Name = _partner1Name;
  partner1Vows = _partner1Vows;
  partner2 = _partner2Address;
  partner2Name = _partner2Name;
  partner2Vows = _partner2Vows;
  weddingManager = msg.sender;
  weddingManagerContract = WeddingManager(weddingManager);
}
```

The `WeddingManager` contract is initialized in the constructor. This is used to get divorce fee price. `weddingManager` is also initialized as msg.sender since the contract should be created from the `WeddingManager` contract. The address is used to send funds/fees to the `WeddingManager` contract.

Wedding contracts do the following:

* agree to marriage
  * agreement is done through the `acceptProposal` function
  * must be one of the fiances
  * can only be called when marriage is in `Pending` status
  * once both agree wedding is put to `Married` status
  * `Married` event emitted
* disagree to marriage
  * either can disagree through `rejectProposal` function
  * must be in `Pending` status
  * `FlexibleWedding` contract instance destroyed
  * any funds in contract sent to `WeddingManager` upon destruction
* divorce
  * a fee must be paid in order to divorce
  * anyone can pay (fallback function intentionally left alone)
  * divorce can also be paid for through the divorce function itself
  * divorce successfully occurs when:
    * contract balance is at or above divorce fee
    * both `partner1` and `partner2` have run the divorce function
  * when divorce conditions are met
    * `Divorce` event emitted
    * `FlexibleWedding` sends funds to `WeddingManager`
    * `FlexibleWedding` `selfdestruct`s
* change wedding photo
  * either `partner1` or `partner2` can change the `weddingPhoto`
  * shows in the DApp
  * can be IPFS hash or url to image
    * IPFS maintained through amazon s3 server which pins images sent from client
    * DApp retrieves IPFS through client node
* send wedding gifts
  * anyone can send ether to this contract
  * these wedding gifts can be claimed in full by either fiance
  * if a divorce is in progress, these funds are no longer claimable and go towards the divorce fee
