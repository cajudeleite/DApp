// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Bacchus {
    using SafeMath for uint256;

    event NewEvent(uint256 eventId, string name, string description);

    struct Event {
        string name;
        string description;
        string location;
        string date;
        uint16 reputation;
        bool closed;
    }

    Event[] public events;

    mapping(uint256 => address) public eventToOwner;

    function _createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _date
    ) public {
        events.push(Event(_name, _description, _location, _date, 0, false));
        uint256 id = events.length.sub(1);
        eventToOwner[id] = msg.sender;
        emit NewEvent(id, _name, _description);
    }

    function _getEvent(uint256 _eventId) public view returns (Event memory) {
        return events[_eventId];
    }
}
