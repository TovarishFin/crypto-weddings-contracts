pragma solidity ^0.5.7;


interface IWedding {

  function initialize(
    address _p1Address,
    string calldata name2,
    address _p2Address,
    string calldata _name2
  )
    external;
}
