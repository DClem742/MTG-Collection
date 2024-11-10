import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import styles from '../styles/DeckStats.module.css'

function DeckStats({ cards }) {
  // Mana Curve Data
  const manaCurve = Array(8).fill(0)
  cards.forEach(card => {
    const cmc = card.card_data.cmc || 0
    const index = Math.min(cmc, 7)
    manaCurve[index] += card.quantity || 1
  })
  
  const curveData = manaCurve.map((count, cmc) => ({
    cmc: cmc === 7 ? '7+' : cmc.toString(),
    count
  }))

  // Color Distribution
  const colors = { W: 0, U: 0, B: 0, R: 0, G: 0 }
  const COLORS = {
    W: '#F8F6D8',
    U: '#C1D7E9',
    B: '#B3ADA3',
    R: '#E49977',
    G: '#A3C095'
  }

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

  const colorData = Object.entries(colors)
    .filter(([_, value]) => value > 0)
    .map(([color, value]) => ({
      name: color,
      value
    }))

  // Average CMC
  const nonLands = cards.filter(card => !card.card_data.type_line.includes('Land'))
  const avgCmc = nonLands.reduce((acc, card) => {
    return acc + (card.card_data.cmc || 0) * (card.quantity || 1)
  }, 0) / nonLands.reduce((acc, card) => acc + (card.quantity || 1), 0)

  // Land/Spell Ratio
  const lands = cards.filter(card => card.card_data.type_line.includes('Land'))
    .reduce((acc, card) => acc + (card.quantity || 1), 0)
  const spells = cards.filter(card => !card.card_data.type_line.includes('Land'))
    .reduce((acc, card) => acc + (card.quantity || 1), 0)
  const totalCards = lands + spells

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
