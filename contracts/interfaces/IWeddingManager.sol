pragma solidity ^0.5.7;


interface IWeddingManager {
  function divorce(
    address _partner1,
    address _partner2
  )
    external;

  function removeCancelledWedding(
    address _partner1,
    address _partner2
  )
    external;

  function deRegisterWedding()
    external;
}
