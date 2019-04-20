pragma solidity ^0.5.7;


contract WeddingProxy {

  bytes32 internal constant weddingMasterSlot = keccak256("WeddingMaster");

  constructor(
    address _weddingMaster
  )
    public
  {
    require(isContract(_weddingMaster));

    bytes32 _weddingMasterSlot = weddingMasterSlot;
    assembly {
      sstore(_weddingMasterSlot, _weddingMaster)
    }
  }

  function isContract(
    address _address
  )
    internal
    view
    returns (bool)
  {
    uint256 _codeSize;

    assembly {
      _codeSize := extcodesize(_address)
    }

    return _codeSize > 0;
  }

  function weddingMaster()
    public
    view
    returns (address _weddingMaster)
  {
    bytes32 _weddingMasterSlot = weddingMasterSlot;
    assembly {
      _weddingMaster := sload(_weddingMasterSlot)
    }
  }

  function()
    external
    payable
  {
    bytes32 _weddingMasterSlot = weddingMasterSlot;
    assembly {

      // TODO: test with and without this... we might be able to get away with normal implementation rather than doing nothing like we are here...
      if lt(gas, 2301) {
        return (1, 1)
      }

      let _ptr := mload(0x40)

      let _masterContract := sload(_weddingMasterSlot)
      mstore(0x40, add(_ptr, 0x24))

      calldatacopy(
        _ptr,
        0,
        calldatasize
      )


      let _delegatecallSuccess := delegatecall(
        gas,
        _masterContract,
        _ptr,
        calldatasize,
        _ptr,
        returndatasize
      )

      if iszero(_delegatecallSuccess) {
        revert(0, 0)
      }

      returndatacopy(
        _ptr,
        0,
        returndatasize
      )

      return (_ptr, returndatasize)
    }
  }
}
