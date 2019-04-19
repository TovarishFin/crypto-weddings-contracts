pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./FlexibleWedding.sol";


contract WeddingManager is Ownable {

  uint256 public marriageFee = 25e16;
  uint256 public divorceFee = 25e17;
  address[] public weddings;
  address[] public verifiedWeddings;
  // mapping of fiance to wedding address
  mapping(address => address) public weddingOf;
  // used to find wedding array index when pushed
  mapping(address => uint) public weddingIndex;
  // used to know what to show on the dapp
  mapping(address => bool) public verifiedWedding;
  // used to find verifiedWedding array index when pushed
  mapping(address => uint) public verifiedWeddingIndex;

  modifier weddingExists(address _weddingAddress) {
    require(weddingIndex[_weddingAddress] != 0);
    _;
  }

  modifier feePaid() {
    require(msg.value == marriageFee);
    _;
  }

  modifier onlyWedding() {
    require(weddingIndex[msg.sender] != 0);
    require(weddings[weddingIndex[msg.sender]] != address(0));
    _;
  }

  event WeddingStarted(
    address indexed newMarriage,
    address indexed partner1Address,
    string partner1Name,
    address indexed partner2Address,
    string partner2Name
  );

  event Divorce(
    address indexed weddingAddress,
    address indexed partner2,
    address indexed partner1
  );

  event Partner1Accepts(
    address indexed weddingAddress,
    address indexed partner1
  );

  event Partner2Accepts(
    address indexed weddingAddress,
    address indexed partner2
  );

  event Partner1Divorces(
    address indexed weddingAddress,
    address indexed partner1
  );

  event Partner2Divorces(
    address indexed weddingAddress,
    address indexed partner2
  );

  event OffChainDataChanged(
    address indexed weddingAddress,
    string ipfsHash
  );

  event WeddingCancelled(
    address indexed weddingAddress
  );

  event Married(
    address indexed weddingAddress,
    address indexed partner1,
    address indexed partner2
  );

  event WeddingMoney(
    address indexed weddingAddress,
    address indexed gifter,
    uint256 indexed value
  );

  constructor()
    public
  {
    // keep placeholder to ensure no other 0 indexed in mapping
    weddings.push(address(0));
  }

  // event triggers

  function triggerDivorce(
    address _partner1,
    address _partner2
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Divorce(msg.sender, _partner1, _partner2);
    return true;
  }

  function triggerPartner1Accepts(
    address _partner1
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Partner1Accepts(msg.sender, _partner1);
    return true;
  }

  function triggerPartner2Accepts(
    address _partner2
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Partner2Accepts(msg.sender, _partner2);
    return true;
  }

  function triggerPartner1Divorces(
    address _partner1
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Partner1Divorces(msg.sender, _partner1);
    return true;
  }

  function triggerPartner2Divorces(
    address _partner2
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Partner2Divorces(msg.sender, _partner2);
    return true;
  }

  function triggerOffChainDataChanged(
    string memory _ipfsHash
  )
    public
    onlyWedding
    returns (bool)
  {
    emit OffChainDataChanged(msg.sender, _ipfsHash);
    return true;
  }

  function triggerWeddingCancelled()
    public
    onlyWedding
    returns (bool)
  {
    emit WeddingCancelled(msg.sender);
    return true;
  }

  function triggerMarried(
    address _partner1,
    address _partner2
  )
    public
    onlyWedding
    returns (bool)
  {
    emit Married(msg.sender, _partner1, _partner2);
    return true;
  }

  function triggerWeddingMoney(
    address _gifter,
    uint256 _value
  )
    public
    returns (bool)
  {
    emit WeddingMoney(msg.sender, _gifter, _value);
    return true;
  }

  // end event triggers

  function validateWedding(
    address _fianceAddress,
    string memory _fianceName,
    string memory _fianceVows,
    address _fiance2Address,
    string memory _fiance2Name,
    string memory _fiance2Vows
  )
    private
    view
  {
    bytes memory _fianceNameTest = bytes(_fianceName);
    bytes memory _fiance2NameTest = bytes(_fiance2Name);
    bytes memory _fianceVowsTest = bytes(_fianceVows);
    bytes memory _fiance2VowsTest = bytes(_fiance2Vows);

    require(
      msg.sender == _fianceAddress ||
      msg.sender == _fiance2Address
    );
    require(_fianceAddress != _fiance2Address);
    require(weddingOf[_fianceAddress] == address(0));
    require(weddingOf[_fiance2Address] == address(0));
    require(_fianceNameTest.length != 0);
    require(_fiance2NameTest.length != 0);
    require(_fianceAddress != address(0));
    require(_fiance2Address != address(0));
    require(_fianceVowsTest.length != 0);
    require(_fiance2VowsTest.length != 0);
  }

  function addWedding(
    address _weddingAddress,
    address _fiance1,
    address _fiance2
  )
    private
  {
    weddings.push(_weddingAddress);
    weddingIndex[_weddingAddress] = weddings.length - 1;
    weddingOf[_fiance1] = _weddingAddress;
    weddingOf[_fiance2] = _weddingAddress;
  }

  // only to be called by wedding contracts when selfdestructing
  function removeWedding(
    address _participant1,
    address _participant2
  )
    external
    onlyWedding
    returns (bool)
  {
    weddingOf[_participant1] = address(0);
    weddingOf[_participant2] = address(0);
    weddings[weddingIndex[msg.sender]] = address(0);
    weddingIndex[msg.sender] = uint256(0);
    verifiedWedding[msg.sender] = false;
    return true;
  }

  function listWeddings()
    external
    view
    returns (address[] memory)
  {
    return weddings;
  }

  function weddingsLength()
    external
    view
    returns (uint256)
  {
    return weddings.length;
  }

  function listVerifiedWeddings()
    external
    view
    returns (address[] memory)
  {
    return verifiedWeddings;
  }

  function verifiedWeddingsLength()
    external
    view
    returns (uint256)
  {
    return verifiedWeddings.length;
  }

  // begin owner functions

  // use as owner or as the verifiedWedding contract itself... in case selfdestruct from weddingContract
  function toggleWeddingVerification(
    address _weddingAddress
  )
    external
    onlyOwner
  {
    if (verifiedWedding[_weddingAddress]) {
      verifiedWedding[_weddingAddress] = false;
      verifiedWeddings[verifiedWeddingIndex[_weddingAddress]] = address(0);
    } else {
      verifiedWedding[_weddingAddress] = true;
      verifiedWeddings.push(_weddingAddress);
      verifiedWeddingIndex[_weddingAddress] = weddings.length - 1;
    }
  }

  function changeMarriageFee(
    uint256 _newFee
  )
    external
    onlyOwner
  {
    marriageFee = _newFee;
  }

  function changeDivorceFee(
    uint256 _newFee
  )
    external
    onlyOwner
  {
    divorceFee = _newFee;
  }

  function collectFees()
    external
    onlyOwner
  {
    uint256 _bal = address(this).balance;
    require(_bal > 0);
    msg.sender.transfer(_bal);
  }

  // end owner functions

  // start wedding if fee is paid
  function startWedding(
    address payable _partner1Address,
    string calldata _partner1Name,
    string calldata _partner1Vows,
    address payable _partner2Address,
    string calldata _partner2Name,
    string calldata _partner2Vows,
    uint256 _weddingType
  )
    external
    payable
    feePaid
    returns (address)
  {
    validateWedding(
      _partner1Address,
      _partner1Name,
      _partner1Vows,
      _partner2Address,
      _partner2Name,
      _partner2Vows
    );

    FlexibleWedding _newMarriage = new FlexibleWedding(
      _partner1Address,
      _partner1Name,
      _partner1Vows,
      _partner2Address,
      _partner2Name,
      _partner2Vows,
      _weddingType
    );
    addWedding(address(_newMarriage), _partner1Address, _partner2Address);
    emit WeddingStarted(
      address(_newMarriage),
      _partner1Address,
      _partner1Name,
      _partner2Address,
      _partner2Name
    );
    return address(_newMarriage);
  }

  // do not allow random money to come into the contract
  function()
    external
    payable
  {
    revert();
  }
}
