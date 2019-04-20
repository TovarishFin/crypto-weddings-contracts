pragma solidity ^0.5.4;

import "./Upgradeable.sol";


contract UpgradeableProxy is Upgradeable {

  constructor(
    address _masterContract
  )
    public
  {
    require(isContract(_masterContract));
    masterContract = _masterContract;
  }

  function()
    external
    payable
  {
    assembly {

      if lt(gas, 2301) {
        return (1, 1)
      }

      let _ptr := mload(0x40)

      let _masterContract := mload(masterContract_slot)
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
