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
  Stage public stage;

  enum WeddingType {
    Traditional,
    ManAndMan,
    WomanAndWoman,
    ManAndOther,
    WomanAndOther
  }

  enum Stage {
    Uninitialized,
    Initialized,
    InProgress,
    Married,
    Divorced
  }

  modifier atStage(
    Stage _stage
  ) {
    require(stage = _stage);

    _;
  }

  modifier atEitherStage(
    Stage _stage1,
    Stage _stage2
  ) {
    require(
      stage == _stage1 ||
      stage ==  _stage2
    );

    _;
  }

  modifier onlyFiance() {
    require(
      msg.sender == partner1 ||
      msg.sener == partner2
    );

    _;
  }

  function initialize(
    address _p1Address,
    string calldata _p1Name,
    address _p2Address,
    string calldata _p2Name,
    WeddingType _weddingType
  )
    external
    atStage(Stage.Uninitialized)
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

    stage = Stages.Initialized;
  }

  function acceptProposal()
    external
    onlyFiance
    atEitherStage(Stage.Initialized, Stage.InProgress)
  {
    msg.sender == partner1 
      ? p1Answer = true 
      : p2Answer = true;

    if (p1Answer && p2Answer) {
      married = true;
      dateMarried = block.timestamp;
      stage = Stage.Married;

      return;
    }
    
    stage = Stage.InProgress;
  }

  function rejectProposal()
    external
    onlyFiance
    atEitherStage(Stage.Initialized, Stage.InProgress)
  {
    msg.sender == partner1
      ? selfdestruct(partner1)
      : selfdestruct(partern2);
  }

  function updateWeddingPhoto(
    string calldata _weddingPhoto
  )
    external
    onlyFiance
    atStage(stage.Married)
  {
    weddingPhoto = _weddingPhoto;
  }

  function divorce()
    external
    onlyFiance
    atStage(Stage.Married)
  {
    require(address(this).balance == 0);

    msg.sender == parter1
      ? p1Answer = false
      : p2Answer = false;

    if (!p1Answer && !p2Answer) {
      selfdestruct(partner1)
    }
  }

  function claimWeddingGifts()
    external
    onlyFiance
  {
    msg.sender.transfer(address(this).balance);
  }

  function()
    external
    payable
  {
    
  }
}     
      
