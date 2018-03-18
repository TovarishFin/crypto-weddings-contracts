pragma solidity 0.4.19;


contract WeddingManagerInterface {
  // fee to be paid in order to divorce
  uint256 public divorceFee;

  function removeWedding(
    address _participant1,
    address _participant2
  )
    external
    returns (bool)
  {}

  function triggerDivorce(
    address _partner1,
    address _partner2
  )
    public
    returns (bool)
  {}

  function triggerPartner1Accepts(
    address _partner1
  )
    public
    returns (bool)
  {}

  function triggerPartner2Accepts(
    address _partner2
  )
    public
    returns (bool)
  {}

  function triggerPartner1Divorces(
    address _partner1,
    uint256 _value
  )
    public
    returns (bool)
  {}

  function triggerPartner2Divorces(
    address _partner2,
    uint256 _value
  )
    public
    returns (bool)
  {}

  function triggerOffChainDataChanged(
    string _ipfsHash
  )
    public
    returns (bool)
  {}

  function triggerWeddingCancelled()
    public
    returns (bool)
  {}

  function triggerMarried(
    address _partner1,
    address _partner2
  )
    public
    returns (bool)
  {}

  function triggerWeddingMoney(
    address _gifter,
    uint256 _value
  )
    public
    returns (bool)
  {}
}


contract FlexibleWedding {
  // master contract which created this contract
  WeddingManagerInterface public weddingManager;
  // public address of the partner1
  address public partner1;
  // public address of the partner2
  address public partner2;
  // name of the partner1
  string public partner1Name;
  // name of the partner2
  string public partner2Name;
  // need to check how long vows can be...
  string public partner1Vows;
  // need to check how long vows can be...
  string public partner2Vows;
  // url to image or ipfs hash
  string public weddingPhoto;
  // partner1's consent
  bool public partner1SaysYes;
  // partner2's consent
  bool public partner2SaysYes;
  // the big end result
  bool public married;
  // date both agreed
  uint256 public dateMarried;
  // indicates which type of wedding
  uint256 public weddingType;

  // only allow fiances to run functions
  modifier onlyFiances() {
    require(msg.sender == partner1 || msg.sender == partner2);
    _;
  }

  // only allow functions to run during certain wedding statuses
  modifier atMarried {
    require(married == true);
    _;
  }

  modifier atPending {
    require(married == false);
    _;
  }

  // constructor function
  function FlexibleWedding
  (
    address _partner1Address,
    string _partner1Name,
    string _partner1Vows,
    address _partner2Address,
    string _partner2Name,
    string _partner2Vows,
    uint256 _weddingType
  )
    public
  {
    require(isContract(msg.sender));
    partner1 = _partner1Address;
    partner1Name = _partner1Name;
    partner1Vows = _partner1Vows;
    partner2 = _partner2Address;
    partner2Name = _partner2Name;
    partner2Vows = _partner2Vows;
    weddingType = _weddingType;
    weddingManager = WeddingManagerInterface(msg.sender);
  }

  function isContract(address _address)
    private
    view
    returns (bool)
  {
    uint256 _size;
    assembly { _size := extcodesize(_address) }
    return _size > 0;
  }

  // agree to vows (can be either partner2 or partner1 but both are needed)
  function acceptProposal()
    external
    onlyFiances
    atPending
    returns (bool)
  {
    msg.sender == partner1
    ? partner1SaysYes = true
    : partner2SaysYes = true;

    msg.sender == partner1
    ? weddingManager.triggerPartner1Accepts(msg.sender)
    : weddingManager.triggerPartner2Accepts(msg.sender);

    if (partner1SaysYes && partner2SaysYes) {
      married = true;
      dateMarried = block.timestamp;
      weddingManager.triggerMarried(partner1, partner2);
    }

    return true;
  }

  // say no and destroy everything...
  function rejectProposal()
    external
    onlyFiances
    atPending
    returns (bool)
  {
    weddingManager.removeWedding(partner1, partner2);
    weddingManager.triggerWeddingCancelled();
    msg.sender == partner1
      ? selfdestruct(partner2)
      : selfdestruct(partner1);

    return true;
  }

  // add or change a wedding photo
  function changeWeddingPhoto(
    string _photo
  )
    external
    onlyFiances
    atMarried
    returns (bool)
  {
    weddingPhoto = _photo;
    weddingManager.triggerOffChainDataChanged(_photo);

    return true;
  }

  // cancel marriage for fee and destroy contract
  function divorce()
    external
    onlyFiances
    payable
    atMarried
    returns (bool)
  {
    msg.sender == partner1
      ? partner1SaysYes = false
      : partner2SaysYes = false;

    msg.sender == partner1
    ? weddingManager.triggerPartner1Divorces(msg.sender, msg.value)
    : weddingManager.triggerPartner2Divorces(msg.sender, msg.value);

    uint256 _divorceFee = weddingManager.divorceFee();

    if (!partner1SaysYes && !partner2SaysYes && this.balance >= _divorceFee) {
      require(weddingManager.triggerDivorce(partner1, partner2));
      require(weddingManager.removeWedding(partner1, partner2));
      selfdestruct(weddingManager);
    }

    return true;
  }

  function claimWeddingMoney()
    external
    onlyFiances
    returns (bool)
  {
    // allow to claim wedding money at any point other than a during divorce process
    require(
      (married == false)
      || (partner1SaysYes && partner2SaysYes)
    );
    msg.sender.transfer(this.balance);
  }

  // fallback function where divorces can be paid for by third parties
  // only if divorce has started
  function ()
    public
    payable
  {
    weddingManager.triggerWeddingMoney(msg.sender, msg.value);
  }
}
