pragma solidity ^0.5.7;


/* solium-disable security/no-low-level-calls */
contract WeddingEventEmitter {

  function emitVowsUpdated(
    address _weddingManager,
    address _partner,
    string memory _vows
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = _weddingManager.call(abi.encodeWithSignature(
      "emitVowsUpdated(address,string)",
      _partner,
      _vows
    ));
  }

  function emitMarried(
    address _weddingManager,
    address _partner1,
    address _partner2
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitMarried(address,address)",
      _partner1,
      _partner2
    ));
  }

  function emitPartnerAccepts(
    address _weddingManager,
    address _partner
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitPartnerAccepts(address)",
      _partner
    ));

  }

  function emitWeddingCancelled(
    address _weddingManager,
    address _partner
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitWeddingCancelled(address)",
      _partner
    ));
  }

  function emitWeddingPhotoUpdated(
    address _weddingManager,
    string memory _uri
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitWeddingPhotoUpdated(string)",
      _uri
    ));
  }

  function emitPartnerDivorces(
    address _weddingManager,
    address _partner
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitPartnerDivorces(address)",
      _partner
    ));

  }

  function emitGiftReceived(
    address _weddingManager,
    address _gifter,
    uint256 _value,
    string memory _message
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitGiftReceived(address,uint256,string)",
      _gifter,
      _value,
      _message
    ));
  }

  function emitGiftClaimed(
    address _weddingManager,
    address _partner,
    uint256 _contractBalance
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitGiftClaimed(address,uint256)",
      _partner,
      _contractBalance
    ));
  }

  function emitUserPermissionUpdated(
    address _weddingManager,
    address _user,
    bool _banned
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitUserPermissionUpdated(address,bool)",
      _user,
      _banned
    ));


  }

  function emitMinGiftAmountUpdated(
    address _weddingManager,
    uint256 _minGiftAmount
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitMinGiftAmountUpdated(uint256)",
      _minGiftAmount
    ));
  }

  function emitShouldHideGiftEventsUpdated(
    address _weddingManager,
    bool _shouldHideGiftEvents
  )
    internal
    returns (bool _success, bytes memory _returnData)
  {
    (_success, _returnData) = address(_weddingManager).call(abi.encodeWithSignature(
      "emitShouldHideGiftEventsUpdated(bool)",
      _shouldHideGiftEvents
    ));
  }
}

/* solium-disable security/no-low-level-calls */
