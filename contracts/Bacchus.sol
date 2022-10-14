// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol"; //REFACTO

contract Bacchus is Ownable {
    using SafeMath for uint256;

    event NewEvent(uint256 eventId, string name);
    event EventClosed(uint256 eventId, string name);

    struct Event {
        string name;
        string description;
        string location;
        string date;
        uint16 reputation;
        bool closed;
    }

    Event[] internal events;

    mapping(uint256 => address) public eventIdToUser;
    mapping(address => uint256) internal userToEventId;
    mapping(string => uint256) internal eventNameToEventId;

    constructor() {
        _createEvent(
            "First Ever Event",
            "Hey there, this is an easter egg",
            "Everywhere",
            "Anytime"
        );
        _closeEvent(0);
    }

    function _createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _date
    ) internal {
        events.push(Event(_name, _description, _location, _date, 0, false));
        uint256 id = events.length.sub(1);
        eventIdToUser[id] = msg.sender;
        eventNameToEventId[_name] = id;
        emit NewEvent(id, _name);
    }

    function _getEvent(uint256 _eventId)
        internal
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint16
        )
    {
        return (
            events[_eventId].name,
            events[_eventId].description,
            events[_eventId].location,
            events[_eventId].date,
            events[_eventId].reputation
        );
    }

    function _closeEvent(uint256 _eventId) internal {
        Event storage myEvent = events[_eventId];
        myEvent.closed = true;
        emit EventClosed(_eventId, myEvent.name);
    }
}
