pragma solidity ^0.5.7;


contract Wedding { 
  address public partner1;
  address public partner2;
  string public p1Name;
  string public p2Name;
  string public p1Vows;
  string public p2Vows;
  string public weddingPhoto;
  bool public p1Answer;
  bool public p2Answer;
  bool public married;
  uint256 public dateMarried;
  WeddingType public weddingType;

  enum WeddingType {
    Traditional,
    ManAndMan,
    WomanAndWoman,
    ManAndOther,
    WomanAndOther
  }

  enum Stage {
    Proposed,
    Answering,
    Married,
    Divorced
  }

  function initialize(
    address _p1Address,
    string calldata _p1Name,
    address _p2Address,
    string calldata _p2Name,
    WeddingType _weddingType
  )
    external
  {
    require(_p1Address != address(0));
    require(_p2Address != address(0)); 
    require(bytes(_p1Name).length > 0);
    require(bytes(_p2Name).length > 0);
    
    partner1 = _p1Address;
    p1Name = _p1name;
    partner2 = _p2Address;
    p2Name = _p22ame;
    weddingType = _weddingType;
  }   
}     
      
