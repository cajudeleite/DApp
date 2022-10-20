// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Utils {
    function checkIfStringIsWithinValidRange(
        string memory _string,
        bytes1[2] memory _range
    ) private pure returns (bool) {
        for (uint256 i = 0; i < bytes(_string).length; i++) {
            if (
                bytes(_string)[i] < _range[0] || bytes(_string)[i] > _range[1]
            ) {
                return false;
            }
        }
        return true;
    }

    function checkIfStringContainsInvalidCharRange(
        string memory _string,
        bytes1[2][] memory _range
    ) private pure returns (bool) {
        for (uint256 i = 0; i < bytes(_string).length; i++) {
            for (uint256 j = 0; j < _range.length; j++) {
                if (
                    bytes(_string)[i] >= _range[j][0] &&
                    bytes(_string)[i] <= _range[j][1]
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function stringLength(string memory _string)
        private
        pure
        returns (uint256)
    {
        return bytes(_string).length;
    }

    function checkIfStringIsValid(
        string memory _string,
        bytes1[2] memory _range,
        bytes1[2][] memory _invalidCharRange,
        uint256 _maxLength
    ) public pure returns (bool, string memory) {
        if (!checkIfStringIsWithinValidRange(_string, _range)) {
            return (false, "String is not within range");
        }
        if (checkIfStringContainsInvalidCharRange(_string, _invalidCharRange)) {
            return (false, "String contains invalid character");
        }
        if (stringLength(_string) > _maxLength) {
            return (false, "String exceeds the max length");
        }
        return (true, "String is valid");
    }
}
