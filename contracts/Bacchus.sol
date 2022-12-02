// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";

contract Bacchus is Ownable, Utils {
    using SafeMath for uint256;
    using SafeMath for uint16;

    event NewEvent(address indexed user, uint256 eventId, string name);
    event EventUpdated(address indexed user, uint256 eventId, string field);
    event EventClosed(address indexed user, uint256 eventId, string name);
    event NameValidRangeChanged(bytes1[2] newRange);
    event NameInvalidRangeChanged(bytes1[2][] newRange);
    event NameMaxLengthChanged(uint8 newMaxLength);
    event NameMinLengthChanged(uint8 newMinLength);
    event UsernameMaxLengthChanged(uint8 newMaxLength);
    event UsernameMinLengthChanged(uint8 newMinLength);
    event UsernameSet(address indexed user, string username);

    bytes1[2] nameValidRange = [bytes1(0x2d), bytes1(0x7a)];
    bytes1[2][] nameInvalidRange = [
        [bytes1(0x2e), bytes1(0x2f)],
        [bytes1(0x3a), bytes1(0x60)]
    ];
    uint8 public nameMinLength = 3;
    uint8 public nameMaxLength = 24;
    uint8 public usernameMinLength = 3;
    uint8 public usernameMaxLength = 16;

    struct Event {
        string name;
        string description;
        string location;
        uint256 date;
        bool closed;
    }

    Event[] internal events;
    uint256 public eventCount;

    mapping(uint256 => address) internal eventIdToUser;
    mapping(address => uint256) internal userToEventId;
    mapping(string => uint256) internal eventNameToEventId;
    mapping(address => string) internal userAddressToUsername;
    mapping(string => address) internal usernameToUserAddress;

    constructor() {
        _createEvent(
            "First Ever Event",
            "Hey there, this is an easter egg",
            "Wonderland",
            block.timestamp
        );
        _closeEvent(0);
    }

    modifier usernameIsValid(string memory _username) {
        bool valid;
        string memory message;
        (valid, message) = checkIfStringIsValid(
            _username,
            nameValidRange,
            nameInvalidRange,
            usernameMinLength,
            usernameMaxLength
        );
        require(valid, message);
        _;
    }

    modifier userHasUsername(address _user, bool _has) {
        if (_has) {
            require(
                bytes(userAddressToUsername[msg.sender]).length > 0,
                "User does not have an username"
            );
        } else {
            require(
                bytes(userAddressToUsername[msg.sender]).length == 0,
                "User already has an username"
            );
        }
        _;
    }

    modifier usernameIsNotTaken(string memory _username) {
        require(
            usernameToUserAddress[_username] == address(0),
            "Username is already taken"
        );
        _;
    }

    function _createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _date
    ) internal {
        events.push(Event(_name, _description, _location, _date, false));
        eventCount = eventCount.add(1);
        uint256 id = events.length.sub(1);
        eventIdToUser[id] = msg.sender;
        userToEventId[msg.sender] = id;
        eventNameToEventId[_name] = id;
        emit NewEvent(msg.sender, id, _name);
    }

    function _getEvents()
        internal
        view
        returns (
            uint256[] memory idArray,
            string[] memory nameArray,
            string[] memory locationArray
        )
    {
        idArray = new uint256[](eventCount);
        nameArray = new string[](eventCount);
        locationArray = new string[](eventCount);
        uint256 index;

        for (uint256 i = 0; i < events.length; i = i.add(1)) {
            Event memory iEvent = events[i];
            if (!iEvent.closed) {
                idArray[index] = i;
                nameArray[index] = iEvent.name;
                locationArray[index] = iEvent.location;
                index = index.add(1);
            }
        }
    }

    function _getEvent(uint256 _eventId)
        internal
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        string memory username = userAddressToUsername[eventIdToUser[_eventId]];
        return (
            events[_eventId].name,
            events[_eventId].description,
            events[_eventId].location,
            username,
            events[_eventId].date
        );
    }

    function _updateName(uint256 _eventId, string memory _newValue) internal {
        events[_eventId].name = _newValue;
        emit EventUpdated(msg.sender, _eventId, "Name");
    }

    function _updateDescription(uint256 _eventId, string memory _newValue)
        internal
    {
        events[_eventId].description = _newValue;
        emit EventUpdated(msg.sender, _eventId, "Description");
    }

    function _updateLocation(uint256 _eventId, string memory _newValue)
        internal
    {
        events[_eventId].location = _newValue;
        emit EventUpdated(msg.sender, _eventId, "Location");
    }

    function _updateDate(uint256 _eventId, uint256 _newValue) internal {
        events[_eventId].date = _newValue;
        emit EventUpdated(msg.sender, _eventId, "Date");
    }

    function _closeEvent(uint256 _eventId) internal {
        Event storage myEvent = events[_eventId];
        myEvent.closed = true;
        eventCount = eventCount.sub(1);
        userToEventId[msg.sender] = 0;
        eventNameToEventId[myEvent.name] = 0;
        emit EventClosed(msg.sender, _eventId, myEvent.name);
    }

    function changeNameValidRange(bytes1[2] memory _newRange)
        external
        onlyOwner
    {
        nameValidRange = _newRange;
        emit NameValidRangeChanged(_newRange);
    }

    function changeNameInvalidRange(bytes1[2][] memory _newRange)
        external
        onlyOwner
    {
        nameInvalidRange = _newRange;
        emit NameInvalidRangeChanged(_newRange);
    }

    function changeNameMaxLength(uint8 _newMaxLength) external onlyOwner {
        nameMaxLength = _newMaxLength;
        emit NameMaxLengthChanged(_newMaxLength);
    }

    function changeNameMinLength(uint8 _newMinLength) external onlyOwner {
        nameMinLength = _newMinLength;
        emit NameMinLengthChanged(_newMinLength);
    }

    function changeUsernameMaxLength(uint8 _newMaxLength) external onlyOwner {
        usernameMaxLength = _newMaxLength;
        emit UsernameMaxLengthChanged(_newMaxLength);
    }

    function changeUsernameMinLength(uint8 _newMinLength) external onlyOwner {
        usernameMinLength = _newMinLength;
        emit UsernameMinLengthChanged(_newMinLength);
    }

    function setUsername(string memory _newUsername)
        external
        userHasUsername(msg.sender, false)
        usernameIsNotTaken(_newUsername)
        usernameIsValid(_newUsername)
    {
        userAddressToUsername[msg.sender] = _newUsername;
        usernameToUserAddress[_newUsername] = msg.sender;
        emit UsernameSet(msg.sender, _newUsername);
    }

    function userFirstConnection() external view returns (bool) {
        return bytes(userAddressToUsername[msg.sender]).length == 0;
    }
}
