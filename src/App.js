import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import UserManagementABI from "./UserManagementABI.json";
import "./App.css"; // Ensure you have a CSS file for styling

const contractAddress = "0xA602C5b8B8243b102B740378f452983afD3218Fd";

const UserManagement = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [users, setUsers] = useState([]);
    const [account, setAccount] = useState(null);
    const [form, setForm] = useState({
        address: "",
        name: "",
        email: "",
        id: "",
        phone: "",
        department: "",
        homeAddress: "",
    });

    useEffect(() => {
        if (contract) {
            fetchUsers();
        }
    }, [contract]);

    const connectWallet = async () => {
    try {
            if (window.ethereum) {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                    // Request wallet connection
                await window.ethereum.request({ method: "eth_requestAccounts" });
        
                    // Get current network
                const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        
                    // Polygon zkEVM Cardona Testnet Chain ID
                const cardonaChainId = "0x98a"; // 378 in decimal
        
                if (currentChainId !== cardonaChainId) {
                        // Add Polygon zkEVM Cardona Testnet if not present
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: cardonaChainId,
                                chainName: "Polygon zkEVM Cardona Testnet",
                                nativeCurrency: {
                                    name: "ETH",
                                    symbol: "ETH",
                                    decimals: 18,
                                },
                                rpcUrls: ["https://rpc.cardona.zkevm-rpc.com"],
                                blockExplorerUrls: ["https://cardona-zkevm.polygonscan.com"],
                            }],
                        });
                }
        
                const contract = new Contract(contractAddress, UserManagementABI, signer);
                setProvider(provider);
                setSigner(signer);
                setContract(contract);
                fetchUsers();
                setAccount(await signer.getAddress());
        
            } else {
                alert("MetaMask is not installed. Please install it to use this feature.");
            }
        }catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };  

    const fetchUsers = async () => {
        try {
            let usersList = await contract.getAllUsers();
            if(usersList) setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addUser = async () => {
        try {

            const userExist  = await contract.getUser(form.address);
            console.log("********* userExist",userExist[0])
            if(userExist[0]){
              alert("User wallet already exist")
              return;
            }
            const tx = await contract.addUser(form.address, form.name, form.email, form.id, form.phone, form.homeAddress, form.department, {
              gasLimit: 500000,  // Adjust based on the network
            });
            await tx.wait();
            setForm({
                address: "",
                name: "",
                email: "",
                id: "",
                phone: "",
                department: "",
                homeAddress: "",
            })
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const updateUser = async () => {
        try {
            const tx = await contract.updateUser(form.address, form.name, form.email, form.id, form.phone, form.homeAddress, form.department, {
              gasLimit: 500000,  // Adjust based on the network
          });
            await tx.wait();
            setForm({
                address: "",
                name: "",
                email: "",
                id: "",
                phone: "",
                department: "",
                homeAddress: "",
            })
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const deleteUser = async (userAddress) => {
        try {
            const tx = await contract.deleteUser(userAddress, {
              gasLimit: 500000,  // Adjust based on the network
          });
            await tx.wait();
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="container">
        <div className="header">
            <img src="/logo.jpeg" alt="User Management Logo" className="logo" />
            <button onClick={connectWallet} className="btn connect-btn">{account ? "Wallet Connected" : "Connect Wallet"}</button>
        </div>
        
        {account && <p className="connected-account title">Connected: {account}</p>}
        
        <h2 className="title">User Management System</h2>
        
        <div className="form-container">
            <div className="input-grid">
                <input type="text" name="address" placeholder="Wallet Address" onChange={handleChange} value={form.address}/>
                <input type="text" name="name" placeholder="Employee Name" onChange={handleChange} value={form.name} />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} value={form.email} />
                <input type="text" name="id" placeholder="Employee Id" onChange={handleChange} value={form.id} />
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} value={form.phone} />
                <input type="text" name="homeAddress" placeholder="Home Address" onChange={handleChange} value={form.homeAddress} />
                <input type="text" name="department" placeholder="Department" onChange={handleChange} value={form.department} />
            </div>
            <div className="button-group">
                <button onClick={addUser} className="btn add-btn">Add User</button>
                <button onClick={updateUser} className="btn update-btn">Update User</button>
            </div>
        </div>
        <div className="table-container">
        <table className="user-table">
                <thead>
                    <tr>
                        <th>Wallet Address</th>
                        <th>Employee Name</th>
                        <th>Employee Id</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Home Address</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user?.userAddress.slice(0,5)+"..."+user?.userAddress.slice(35,user?.userAddress.length)}</td>
                            <td>{user.name}</td>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.homeAddress}</td>
                            <td>{user.department}</td>
                            <td>
                                <button onClick={() =>  setForm({
                                    address: user.userAddress,
                                    name: user.name,
                                    email: user.email,
                                    id: user.id,
                                    phone: user.phone,
                                    homeAddress: user.homeAddress,
                                    department: user.department,
                                  })} 
                                  className="edit-btn">Edit</button>
                                <button onClick={() => deleteUser(user.userAddress)} className="delete-btn">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
        </div>
    </div>
    );
};

export default UserManagement;