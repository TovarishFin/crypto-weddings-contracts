pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/ownership/ownable.sol";
import "./TraditionalWedding.sol";


contract WeddingManager is Ownable {

  uint256 public marriageFee = 25e16;
  uint256 public divorceFee = 25e17;
  address[] public weddings;
  // mapping of fiance to wedding address
  mapping(address => address) public weddingOf;
  // used to find wedding array index when pushed
  mapping(address => uint) public weddingIndex;
  // used to know what to show on the dapp
  mapping(address => bool) public verifiedWedding;

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

  event WeddingStarted
  (
    address indexed weddingAddress,
    address indexed brideAddress,
    address indexed groomAddress
  );

  event WeddingRemoved
  (
    address indexed weddingAddress
  );

  // constructor
  function WeddingManager()
    public
  {
    owner = msg.sender;
    // keep placeholder to ensure no other 0 indexed in mapping
    weddings.push(address(0));
  }

  // do not allow random money to come into the contract
  function()
    public
    payable
  {
    revert();
  }

  // only to be called by wedding contracts when selfdestructing
  function removeWedding(address _participant1, address _participant2)
    external
    onlyWedding
    returns (bool)
  {
    weddingOf[_participant1] = address(0);
    weddingOf[_participant2] = address(0);
    weddings[weddingIndex[msg.sender]] = address(0);
    weddingIndex[msg.sender] = 0;
    verifiedWedding[msg.sender] = false;
    WeddingRemoved(msg.sender);
    return true;
  }

  function listWeddings()
    external
    view
    returns (address[])
  {
    return weddings;
  }

  // begin owner functions

  // use as owner or as the verifiedWedding contract itself... in case selfdestruct from weddingContract
  function toggleWeddingVerification(
    address _weddingAddress
  )
    external
    onlyOwner
  {
    verifiedWedding[_weddingAddress] = !verifiedWedding[_weddingAddress];
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
    require(this.balance > 0);
    owner.transfer(this.balance);
  }

  // end owner functions

  // start wedding if fee is paid
  function startWedding(
    address _brideAddress,
    string _brideName,
    string _brideVows,
    address _groomAddress,
    string _groomName,
    string _groomVows
  )
    external
    payable
    feePaid
    returns (address)
  {
    validateWedding(
      _brideAddress,
      _brideName,
      _brideVows,
      _groomAddress,
      _groomName,
      _groomVows
    );
    address _newMarriage = new TraditionalWedding(
      _brideAddress,
      _brideName,
      _brideVows,
      _groomAddress,
      _groomName,
      _groomVows
    );
    addWedding(_newMarriage, _brideAddress, _groomAddress);
    WeddingStarted(_newMarriage, _brideAddress, _groomAddress);
    return _newMarriage;
  }

  function validateWedding(
    address _fianceAddress,
    string _fianceName,
    string _fianceVows,
    address _fiance2Address,
    string _fiance2Name,
    string _fiance2Vows
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
}
