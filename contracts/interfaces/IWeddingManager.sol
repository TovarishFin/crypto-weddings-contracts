pragma solidity ^0.5.7;


interface IWeddingManager {
  function divorce(
    address _partner1,
    address _partner2
  )
    external;

  function emitPartnerAccepts(
    address _partner
  )
    external;

  function emitPartnerDivorces(
    address _partner
  )
    external;

  function emitWeddingPhotoUpdated(
    address _wedding,
    string calldata _uri
  )
    external;

  function emitWeddingCancelled(
    address _cancellor
  )
    external;

  function emitMarried(
    address _partner1,
    address _partner2
  )
    external;

  function emitDivorced(
    address _partner1,
    address _partner2
  )
    external;

  function emitGiftReceived(
    address _gifter,
    uint256 _value,
    string calldata _message
  )
    external;
}
