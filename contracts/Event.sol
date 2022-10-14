// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Bacchus.sol";

contract Event is Bacchus {
    modifier isEventOwner(uint256 _eventId) {
        require(msg.sender == eventIdToUser[_eventId]);
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
        isEventOwner(_eventId)
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
