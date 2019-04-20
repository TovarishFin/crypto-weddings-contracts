pragma solidity ^0.5.7;


contract WeddingProxy {

  bytes32 internal constant weddingMasterSlot = keccak256("WeddingMaster");
  
  constructor(
    address _weddingMaster
  )
    public
  {
    require(isContract(_weddingMaster));

    assembly {
      sstore(weddingMaster_slot, _weddingMaster)
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
      _codeSize := extcodesize(_weddingMaster)
    }

    return _codeSize > 0;
  }

  function weddingMaster()
    public
    view
    returns (address _weddingMaster)
  {
    assembly {
      _weddingMaster := sload(weddingMaster_slot)
    }
  }

  function()
    external
    payable
  {
    assembly {

      // TODO: test with and without this... we might be able to get away with normal implementation rather than doing nothing like we are here...
      if lt(gas, 2301) {
        return (1, 1)
      }

      let _masterContract := sload(weddingMaster_slot)
      mstore(0x40, add(_ptr, 0x24))

      //
      // run delegate call using retrieved master contract
      //

      // calldatacopy(t, f, s) copy calldata to memory
      calldatacopy(
        _ptr, // t = mem position to
        0, // f = mem position from
        calldatasize // s = size bytes
      )

      // delegatecall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let _delegatecallSuccess := delegatecall(
        gas, // g = gas
        _masterContract, // a = address (loaded from masterContract slot storage)
        _ptr, // in = mem in mem[in..(in+insize)]
        calldatasize, // insize = mem insize mem[in..(in+insize)]
        _ptr, // out = mem out mem[out..(out+outsize)]
        returndatasize // outsize = mem outsize mem[out..(out+outsize)]
      )

      // revert if not successful
      if iszero(_delegatecallSuccess) {
        revert(0, 0)
      }

      // returndatacopy(t, f, s) overwrite calldata with returndata to save space
      returndatacopy(
        _ptr, // t = mem position to
        0, // f = mem position from
        returndatasize // s = size bytes
      )

      return (_ptr, returndatasize)
    }
  }
}
