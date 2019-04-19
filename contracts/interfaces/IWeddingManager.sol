pragma solidity 0.5.7;


interface IWeddingManager {
  function divorceFee()
    external
    returns (uint256);

  function removeWedding(
    address _participant1,
    address _participant2
  )
    external
    returns (bool);

  function triggerDivorce(
    address _partner1,
    address _partner2
  )
    external
    returns (bool);

  function triggerPartner1Accepts(
    address _partner1
  )
    external
    returns (bool);

  function triggerPartner2Accepts(
    address _partner2
  )
    external
    returns (bool);

  function triggerPartner1Divorces(
    address _partner1,
    uint256 _value
  )
    external
    returns (bool);

  function triggerPartner2Divorces(
    address _partner2,
    uint256 _value
  )
    external
    returns (bool);

  function triggerOffChainDataChanged(
    string calldata _ipfsHash
  )
    external
    returns (bool);

  function triggerWeddingCancelled()
    external
    returns (bool);

  function triggerMarried(
    address _partner1,
    address _partner2
  )
    external
    returns (bool);

  function triggerWeddingMoney(
    address _gifter,
    uint256 _value
  )
    external
    returns (bool);
}
