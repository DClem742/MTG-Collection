import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import styles from '../styles/DeckStats.module.css'

/**
 * DeckStats Component
 * Displays statistical analysis of a deck including:
 * - Mana curve
 * - Color distribution
 * - Average mana value
 * - Land/spell ratio
 * @param {Object} props
 * @param {Array} props.cards - Array of cards in the deck
 */
function DeckStats({ cards }) {
  // Calculate mana curve distribution
  // Creates array of 8 slots (0-7+ mana value)
  const manaCurve = Array(8).fill(0)
  cards.forEach(card => {
    const cmc = card.card_data.cmc || 0
    const index = Math.min(cmc, 7)
    manaCurve[index] += card.quantity || 1
  })
  
  // Format mana curve data for chart display
  const curveData = manaCurve.map((count, cmc) => ({
    cmc: cmc === 7 ? '7+' : cmc.toString(),
    count
  }))

  // Initialize and calculate color distribution
  // Tracks WUBRG (White, Blue, Black, Red, Green) color symbols
  const colors = { W: 0, U: 0, B: 0, R: 0, G: 0 }
  const COLORS = {
    W: '#F8F6D8', // White
    U: '#C1D7E9', // Blue
    B: '#B3ADA3', // Black
    R: '#E49977', // Red
    G: '#A3C095'  // Green
  }

  // Count color symbols in mana costs
  cards.forEach(card => {
    const manaCost = card.card_data.mana_cost || ''
    Object.keys(colors).forEach(color => {
      const regex = new RegExp(`{${color}}`, 'g')
      const matches = manaCost.match(regex)
      if (matches) {
        colors[color] += (matches.length * (card.quantity || 1))
      }
    })
  })

  // Format color data for pie chart
  const colorData = Object.entries(colors)
    .filter(([_, value]) => value > 0)
    .map(([color, value]) => ({
      name: color,
      value
    }))

  // Calculate average mana value (excluding lands)
  const nonLands = cards.filter(card => !card.card_data.type_line.includes('Land'))
  const avgCmc = nonLands.reduce((acc, card) => {
    return acc + (card.card_data.cmc || 0) * (card.quantity || 1)
  }, 0) / nonLands.reduce((acc, card) => acc + (card.quantity || 1), 0)

  // Calculate land/spell ratio
  const lands = cards.filter(card => card.card_data.type_line.includes('Land'))
    .reduce((acc, card) => acc + (card.quantity || 1), 0)
  const spells = cards.filter(card => !card.card_data.type_line.includes('Land'))
    .reduce((acc, card) => acc + (card.quantity || 1), 0)
  const totalCards = lands + spells

  // Render statistical visualizations
  return (
    <div className={styles.deckStats}>
      <div className={styles.statSection}>
        <h3>Mana Curve</h3>
        <BarChart width={400} height={200} data={curveData}>
          <XAxis dataKey="cmc" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>

      <div className={styles.statSection}>
        <h3>Color Distribution</h3>
        <PieChart width={300} height={300}>
          <Pie
            data={colorData}
            cx={150}
            cy={150}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {colorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className={styles.statSection}>
        <h3>Average Mana Value</h3>
        <div className={styles.avgCmc}>
          {avgCmc.toFixed(2)}
        </div>
      </div>

      <div className={styles.statSection}>
        <h3>Land/Spell Ratio</h3>
        <div className={styles.ratio}>
          <div>Lands: {lands} ({((lands/totalCards) * 100).toFixed(1)}%)</div>
          <div>Spells: {spells} ({((spells/totalCards) * 100).toFixed(1)}%)</div>
        </div>
      </div>
    </div>
  )
}

export default DeckStats