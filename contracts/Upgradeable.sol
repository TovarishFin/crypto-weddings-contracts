pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract Upgradeable is Ownable {
  address public masterContract;
  bool public initialized;
  bool public paused;

  event Paused(address account);

  event Unpaused(address account);

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

  modifier whenNotPaused() {
    require(!paused);

    _;
  }

  modifier whenPaused() {
    require(paused);

    _;
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

  function pause()
    public
    onlyOwner
    whenNotPaused
  {
    paused = true;
    emit Paused(msg.sender);
  }

  function unpause()
    public
    onlyOwner
    whenPaused
  {
    paused = false;
    emit Unpaused(msg.sender);
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
