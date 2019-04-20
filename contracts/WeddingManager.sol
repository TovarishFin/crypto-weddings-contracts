pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./WeddingProxy.sol";

import "./interfaces/IWedding.sol";


// TODO: make this upgradeable
contract WeddingManager is Ownable {
  address public weddingMaster;

  address[] public weddings;
  mapping (address => uint256) public weddingIndex;
  mapping (address => bool) public weddingExists;
  mapping (address => address) public weddingOf;

  modifier onlyWedding() {
    require(weddingExists[msg.sender]);

    _;
  }

  event WeddingAdded(
    address indexed wedding,
    address indexed partner1,
    address indexed partner2
  );

  event WeddingRemoved(
    address indexed wedding,
    address indexed partner1,
    address indexed partner2
  );

  event PartnerAccepts(
    address indexed wedding,
    address indexed partner
  );

  event PartnerDivorces(
    address indexed wedding,
    address indexed partner
  );

  event WeddingPhotoUpdated(
    address indexed wedding,
    string uri
  );

  event WeddingCancelled(
    address indexed wedding,
    address indexed cancellor
  );

  event Married(
    address indexed wedding,
    address indexed partner1,
    address indexed partner2
  );

  event Divorced(
    address indexed wedding,
    address indexed partner1,
    address indexed partner2
  );

  event GiftReceived(
    address indexed wedding,
    address indexed gifter,
    uint256 value,
    string message
  );

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

  function addWedding(
    address _wedding,
    address _partner1,
    address _partner2
  )
    internal
  {
    weddingExists[_wedding] = true;
    weddingIndex[_wedding] = weddings.length;
    weddings.push(_wedding);
    weddingOf[_partner1] = _wedding;
    weddingOf[_partner2] = _wedding;

    emit WeddingAdded(
      _wedding,
      _partner1,
      _partner2
    );
  }

  function removeWedding(
    address _wedding,
    address _partner1,
    address _partner2
  )
    internal
  {
    require(weddingExists[_wedding]);
    require(weddings.length > 0);

    uint256 _index = weddingIndex[_wedding];
    weddings[_index] = weddings[weddings.length - 1];
    weddings.length--;
    
    delete weddingIndex[_wedding];
    delete weddingExists[_wedding];
    delete weddingOf[_partner1]; 
    delete weddingOf[_partner2];

    emit WeddingRemoved(
      _wedding,
      _partner1,
      _partner2
    );
  }

  function updateWeddingMaster(
    address _weddingMaster
  )
    external
    onlyOwner
  {
    require(isContract(_weddingMaster));

    weddingMaster = _weddingMaster;
  }
  
  function startWedding(
    address _partner1,
    string calldata _name1,
    address _partner2,
    string calldata _name2,
    IWedding.WeddingType _weddingType
  )
    external
  {
    WeddingProxy _newWedding = new WeddingProxy(weddingMaster);
    address _newWeddingAddress = address(_newWedding);
    addWedding(_newWeddingAddress, _partner1, _partner2);
    IWedding(_newWeddingAddress).initialize(
      _partner1,
      _name1,
      _partner1,
      _name2,
      _weddingType
    );
  }

  function divorce(
    address _partner1,
    address _partner2
  )
    external
    onlyWedding
  {
    removeWedding(msg.sender, _partner1, _partner2);
  }

  function deRegisterWedding(
    address _wedding,
    address _partner1,
    address _partner2
  )
    external
    onlyOwner
  {
    removeWedding(_wedding, _partner1, _partner2);
  }

  function registerWedding(
    address _wedding,
    address _partner1,
    address _partner2
  )
    external
    onlyOwner
  {
    addWedding(_wedding, _partner1, _partner2);
  }

  function emitPartnerAccepts(
    address _partner
  )
    external
    onlyWedding
  {
    emit PartnerAccepts(msg.sender, _partner);
  }

  function emitPartnerDivorces(
    address _partner
  )
    external
    onlyWedding
  {
    emit PartnerDivorces(msg.sender, _partner);
  }

  function emitWeddingPhotoUpdated(
    string calldata _uri
  )
    external
    onlyWedding
  {
    emit WeddingPhotoUpdated(msg.sender, _uri);
  }

  function emitWeddingCancelled(
    address _cancellor
  )
    external
    onlyWedding
  {
    emit WeddingCancelled(msg.sender, _cancellor);
  }

  function emitMarried(
    address _partner1,
    address _partner2
  )
    external
    onlyWedding
  {
    emit Married(msg.sender, _partner1, _partner2);
  }

  function emitDivorced(
    address _partner1,
    address _partner2
  )
    external
    onlyWedding
  {
    emit Divorced(msg.sender, _partner1, _partner2);
  }

  function emitGiftReceived(
    address _gifter,
    uint256 _value,
    string calldata _message
  )
    external
    onlyWedding
  {
    emit GiftReceived(
      msg.sender,
      _gifter,
      _value,
      _message
    );
  }
}
