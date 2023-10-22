import { contract } from './abi.js';

console.log(contract);

let contractAddress;
let contractABI;
let srsContract;
let web3;

$(document).ready(function() {

   
    $('#connectWalletButton').on('click', function() {
        connectWallet();
    });

    
   
    
    $('#addCard').on('click', function() {
        addCard();
    });

    $('#massAddCards').on('click', function() {
        massAddCards();
    });



});



async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            let userAddress = accounts[0];
            $("#walletAddress").text(userAddress);

            // Fetching the network name
            const netId = await web3.eth.net.getId();
            let networkName;
            let network;
            switch(netId) {
                /*case 1: 
                    networkName = 'Ethereum'; 
                    network = 'ethereum';
                    break;*/
                case 42161: 
                    networkName = 'Arbitrum'; 
                    network = 'arbitrum';
                    break;
                case 10: 
                    networkName = 'Optimism'; 
                    network = 'optimism';
                    break;
                case 534352:
                    networkName = 'Scroll';
                    network = 'scroll';
                    break;
                default: 
                    networkName = 'Unknown'; 
                    break;
            }

            contractAddress = contract[network]; // Replace with your deployed contract address
            contractABI = contract['abi']; // Replace with your contract's ABI
            srsContract = new web3.eth.Contract(contractABI, contractAddress);
            $('#networkConnected').text(networkName);
            //populateCategories();


        } catch (error) {
            console.error("User denied account access ", error);
        }
    } else {
        console.error("Ethereum browser not detected!");
    }

    
}





async function addCard() {
    const category = document.getElementById('category').value;
    const front = document.getElementById('front').value;
    const back = document.getElementById('back').value;

    const accounts = await web3.eth.getAccounts();
    srsContract.methods.addCard(category, front, back).send({ from: accounts[0] })
        .on('transactionHash', function(hash) {
            console.log("chatwall tx sent, not confirmed");
        })
        .on('receipt', function(receipt) {
            // This callback will be triggered once the transaction is mined
            console.log("chatwall tx confirmed");
        })
        .on('error', function(error) {
            // This callback will be triggered in case of a transaction failure
            console.error('Deployment failed', error);
        });
}

async function massAddCards() {
    const category = document.getElementById('massCategory').value;
    const fronts = document.getElementById('massFronts').value.split(',');
    const backs = document.getElementById('massBacks').value.split(',');

    const accounts = await web3.eth.getAccounts();
    srsContract.methods.addMultipleCards(category, fronts, backs).send({ from: accounts[0] })
        .on('transactionHash', function(hash) {
            console.log("chatwall tx sent, not confirmed");
        })
        .on('receipt', function(receipt) {
            // This callback will be triggered once the transaction is mined
            console.log("chatwall tx confirmed");
        })
        .on('error', function(error) {
            // This callback will be triggered in case of a transaction failure
            console.error('Deployment failed', error);
        });
}
// Initialize the categories when the page loads




