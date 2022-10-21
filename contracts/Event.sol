// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Bacchus.sol";
import "./Utils.sol";
import "hardhat/console.sol"; //REFACTO

contract Event is Bacchus, Utils {
    modifier isEventOwner(uint256 _eventId, address _user) {
        require(
            _user == eventIdToUser[_eventId],
            "User is not the owner of this event"
        );
        _;
    }

    modifier userHasNoEvent(address _user) {
        require(userToEventId[_user] == 0, "User already has an event");
        _;
    }

    modifier eventExists(uint256 _eventId) {
        require(checkIfEventExists(_eventId), "Event does not exist");
        _;
    }

    modifier eventIsOpen(uint256 _eventId) {
        require(!events[_eventId].closed, "Event is closed");
        _;
    }

    modifier nameIsValid(string memory _name) {
        bool valid;
        string memory message;

        (valid, message) = checkIfStringIsValid(
            _name,
            nameValidRange,
            nameInvalidRange,
            nameMaxLength
        );

        require(valid, message);
        _;
    }

    function checkIfEventExists(uint256 _eventId) private view returns (bool) {
        return _eventId > 0 && _eventId < events.length;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _date
    ) external userHasNoEvent(msg.sender) nameIsValid(_name) {
        require(
            !checkIfEventExists(eventNameToEventId[_name]),
            "Name already being used"
        );
        _createEvent(_name, _description, _location, _date);
    }

    function getEvent(uint256 _eventId)
        external
        view
        eventExists(_eventId)
        eventIsOpen(_eventId)
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint16
        )
    {
        return _getEvent(_eventId);
    }

    function searchEvent(string memory _name)
        external
        view
        nameIsValid(_name)
        eventExists(eventNameToEventId[_name])
        eventIsOpen(eventNameToEventId[_name])
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint16
        )
    {
        return _getEvent(eventNameToEventId[_name]);
    }

    function updateEvent(uint256 _eventId, string memory _name)
        external
        eventExists(_eventId, false)
        eventIsOpen(_eventId)
        isEventOwner(_eventId, msg.sender)
        nameIsValid(_name)
    {}

    function closeEvent(uint256 _eventId)
        external
        eventExists(_eventId)
        eventIsOpen(_eventId)
        isEventOwner(_eventId, msg.sender)
    {
        _closeEvent(_eventId);
    }
}
