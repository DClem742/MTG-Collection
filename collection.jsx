let sortAscending = true;

document.addEventListener('DOMContentLoaded', function() {
    displayCollection();

    const sortBySelect = document.getElementById('sortBy');
    const sortOrderButton = document.getElementById('sortOrder');

    console.log('Sort elements found:', {sortBySelect, sortOrderButton});

    sortBySelect.addEventListener('change', () => {
        console.log('Sort type changed to:', sortBySelect.value);
        let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
        console.log('Collection before sort:', collection);
        collection = sortCollection(collection);
        console.log('Collection after sort:', collection);
        localStorage.setItem('mtgCollection', JSON.stringify(collection));
        displayCollection();
    });

    sortOrderButton.addEventListener('click', () => {
        console.log('Sort direction clicked');
        sortAscending = !sortAscending;
        sortOrderButton.textContent = sortAscending ? '↑' : '↓';
        let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
        collection = sortCollection(collection);
        localStorage.setItem('mtgCollection', JSON.stringify(collection));
        displayCollection();
    });
});

function sortCollection(collection) {
    const sortBy = document.getElementById('sortBy').value;
    
    return collection.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return sortAscending ? 
                    a.name.localeCompare(b.name) : 
                    b.name.localeCompare(a.name);
            case 'cmc':
                return sortAscending ? 
                    (a.cmc || 0) - (b.cmc || 0) : 
                    (b.cmc || 0) - (a.cmc || 0);
            case 'color':
                const colorA = a.colors ? a.colors.join('') : '';
                const colorB = b.colors ? b.colors.join('') : '';
                return sortAscending ? 
                    colorA.localeCompare(colorB) : 
                    colorB.localeCompare(colorA);
            case 'rarity':
                return sortAscending ? 
                    a.rarity.localeCompare(b.rarity) : 
                    b.rarity.localeCompare(a.rarity);
            case 'type':
                return sortAscending ? 
                    a.type_line.localeCompare(b.type_line) : 
                    b.type_line.localeCompare(a.type_line);
            case 'set':
                return sortAscending ? 
                    a.set.localeCompare(b.set) : 
                    b.set.localeCompare(a.set);
            default:
                return 0;
        }
    });
}
function displayCollection() {
    const collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    const collectionDiv = document.getElementById('collection');
    
    // Clear existing content
    collectionDiv.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Card Name</th>
                <th>Quantity</th>
                <th>Condition</th>
                <th>Set</th>
                <th>Foil</th>
                <th>For Trade</th>
                <th>Actions</th>
                <th>Remove</th>
                <th><button onclick="addAllSearchResults()">Add All to Collection</button></th>
            </tr>
        </thead>
        <tbody id="collectionBody">
        </tbody>
    `;
    // Rest of your existing displayCollection code...
    collectionDiv.appendChild(table);

    const tableBody = document.getElementById('collectionBody');
    collection.forEach((card, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${card.scryfall_uri}" target="_blank">${card.name}</a></td>
            <td>${card.quantity} 
                <div class="select-wrapper">
                    <select id="quantity-${index}">
                        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => 
                            `<option value="${num}" ${card.quantity == num ? 'selected' : ''}>${num}</option>`
                        ).join('')}
                    </select>
                </div>
            </td>
            <td>${card.condition}
                <div class="select-wrapper">
                    <select id="condition-${index}">
                        <option value="M/NM" ${card.condition === 'M/NM' ? 'selected' : ''}>Mint/Near Mint (M/NM)</option>
                        <option value="SP" ${card.condition === 'SP' ? 'selected' : ''}>Slightly Played (SP)</option>
                        <option value="PL" ${card.condition === 'PL' ? 'selected' : ''}>Played (PL)</option>
                        <option value="HP" ${card.condition === 'HP' ? 'selected' : ''}>Heavily Played (HP)</option>
                        <option value="Poor" ${card.condition === 'Poor' ? 'selected' : ''}>Poor</option>
                    </select>
                </div>
            </td>
            <td>${card.set}
                <div class="select-wrapper">
                    <select id="set-${index}">
                        ${card.all_sets ? card.all_sets.map(set => `<option value="${set}" ${card.set === set ? 'selected' : ''}>${set}</option>`).join('') : `<option value="${card.set}">${card.set}</option>`}
                    </select>
                </div>
            </td>
            <td>${card.foil ? 'Yes' : 'No'}
                <div class="select-wrapper">
                    <select id="foil-${index}">
                        <option value="true" ${card.foil ? 'selected' : ''}>Yes</option>
                        <option value="false" ${!card.foil ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </td>
            <td>${card.for_trade ? 'Yes' : 'No'}
                <div class="select-wrapper">
                    <select id="for_trade-${index}">
                        <option value="true" ${card.for_trade ? 'selected' : ''}>Yes</option>
                        <option value="false" ${!card.for_trade ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </td>
            <td><button onclick="updateCard(${index})">Update</button></td>
            <td><button onclick="removeCard(${index})">Remove</button></td>
        `;        tableBody.appendChild(row);
    });
}function updateCardQuantity(index, newQuantity) {
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    if (newQuantity == '0') {
        collection.splice(index, 1);
    } else {
        collection[index].quantity = parseInt(newQuantity);
    }
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    displayCollection(); // Refresh the table
}

function removeCard(index) {
    console.log('Removing card at index:', index);
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    console.log('Collection before removal:', collection);
    collection.splice(index, 1);
    console.log('Collection after removal:', collection);
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    displayCollection(); // Refresh the table
}
function updateCard(index) {
    const collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    const card = collection[index];

    card.quantity = parseInt(document.getElementById(`quantity-${index}`).value);
    card.condition = document.getElementById(`condition-${index}`).value;
    card.set = document.getElementById(`set-${index}`).value;
    card.foil = document.getElementById(`foil-${index}`).value === 'true';
    card.for_trade = document.getElementById(`for_trade-${index}`).value === 'true';

    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    displayCollection(); // Refresh the table
    alert('Card updated successfully!');
}function deleteCard(index) {
    const collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    collection.splice(index, 1);
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    displayCollection(); // Refresh the table
};

function addAllSearchResults() {
    const searchResults = document.querySelectorAll('.search-result');
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    
    searchResults.forEach(result => {
        const cardData = JSON.parse(result.dataset.cardInfo);
        collection.push({
            name: cardData.name,
            quantity: 1,
            condition: 'M/NM',
            set: cardData.set,
            foil: false,
            for_trade: false,
            scryfall_uri: cardData.scryfall_uri,
            colors: cardData.colors,
            cmc: cardData.cmc || 0,
            type_line: cardData.type_line,
            rarity: cardData.rarity,
            all_sets: [cardData.set]
        });
    });

    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    displayCollection();
}document.addEventListener('DOMContentLoaded', function() {
    displayCollection();

    document.getElementById('bulkAddButton').addEventListener('click', () => {
        const searchResults = document.querySelectorAll('.card-result');
        let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
        
        searchResults.forEach(cardElement => {
            const cardData = JSON.parse(cardElement.dataset.cardInfo);
            const newCard = {
                name: cardData.name,
                quantity: 1,
                condition: 'M/NM',
                set: cardData.set,
                foil: false,
                for_trade: false,
                scryfall_uri: cardData.scryfall_uri,
                colors: cardData.colors,
                cmc: cardData.cmc,
                type_line: cardData.type_line,
                rarity: cardData.rarity,
                all_sets: cardData.all_sets
            };
            collection.push(newCard);
        });
        
        localStorage.setItem('mtgCollection', JSON.stringify(collection));
        displayCollection();
        alert('All search results added to collection!');
    });

    document.getElementById('importCards').addEventListener('click', () => {
        importCardList();
    });
});async function importCardList() {
    const cardList = document.getElementById('cardListInput').value
        .split('\n')
        .filter(line => line.trim() !== '');

    if (cardList.length === 0) {
        alert('Please enter some card names first!');
        return;
    }

    // Show loading state
    document.getElementById('importCards').disabled = true;
    document.getElementById('importCards').textContent = 'Importing...';

    let addedCards = 0;
    const failedCards = [];

    for (const cardName of cardList) {
        try {
            // Make the API call
            const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName.trim())}`);
            const cardData = await response.json();

            if (cardData.object === 'error') {
                // Try fuzzy search if exact match fails
                const fuzzyResponse = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName.trim())}`);
                const fuzzyData = await fuzzyResponse.json();
                if (fuzzyData.object === 'error') {
                    failedCards.push(cardName);
                    continue;
                }
                cardData = fuzzyData;
            }

            // Get current collection
            const collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];

            // Add new card
            collection.push({
                name: cardData.name,
                quantity: 1,
                condition: 'M/NM',
                set: cardData.set,
                foil: false,
                for_trade: false,
                scryfall_uri: cardData.scryfall_uri,
                colors: cardData.colors,
                cmc: cardData.cmc || 0,
                type_line: cardData.type_line,
                rarity: cardData.rarity,
                all_sets: [cardData.set]
            });

            // Save updated collection
            localStorage.setItem('mtgCollection', JSON.stringify(collection));
            addedCards++;
            console.log(`Added: ${cardData.name}`);

            // Wait 100ms between requests to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            failedCards.push(cardName);
            console.log(`Failed to add: ${cardName}`, error);
        }
    }

    // Reset button state
    document.getElementById('importCards').disabled = false;
    document.getElementById('importCards').textContent = 'Import Cards';

    // Show results
    displayCollection();
    alert(`Added ${addedCards} cards to your collection!\n${failedCards.length > 0 ? `Failed to add: ${failedCards.join(', ')}` : ''}`);
}

function displaySearchResults(cards) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results
    
    // Create search state container
    const searchStateContainer = document.createElement('div');
    searchStateContainer.className = 'search-state';
    
    // Add the bulk add button
    const bulkAddButton = document.createElement('button');
    bulkAddButton.id = 'addAllToCollection';
    bulkAddButton.textContent = 'Add All Cards to Collection';
    bulkAddButton.addEventListener('click', () => addAllCardsToCollection(cards));
    
    // Add new search button
    const newSearchButton = document.createElement('button');
    newSearchButton.textContent = 'New Search';
    newSearchButton.addEventListener('click', resetSearchState);
    
    // Add buttons and results to container
    searchStateContainer.appendChild(bulkAddButton);
    searchStateContainer.appendChild(newSearchButton);
    
    // Display cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cards.forEach(card => {
        // Your existing card display code
    });
    
    searchStateContainer.appendChild(cardsContainer);
    resultDiv.appendChild(searchStateContainer);
    
    // Hide search form during results view
    document.getElementById('searchForm').style.display = 'none';
}

function resetSearchState() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('searchForm').style.display = 'block';
}

function addAllCardsToCollection(cards) {
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    cards.forEach(card => {
        collection.push({
            name: card.name,
            quantity: 1,
            condition: 'M/NM',
            set: card.set,
            foil: false,
            for_trade: false,
            scryfall_uri: card.scryfall_uri,
            colors: card.colors,
            cmc: card.cmc || 0,
            type_line: card.type_line,
            rarity: card.rarity,
            all_sets: [card.set]
        });
    });
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    alert(`Added ${cards.length} cards to your collection!`);
}
