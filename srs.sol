

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SRS {

    struct Card {
        string front;
        string back;
    }

    address public owner;

    // Mapping from category to cards. mappings like this don't need a preset size
    mapping(string => Card[]) public categories;

    // Array to store unique category names
    string[] public categoryNames;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCategory(string memory _category) private {
        // If category doesn't exist yet, add it to categoryNames
        if (categories[_category].length == 0) {
            categoryNames.push(_category);
        }
    }

    function addCard(string memory _category, string memory _front, string memory _back) public onlyOwner {
        Card memory newCard = Card({
            front: _front,
            back: _back
        });

        addCategory(_category);

        categories[_category].push(newCard);
        
    }

    function getCard(string memory _category, uint256 index) public view returns (string memory, string memory) {
        require(index < categories[_category].length, "Index out of bounds");

        return (categories[_category][index].front, categories[_category][index].back);
    }

    function getCardCountInCategory(string memory _category) public view returns (uint256) {
        return categories[_category].length;
    }

    // New function to retrieve all category names
    function getCategoryNames() public view returns (string[] memory) {
        return categoryNames;
    }

    function addMultipleCards(string memory _category, string[] memory _fronts, string[] memory _backs) public onlyOwner {
        require(_fronts.length == _backs.length, "Mismatched front and back arrays");
        for (uint i = 0; i < _fronts.length; i++) {
            Card memory newCard = Card({
                front: _fronts[i],
                back: _backs[i]
            });
            
            addCategory(_category);

            categories[_category].push(newCard);
        }
    }
}
