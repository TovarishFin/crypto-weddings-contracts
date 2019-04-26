pragma solidity ^0.5.7;

import "../WeddingManager.sol";


contract WeddingManagerStub is WeddingManager {
  bool public constant isStub = true;

  /**
    @dev allow testing by allowing any address to be added as a wedding.
    this will allow an account to trigger events as well as test other
    "onlyWedding" functionality
  */
  function addWeddingStub(
    address _wedding,
    address _partner1,
    address _partner2
  )
    external
  {
    super.addWedding(_wedding, _partner1, _partner2);
  }
}
