// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManidment {
    struct User {
        string name;
        string email;
        string id;
        string phone;
        string homeAddress;
        string department;
        address userAddress;
        bool exists;
    }

    address public admin;
    mapping(address => User) public users;
    address[] public userAddresses;

    event UserAdded(address indexed user, string name, string email,  string id,string phone,string homeAddress, string department);
    event UserUpdated(address indexed user, string name, string email,  string id,string phone,string homeAddress,string department);
    event UserDeleted(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // update admin details
    function updateAdmin(address _admin) public onlyAdmin {
        admin = _admin;
    }

    // Add user details
    function addUser(address _user, string memory _name, string memory _email,  string memory _id,string memory _phone,string memory _homeAddress, string memory _department) public onlyAdmin {
        require(!users[_user].exists, "User already exists");
        users[_user] = User(_name, _email, _id, _phone, _homeAddress,_department,_user, true);
        userAddresses.push(_user);
        emit UserAdded(_user, _name, _email, _id, _phone, _homeAddress,_department);
    }

    // View user details
    function getUser(address _user) public view returns (string memory, string memory,  string memory) {
        User memory user = users[_user];
        return (user.name, user.email, user.id);
    }

    // Update user details
    function updateUser(address _user, string memory _name, string memory _email,  string memory _id, string memory _phone,string memory _homeAddress, string memory _department) public onlyAdmin {
        require(users[_user].exists, "User does not exist");
        users[_user] = User(_name, _email, _id, _phone, _homeAddress,_department,_user, true);
        emit UserUpdated(_user, _name, _email, _id, _phone,_department, _homeAddress);
    }

    // Delete user details
    function deleteUser(address _user) public onlyAdmin {
        require(users[_user].exists, "User does not exist");

        // Find the index of the user in the array
        uint256 indexToDelete;
        bool found = false;

        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == _user) {
                indexToDelete = i;
                found = true;
                break;
            }
        }

        require(found, "User address not found in array");

        // Swap the last element with the one to delete and then pop
        userAddresses[indexToDelete] = userAddresses[userAddresses.length - 1];
        userAddresses.pop();

        // Delete user from mapping
        delete users[_user];

        emit UserDeleted(_user);
    }

    // Get all users with details
    function getAllUsers() public view returns (User[] memory) {
        
        // Create a properly sized array
        User[] memory allUsers = new User[](userAddresses.length);
        uint256 index = 0;

        for (uint i = 0; i < userAddresses.length; i++) {
            if (users[userAddresses[i]].userAddress != address(0)) {
                allUsers[index] = users[userAddresses[i]];
                index++;
            }
        }

        return allUsers;
    }

}