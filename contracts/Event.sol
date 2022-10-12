// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Bacchus.sol";

contract Event is Bacchus {
    modifier userHasNoEvent(address _user) {
        require(userToEventId[_user] == 0, "User already has an event");
        _;
    }

    modifier nameIsValid(string memory _name) {
        require(eventNameToEventId[_name] == 0, "Name already being used");
        _;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _date
    ) external userHasNoEvent(msg.sender) nameIsValid(_name) {
        super._createEvent(_name, _description, _location, _date);
    }
}
