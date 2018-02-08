pragma solidity ^0.4.17;


contract Migrations {
  address public owner;
  uint public lastCompletedMigration;

  modifier restricted() {
    if (msg.sender == owner)
    _;
  }

  function Migrations() public {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {
    lastCompletedMigration = completed;
  }

  function upgrade(address _newAddress) public restricted {
    Migrations upgraded = Migrations(_newAddress);
    upgraded.setCompleted(lastCompletedMigration);
  }
}
