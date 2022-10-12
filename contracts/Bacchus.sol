// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

    mapping(uint256 => address) public eventIdToOwner;
    mapping(string => uint256) public eventNameToEventId;

    modifier onlyOwnerOf(uint256 _eventId) {
        require(msg.sender == eventIdToOwner[_eventId]);
        _;
    }

    modifier eventMustBeOpen(uint256 _eventId) {
        require(!_isClosed(_eventId), "Event closed");
        _;
    }

    function _isClosed(uint256 _eventId) private view returns (bool) {
        return events[_eventId].closed;
    }

    function _createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _date
    ) public {
        events.push(Event(_name, _description, _location, _date, 0, false));
        uint256 id = events.length.sub(1);
        eventIdToOwner[id] = msg.sender;
        eventNameToEventId[_name] = id;
        emit NewEvent(id, _name);
    }

    function _getEvent(uint256 _eventId)
        public
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
        return (
            events[_eventId].name,
            events[_eventId].description,
            events[_eventId].location,
            events[_eventId].date,
            events[_eventId].reputation
        );
    }

    function _searchEvent(string memory _name)
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

    function _closeEvent(uint256 _eventId) public onlyOwnerOf(_eventId) {
        Event storage myEvent = events[_eventId];
        myEvent.closed = true;
        emit EventClosed(_eventId, myEvent.name);
    }
}
