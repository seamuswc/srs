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

    
    $('#categorySelector').on('change', function() {
        console.log("jquery: ", $(this).val());
        loadCardsForCategory($(this).val());
    });

    $(document).on('click', '#flipButton', function() {
        $("#cardFront, #cardBack").toggle();
    });
    
    $(document).on('click', '#nextButton', async function() {
        const category = $('#categorySelector').val();
        await loadCardsForCategory(category);
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

async function increaseCardCount(category) {
    let count = await srsContract.methods.getCardCountInCategory(category).call();
    if(currentCardIndex < (count - 1)) {
        currentCardIndex++;
    } else {
        currentCardIndex = 0;
    }

}

let currentCardIndex = 0;

async function loadCardsForCategory(category) {
    const $cardsContainer = $('#cardsContainer');
    $cardsContainer.empty(); // Clear previous card

    const card = await srsContract.methods.getCard(category, currentCardIndex).call();
    console.log(card);
    const cardElement = `
        <div class="column is-one-third">
            <div class="card" id="srsCard">
            
                <div class="card-content">
                    <p class="card-header-title is-centered is-size-4" id="cardFront">${card[0]}</p>
                </div>
                <div class="card-content">
                    <p class="card-header-title is-centered is-size-4" id="cardBack">${card[1]}</p>
                </div>

            </div>
        </div>
    `;
    $cardsContainer.append(cardElement);
    increaseCardCount(category);
    $("#cardBack").hide();
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




