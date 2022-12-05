// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Bacchus.sol";

contract Event is Bacchus {
    modifier userHasEvent(address _user, bool _has) {
        if (_has) {
            require(userToEventId[_user] > 0, "User does not have an event");
        } else {
            require(userToEventId[_user] == 0, "User already has an event");
        }
        _;
    }

    modifier eventExists(uint256 _eventId, bool _exists) {
        if (_exists) {
            require(
                checkIfEventExists(_eventId),
                "Event is either closed or does not exist"
            );
        } else {
            require(!checkIfEventExists(_eventId), "Event already exists");
        }
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
            nameMinLength,
            nameMaxLength
        );
        require(valid, message);
        _;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _date
    )
        external
        userHasUsername(msg.sender, true)
        eventExists(eventNameToEventId[_name], false)
        userHasEvent(msg.sender, false)
        nameIsValid(_name)
    {
        _createEvent(_name, _description, _location, _date);
    }

    function getEvents()
        external
        view
        userHasUsername(msg.sender, true)
        returns (
            uint256[] memory,
            string[] memory,
            string[] memory
        )
    {
        return _getEvents();
    }

    function getEvent(uint256 _eventId)
        external
        view
        userHasUsername(msg.sender, true)
        eventExists(_eventId, true)
        eventIsOpen(_eventId)
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return _getEvent(_eventId);
    }

    function searchEvent(string memory _name)
        external
        view
        userHasUsername(msg.sender, true)
        nameIsValid(_name)
        eventExists(eventNameToEventId[_name], true)
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return _getEvent(eventNameToEventId[_name]);
    }

    function updateEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _date
    ) external userHasEvent(msg.sender, true) nameIsValid(_name) {
        uint256 eventId = userToEventId[msg.sender];
        if (
            keccak256(abi.encodePacked(events[eventId].name)) !=
            keccak256(abi.encodePacked(_name))
        ) {
            require(
                !checkIfEventExists(eventNameToEventId[_name]),
                "Event already exists"
            );
            _updateName(eventId, _name);
        }
        if (
            keccak256(abi.encodePacked(events[eventId].description)) !=
            keccak256(abi.encodePacked(_description))
        ) {
            _updateDescription(eventId, _description);
        }
        if (
            keccak256(abi.encodePacked(events[eventId].location)) !=
            keccak256(abi.encodePacked(_location))
        ) {
            _updateLocation(eventId, _location);
        }
        if (events[eventId].date != _date) {
            _updateDate(eventId, _date);
        }
    }

    function closeEvent()
        external
        eventExists(userToEventId[msg.sender], true)
    {
        _closeEvent(userToEventId[msg.sender]);
    }

    function checkIfEventExists(uint256 _eventId) private view returns (bool) {
        return _eventId > 0 && _eventId < events.length;
    }

    function getUserEvent() external view returns (uint256) {
        return userToEventId[msg.sender];
    }
}
