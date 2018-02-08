pragma solidity 0.4.19;


contract WeddingManagerInterface {
  // fee to be paid in order to divorce
  uint256 public divorceFee;
  // list of all weddings
  address[] public weddings;
  // used to find wedding array index when pushed
  mapping(address => uint) public weddingIndex;

  modifier onlyWedding() {
    require(weddingIndex[msg.sender] != 0);
    require(weddings[weddingIndex[msg.sender]] != address(0));
    _;
  }

  function removeWedding(address _participant1, address _participant2)
    external
    onlyWedding
    returns (bool)
  {}

}
