pragma solidity ^0.5.7;

import "./interfaces/IWeddingManager.sol";
import "./interfaces/IWedding.sol";


contract Wedding is IWedding {
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
  bool public shouldHideGiftEvents;
  uint256 public dateMarried;
  uint256 public minGiftAmount;
  mapping(address => bool) public banned;
  Stage public stage;

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
    string calldata _name2
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
    minGiftAmount = 1e16;
    partner1 = _p1Address;
    p1Name = _name1;
    partner2 = _p2Address;
    p2Name = _name2;
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

    weddingManager.emitVowsUpdated(msg.sender, _vows);
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
    weddingManager.removeCancelledWedding(partner1, partner2);

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
    msg.sender == partner1
      ? p1Answer = false
      : p2Answer = false;

    weddingManager.emitPartnerDivorces(msg.sender);

    if (!p1Answer && !p2Answer) {
      weddingManager.divorce(partner1, partner2);

      selfdestruct(msg.sender);
    }
  }

  function claimWeddingGifts()
    external
    onlyFiance
  {
    uint256 _contractBalance = address(this).balance;
    require(_contractBalance > 0);

    msg.sender.transfer(_contractBalance);

    weddingManager.emitGiftClaimed(msg.sender, _contractBalance);
  }

  function sendWeddingGift(
    string memory _message
  )
    public
    payable
  {
    require(msg.value >= minGiftAmount);
    weddingManager.emitGiftReceived(msg.sender, msg.value, _message);
  }

  function deRegisterWedding()
    external
    onlyFiance
  {
    weddingManager.deRegisterWedding();
  }

  function updateUserPermissions(
    address _user,
    bool _banned
  )
    external
    onlyFiance
  {
    require(banned[_user] != _banned);

    banned[_user] = _banned;

    weddingManager.emitUserPermissionUpdated(_user, _banned);
  }

  function updateMinGiftAmount(
    uint256 _minGiftAmount
  )
    external
    onlyFiance
  {
    minGiftAmount = _minGiftAmount;

    weddingManager.emitMinGiftAmountUpdated(_minGiftAmount);
  }

  function updateShouldHideGiftEvents(
    bool _shouldHideGiftEvents
  )
    external
    onlyFiance
  {
    require(_shouldHideGiftEvents != shouldHideGiftEvents);

    shouldHideGiftEvents = _shouldHideGiftEvents;

    weddingManager.emitShouldHideGiftEventsUpdated(_shouldHideGiftEvents);
  }

  function()
    external
    payable
  {
    sendWeddingGift("");
  }
}
