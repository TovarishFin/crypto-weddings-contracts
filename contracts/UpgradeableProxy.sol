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
      let _masterContract := sload(masterContract_slot)

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
