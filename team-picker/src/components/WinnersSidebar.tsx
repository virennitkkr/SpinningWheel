import React from 'react'

type Winner = {
  name: string
  points: number
  count: number
}

type Props = {
  winners: Winner[]
}

export default function WinnersSidebar({ winners }: Props) {
  const sortedWinners = [...winners].sort((a, b) => b.points - a.points)

  return (
    <div
      style={{
        width: 220,
        backgroundColor: '#f8f9fa',
        borderRight: '2px solid #e9ecef',
        padding: 20,
        overflowY: 'auto',
        maxHeight: '100vh',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#2c3e50' }}>
        🏆 Score Central
      </div>

      {sortedWinners.length === 0 ? (
        <div style={{ color: '#999', fontSize: 14 }}>No winners yet</div>
      ) : (
        <div>
          {sortedWinners.map((winner, idx) => (
            <div
              key={winner.name}
              style={{
                padding: 12,
                marginBottom: 8,
                backgroundColor: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${['#ffc107', '#c0c0c0', '#cd7f32'][idx] || '#3498db'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50' }}>
                  {idx === 0 && '🥇 '}{idx === 1 && '🥈 '}{idx === 2 && '🥉 '}
                  {winner.name}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {winner.count} {winner.count === 1 ? 'win' : 'wins'} • <strong>{winner.points} pts</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
