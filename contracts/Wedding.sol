pragma solidity ^0.5.7;

import "./interfaces/IWeddingManager.sol";


contract Wedding {
  IWeddingManager public weddingManager;
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
    require(stage == _stage);

    _;
  }

  modifier atEitherStage(
    Stage _stage1,
    Stage _stage2
  ) {
    require(
      stage == _stage1 ||
      stage == _stage2
    );

    _;
  }

  modifier onlyFiance() {
    require(
      msg.sender == partner1 ||
      msg.sender == partner2
    );

    _;
  }

  function isContract(
    address _address
  )
    internal
    view
    returns (bool)
  {
    uint256 _codeSize;

    assembly {
      _codeSize := extcodesize(_address)
    }

    return _codeSize > 0;
  }

  function initialize(
    address _p1Address,
    string calldata _name1,
    address _p2Address,
    string calldata _name2,
    WeddingType _weddingType
  )
    external
    atStage(Stage.Uninitialized)
  {
    require(isContract(msg.sender));
    require(_p1Address != address(0));
    require(_p2Address != address(0));
    require(_p1Address != _p2Address);
    require(bytes(_name1).length > 0);
    require(bytes(_name2).length > 0);

    weddingManager = IWeddingManager(msg.sender);
    partner1 = _p1Address;
    p1Name = _name1;
    partner2 = _p2Address;
    p2Name = _name2;
    weddingType = _weddingType;

    stage = Stage.Initialized;
  }

  function updateVows(
    string calldata _vows
  )
    external
    onlyFiance
    atEitherStage(Stage.Initialized, Stage.InProgress)
  {
    msg.sender == partner1
      ? p1Vows = _vows
      : p2Vows = _vows;
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

      weddingManager.emitMarried(partner1, partner2);

      return;
    }

    stage = Stage.InProgress;

    weddingManager.emitPartnerAccepts(msg.sender);
  }

  function rejectProposal()
    external
    onlyFiance
    atEitherStage(Stage.Initialized, Stage.InProgress)
  {
    weddingManager.emitWeddingCancelled(msg.sender);

    selfdestruct(msg.sender);
  }

  function updateWeddingPhoto(
    string calldata _uri
  )
    external
    onlyFiance
    atStage(Stage.Married)
  {
    require(
      keccak256(bytes(_uri)) != 
      keccak256(bytes(weddingPhoto))
    );
    weddingPhoto = _uri;

    weddingManager.emitWeddingPhotoUpdated(_uri);
  }

  function divorce()
    external
    onlyFiance
    atStage(Stage.Married)
  {
    require(address(this).balance == 0);

    msg.sender == partner1
      ? p1Answer = false
      : p2Answer = false;

    weddingManager.emitPartnerDivorces(msg.sender);

    if (!p1Answer && !p2Answer) {
      weddingManager.divorce(partner1, partner2);
      weddingManager.emitDivorced(partner1, partner2);

      selfdestruct(msg.sender);
    }
  }

  function claimWeddingGifts()
    external
    onlyFiance
  {
    msg.sender.transfer(address(this).balance);
  }

  function sendWeddingGift(
    string memory _message
  )
    public
    payable
  {
    weddingManager.emitGiftReceived(msg.sender, msg.value, _message);
  }

  function()
    external
    payable
  {
    sendWeddingGift("");
  }
}
