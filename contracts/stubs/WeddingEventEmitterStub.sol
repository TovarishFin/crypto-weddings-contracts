pragma solidity ^0.5.7;

import "../WeddingEventEmitter.sol";


contract WeddingEventEmitterStub is WeddingEventEmitter {

  function emitVowsUpdatedExternal(
    address _weddingManager,
    address _partner,
    string calldata _vows
  )
    external
  {
    emitVowsUpdated(_weddingManager, _partner, _vows);
  }

  function emitMarriedExternal(
    address _weddingManager,
    address _partner1,
    address _partner2
  )
    external
  {
    emitMarried(_weddingManager, _partner1, _partner2);
  }

  function emitPartnerAcceptsExternal(
    address _weddingManager,
    address _partner
  )
    external
  {
    emitPartnerAccepts(_weddingManager, _partner);
  }

  function emitWeddingCancelledExternal(
    address _weddingManager,
    address _partner
  )
    external
  {
    emitWeddingCancelled(_weddingManager, _partner);
  }

  function emitWeddingPhotoUpdatedExternal(
    address _weddingManager,
    string calldata _uri
  )
    external
  {
    emitWeddingPhotoUpdated(_weddingManager, _uri);
  }

  function emitPartnerDivorcesExternal(
    address _weddingManager,
    address _partner
  )
    external
  {
    emitPartnerDivorces(_weddingManager, _partner);
  }

  function emitGiftReceivedExternal(
    address _weddingManager,
    address _gifter,
    uint256 _value,
    string calldata _message
  )
    external
  {
    emitGiftReceived(
      _weddingManager,
      _gifter,
      _value,
      _message
    );
  }

  function emitGiftClaimedExternal(
    address _weddingManager,
    address _partner,
    uint256 _contractBalance
  )
    external
  {
    emitGiftClaimed(_weddingManager, _partner, _contractBalance);
  }

  function emitUserPermissionUpdatedExternal(
    address _weddingManager,
    address _user,
    bool _banned
  )
    external
  {
    emitUserPermissionUpdated(_weddingManager, _user, _banned);
  }

  function emitMinGiftAmountUpdatedExternal(
    address _weddingManager,
    uint256 _minGiftAmount
  )
    external
  {
    emitMinGiftAmountUpdated(_weddingManager, _minGiftAmount);
  }

  function emitShouldHideGiftEventsUpdatedExternal(
    address _weddingManager,
    bool _shouldHideGiftEvents
  )
    external
  {
    emitShouldHideGiftEventsUpdated(_weddingManager, _shouldHideGiftEvents);
  }
}
