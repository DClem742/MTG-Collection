document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cardName = document.getElementById('cardName').value;
    const cardList = document.getElementById('cardList').value;

    if (cardName) {
        // Fuzzy single card search
        fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`)
            .then(response => response.json())
            .then(data => displayResults(data.data));
    } else if (cardList) {
        // Enhanced fuzzy bulk search
        const cards = cardList
            .split('\n')
            .filter(name => name.trim());

        Promise.all(
            cards.map(card => 
                fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.trim())}`)
                    .then(response => response.json())
                    .then(data => data.data)
            )
        ).then(results => {
            // Flatten the array of arrays into a single array of cards
            const flatResults = results.flat();
            displayResults(flatResults);
        });
    }
});function displayResults(cards) {    const resultDiv = document.getElementById('result');
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
function addToCollection(card) {
    let collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
    collection.push(card);
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
    alert(`${card.name} has been added to your collection!`);
}