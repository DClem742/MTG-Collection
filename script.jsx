// Add event listener to the search form that triggers when the form is submitted
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cardName = document.getElementById('cardName').value;
    const cardList = document.getElementById('cardList').value;

    if (cardName) {
        // Fuzzy single card search - returns multiple related cards
        fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`)
            .then(response => response.json())
            .then(data => {
                displayResults(data.data);
                toggleAddAllButton(false);
            });
    } else if (cardList) {
        // Exact bulk card search - returns precise matches
        const cards = cardList
            .split('\n')
            .filter(name => name.trim());

        Promise.all(
            cards.map(card => 
                fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.trim())}`)
                    .then(response => response.json())
            )
        ).then(results => {
            displayResults(results);
            toggleAddAllButton(true);
            // Store the results globally for the add all functionality
            window.currentSearchResults = results;
        });
    }
});

// Function to toggle the visibility of Add All button
function toggleAddAllButton(show) {
    const addAllButton = document.getElementById('addAllToCollection');
    addAllButton.style.display = show ? 'block' : 'none';
}

// Add event listener for the Add All to Collection button
document.getElementById('addAllToCollection').addEventListener('click', function() {
    if (window.currentSearchResults) {
        window.currentSearchResults.forEach(card => addToCollection(card));
        alert('All cards have been added to your collection!');
    }
});

// Function to display card results in the DOM
function displayResults(cards) {    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <h2>${card.name}</h2>
            <img src="${card.image_uris ? card.image_uris.normal : 'placeholder-image-url'}" alt="${card.name}">
            <p>${card.oracle_text}</p>
            <button class="addToCollection">Add to Collection</button>
        `;
        cardElement.querySelector('.addToCollection').onclick = () => addToCollection(card);
        resultDiv.appendChild(cardElement);
    });
}

// Function to add a card to the user's collection
function addToCollection(card) {
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    
    // Set default values for new cards
    card.quantity = 1;
    card.condition = 'M/NM';
    card.for_trade = false;
    card.foil = false;
    
    collection.push(card);
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    alert(`${card.name} has been added to your collection!`);
}
