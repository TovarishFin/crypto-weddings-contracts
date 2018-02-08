pragma solidity 0.4.19;

import "./WeddingManagerInterface.sol";


contract TraditionalWedding {
  // master contract which created this contract
  WeddingManagerInterface public weddingManager;
  // public address of the bride
  address public bride;
  // public address of the groom
  address public groom;
  // name of the bride
  string public brideName;
  // name of the groom
  string public groomName;
  // need to check how long vows can be...
  string public brideVows;
  // need to check how long vows can be...
  string public groomVows;
  // url to image or ipfs hash
  string public weddingPhoto;
  // bride's consent
  bool public brideSaysYes = false;
  // groom's consent
  bool public groomSaysYes = false;
  // the big end result
  bool public married = false;
  // date both agreed
  uint256 public dateMarried = 0;

  event Married
  (
    address indexed brideAddress,
    address indexed groomAddress
  );
  event Divorced
  (
    address indexed brideAddress,
    address indexed groomAddress
  );
  // cannot index strings...
  event WeddingPhotoChanged(string newWeddingPhoto);
  event GroomSaysYes(address indexed groomAddress);
  event BrideSaysYes(address indexed brideAddress);
  event GroomDivorces
  (
    address indexed groomAddress,
    uint256 indexed divorceValue
  );
  event BrideDivorces
  (
    address indexed groomAddress,
    uint256 indexed divorceValue
  );
  event WeddingCancelled
  (
    address indexed cancelAddress
  );



  // only allow fiances to run functions
  modifier onlyFiances() {
    require(msg.sender == bride || msg.sender == groom);
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
  function TraditionalWedding
  (
    address _brideAddress,
    string _brideName,
    string _brideVows,
    address _groomAddress,
    string _groomName,
    string _groomVows
  )
    public
  {
    require(isContract(msg.sender));
    bride = _brideAddress;
    brideName = _brideName;
    brideVows = _brideVows;
    groom = _groomAddress;
    groomName = _groomName;
    groomVows = _groomVows;
    weddingManager = WeddingManagerInterface(msg.sender);
  }

  // fallback function where divorces can be paid for by third parties
  // only if divorce has started
  function ()
    public
    payable
  {
    revert();
  }

  // agree to vows (can be either groom or bride but both are needed)
  function acceptProposal()
    external
    onlyFiances
    atPending
  {
    msg.sender == bride
    ? brideSaysYes = true
    : groomSaysYes = true;
    if (brideSaysYes && groomSaysYes) {
      married = true;
      dateMarried = block.timestamp;
      Married(bride, groom);
    } else {
      msg.sender == bride
      ? BrideSaysYes(msg.sender)
      : GroomSaysYes(msg.sender);
    }
  }

  // say no and destroy everything...
  function rejectProposal()
    external
    onlyFiances
    atPending
  {
    weddingManager.removeWedding(bride, groom);
    WeddingCancelled(msg.sender);
    selfdestruct(weddingManager);
  }

  // add or change a wedding photo
  function changeWeddingPhoto(
    string _photo
  )
    external
    onlyFiances
    atMarried
  {
    weddingPhoto = _photo;
    WeddingPhotoChanged(weddingPhoto);
  }

  // cancel marriage for fee and destroy contract
  function divorce()
    external
    onlyFiances
    payable
    atMarried
  {
    msg.sender == bride ? brideSaysYes = false : groomSaysYes = false;
    msg.sender == bride
    ? BrideDivorces(msg.sender, msg.value)
    : GroomDivorces(msg.sender, msg.value);
    uint256 _divorceFee = weddingManager.divorceFee();

    if (!brideSaysYes && !groomSaysYes && this.balance >= _divorceFee) {
      married = false;
      weddingManager.removeWedding(bride, groom);
      Divorced(bride, groom);
      selfdestruct(weddingManager);
    }
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
}
