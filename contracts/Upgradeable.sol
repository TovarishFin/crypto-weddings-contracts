pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Upgradeable is Ownable {
  address public masterContract;
  bool public initialized;

  event MasterContractUpgraded(
    address upgradedFrom,
    address upgradedTo
  );

  modifier initOneTimeOnly() {
    require(msg.sender == owner());
    require(!initialized);

    _;

    initialized = true;
  }

  function isContract(
    address _address
  )
    public
    view
    returns (bool)
  {
    uint256 _codeSize;
    assembly { _codeSize := extcodesize(_address) }

    return _codeSize > 0;
  }

  function upgradeMaster(
    address _masterContract
  )
    external
    onlyOwner
    returns (bool)
  {
    require(_masterContract != address(0));
    require(_masterContract != masterContract);
    require(isContract(_masterContract));

    address _oldMasterContract = masterContract;
    masterContract = _masterContract;

    emit MasterContractUpgraded(
      _oldMasterContract,
      _masterContract
    );

    return true;
  }
}
