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

    modifier eventMustBeOpen(uint256 _eventId) {
        require(!_isClosed(_eventId), "Event closed");
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
        require(!_nameIdBeingUsed(_name), "Name already being used");
        _;
    }

    function _isClosed(uint256 _eventId) private view returns (bool) {
        return events[_eventId].closed;
    }

    function _nameIdBeingUsed(string memory _name) private view returns (bool) {
        return eventNameToEventId[_name] != 0;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _date
    ) external userHasNoEvent(msg.sender) nameIsValid(_name) {
        _createEvent(_name, _description, _location, _date);
    }

    function closeEvent(uint256 _eventId)
        external
        isEventOwner(_eventId, msg.sender)
        eventMustBeOpen(_eventId)
    {
        _closeEvent(_eventId);
    }

    function getEvent(uint256 _eventId)
        external
        view
        eventMustBeOpen(_eventId)
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint16
        )
    {
        return _getEvent(_eventId);
    }

    function searchEvent(string memory _name)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint16
        )
    {
        return _getEvent(eventNameToEventId[_name]);
    }
}
