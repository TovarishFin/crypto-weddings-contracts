pragma solidity ^0.5.7;


interface IWeddingManager {
  function divorce(
    address _partner1,
    address _partner2
  )
    external;

  function removeCancelledWedding(
    address _partner1,
    address _partner2
  )
    external;

  function deRegisterWedding()
    external;

  function emitVowsUpdated(
    address _partner,
    string calldata _vows
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

  function emitGiftClaimed(
    address _gifter,
    uint256 _value
  )
    external;

  function emitUserPermissionUpdated(
    address _user,
    bool _banned
  )
    external;

  function emitMinGiftAmountUpdated(
    uint256 _newGiftAmount
  )
    external;

  function emitShouldHideGiftEventsUpdated(
    bool _shouldHideGiftEvents
  )
    external;
}
