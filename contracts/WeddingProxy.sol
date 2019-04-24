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


      let _masterContract := sload(_weddingMasterSlot)

      calldatacopy(
        0x0,
        0,
        calldatasize
      )


      let _delegatecallSuccess := delegatecall(
        gas,
        _masterContract,
        0x0,
        calldatasize,
        0x0,
        returndatasize
      )

      if iszero(_delegatecallSuccess) {
        revert(0, 0)
      }

      returndatacopy(
        0x0,
        0,
        returndatasize
      )

      return (0x0, returndatasize)
    }
  }
}
