const BASE_URL = 'https://api.scryfall.com'

export async function searchCards(query) {
  try {
    const response = await fetch(`${BASE_URL}/cards/search?q=${query}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error searching cards:', error)
    return []
  }
}
