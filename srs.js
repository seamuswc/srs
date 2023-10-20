//import { contract } from './abi.js';
const contract = {
    scroll: '0xae0AC53f617C19b84DADBb5FECbdc9238aee25bd', //scroll address l2
    abi: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_category",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_front",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_back",
                    "type": "string"
                }
            ],
            "name": "addCard",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_category",
                    "type": "string"
                },
                {
                    "internalType": "string[]",
                    "name": "_fronts",
                    "type": "string[]"
                },
                {
                    "internalType": "string[]",
                    "name": "_backs",
                    "type": "string[]"
                }
            ],
            "name": "addMultipleCards",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "categories",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "front",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "back",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "categoryNames",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_category",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "getCard",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_category",
                    "type": "string"
                }
            ],
            "name": "getCardCountInCategory",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCategoryNames",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    
    };//send

let contractAddress;
let contractABI;
let srsContract;
let web3;

$(document).ready(function() {

   
    $('#connectWalletButton').on('click', function() {
        connectWallet();
    });

    
    $('#categorySelector').on('change', function() {
        console.log("jquery: ", $(this).val());
        loadCardsForCategory($(this).val());
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
            populateCategories();


        } catch (error) {
            console.error("User denied account access ", error);
        }
    } else {
        console.error("Ethereum browser not detected!");
    }

    
}



// Function to get category names and populate the dropdown
async function populateCategories() {
    const categoryNames = await srsContract.methods.getCategoryNames().call();
    const $categorySelector = $('#categorySelector');
    console.log("populate ", categoryNames);
    categoryNames.forEach(category => {
        //console.log("populate: ", value, " ", text, " ", category);
        const option = $('<option>', {
            value: category,
            text: category
        });

        $categorySelector.append(option);
    });

    // Load cards for the first category by default
    console.log(categoryNames[0]);
    loadCardsForCategory(categoryNames[0]);
    
   
}

async function loadCardsForCategory(category) {
    const $cardsContainer = $('#cardsContainer');
    $cardsContainer.empty(); // Clear previous cards

    const cardCount = await srsContract.methods.getCardCountInCategory(category).call();
    console.log("card count", cardCount);
    for (let i = 0; i < cardCount; i++) {
        const card = await srsContract.methods.getCard(category, i).call();
        console.log(card);
        const cardElement = `
            <div class="column is-one-third">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title is-centered is-size-4">${card[0]}</p>
                    </header>
                    <div class="card-content">
                    <p class="card-header-title is-centered is-size-4">${card[1]}</p>
                    </div>
                </div>
            </div>
        `;
        $cardsContainer.append(cardElement);
    }
}



async function addCard() {
    const category = document.getElementById('category').value;
    const front = document.getElementById('front').value;
    const back = document.getElementById('back').value;

    const accounts = await web3.eth.getAccounts();
    srsContract.methods.addCard(category, front, back).send({ from: accounts[0] });
}

async function massAddCards() {
    const category = document.getElementById('massCategory').value;
    const fronts = document.getElementById('massFronts').value.split(',');
    const backs = document.getElementById('massBacks').value.split(',');

    const accounts = await web3.eth.getAccounts();
    srsContract.methods.addMultipleCards(category, fronts, backs).send({ from: accounts[0] });
}
// Initialize the categories when the page loads




