
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Confetti from 'react-confetti'

type Props = {
  names: string[]
  startSignal?: number
  onWinner?: (name: string) => void
  onSelected?: (name: string | null, color?: string) => void
}

function generateColors(n: number) {
  // Modern Adobe Express inspired vibrant colors
  const modernPalette = [
    '#FF6B6B',  // Vibrant Red
    '#FF8C42',  // Warm Orange
    '#FFD93D',  // Bright Yellow
    '#6BCB77',  // Fresh Green
    '#4D96FF',  // Vivid Blue
    '#9D84B7',  // Modern Purple
    '#FF6B9D',  // Hot Pink
    '#00D9FF',  // Cyan
    '#FF4757',  // Deep Red
    '#FFA502',  // Bold Orange
    '#00BCD4',  // Teal
    '#FF006E',  // Magenta
  ]
  
  const colors: string[] = []
  for (let i = 0; i < n; i++) {
    colors.push(modernPalette[i % modernPalette.length])
  }
  return colors
}

export default function Wheel({ names = [], startSignal, onWinner, onSelected }: Props) {
  const namesSafe = useMemo(() => (names && names.length ? names : ['No names']), [names])
  const [selected, setSelected] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastStartSignalRef = useRef<number>(0)
  const onWinnerRef = useRef(onWinner)
  const timersRef = useRef<number[]>([])

  const colors = useMemo(() => generateColors(namesSafe.length), [namesSafe])

  // Keep onWinner ref in sync
  useEffect(() => {
    onWinnerRef.current = onWinner
  }, [onWinner])

  useEffect(() => {
    // Only spin if startSignal is greater than the last one we processed
    if (startSignal == null || startSignal <= lastStartSignalRef.current) return
    if (namesSafe.length === 0) return

    // Update the ref to track this signal
    lastStartSignalRef.current = startSignal

    console.log('🎡 Wheel starting spin with signal:', startSignal, 'namesSafe:', namesSafe)

    // pick random index
    const idx = Math.floor(Math.random() * namesSafe.length)
    const winnerName = namesSafe[idx]
    const sliceAngle = 360 / namesSafe.length
    const centerAngle = idx * sliceAngle + sliceAngle / 2

    // spins and randomness - spin more for drama
    const spins = Math.floor(Math.random() * 5) + 8 // 8..12 spins for more spinning
    // Labels are positioned with -90 offset (angle - 90), so:
    // We need to rotate wheel so that: (centerAngle - 90) becomes 0 (top)
    // Which means: rotation = spins * 360 + (90 - centerAngle)
    const target = spins * 360 + (90 - centerAngle)

    // animate
    setIsAnimating(true)
    setSelected(null)
    if (onSelected) onSelected(null, undefined)
    setConfetti(false)
    // set the rotation (CSS transition handles animation)
    // use a slight delay to ensure re-render and CSS pickup
    requestAnimationFrame(() => requestAnimationFrame(() => setRotation(target)))

    // duration proportional to spins (use fixed duration)
    const duration = 4 // Fixed 4 second spin

    console.log('🎡 Winner INDEX:', idx, 'Name:', winnerName)
    console.log('🎡 sliceAngle:', sliceAngle, 'centerAngle:', centerAngle)
    console.log('🎡 Spins:', spins, 'Target rotation:', target)
    console.log('🎡 Names:', namesSafe)

    const endTimer = window.setTimeout(() => {
      console.log('🏆 Spin ended, selected name is:', winnerName)
      console.log('🏆 Final rotation:', rotation, 'Modulo 360:', rotation % 360)
      setIsAnimating(false)
      setSelected(winnerName)
      if (onSelected) onSelected(winnerName, colors[idx])
      setConfetti(true)
      
      // Call onWinner callback using ref
      console.log('📞 About to call onWinner with:', winnerName, 'onWinner exists?', !!onWinnerRef.current)
      if (onWinnerRef.current) {
        console.log('📞 Calling onWinner callback with:', winnerName)
        try {
          onWinnerRef.current(winnerName)
          console.log('✅ onWinner callback executed successfully')
        } catch (err) {
          console.log('❌ Error calling onWinner:', err)
        }
      } else {
        console.log('⚠️ onWinner callback is not defined!')
      }
      
      // Audio playback handled by parent component (to avoid autoplay restrictions)
      console.log('🎵 Parent should handle audio playback for:', winnerName)
      
      setTimeout(() => setConfetti(false), 3500)
    }, duration * 1000)
    // keep timer id so it isn't cancelled by subsequent effect runs
    timersRef.current.push(endTimer)

    // NOTE: do NOT clear this timer here — if a new spin starts we still want
    // the previous spin to finish and call its winner callback. We'll clear
    // outstanding timers on component unmount instead.
  }, [startSignal, namesSafe])

  // cleanup all outstanding timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => clearTimeout(id))
      timersRef.current = []
    }
  }, [])

  // build conic-gradient background
  const sliceAngle = 360 / namesSafe.length
  const gradParts = namesSafe.map((_, i) => {
    const start = i * sliceAngle
    const end = start + sliceAngle
    return `${colors[i]} ${start}deg ${end}deg`
  })
  const gradient = `conic-gradient(${gradParts.join(', ')})`

  const wheelSize = 460

  return (
    <div style={{ marginTop: 12 }} ref={containerRef}>
      <div style={{ padding: 20, borderRadius: '12px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {/* <div style={{ fontSize: 14, color: '#667eea', fontWeight: 600, marginBottom: 12 }}>🎯 FLS Spinning Wheel</div> */}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <div style={{ position: 'relative', width: wheelSize, height: wheelSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Top pointer indicator - fixed outside wheel */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -12,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '20px solid #f39c12',
                zIndex: 10,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />

            {/* wheel */}
            <div
              style={{
                width: wheelSize,
                height: wheelSize,
                borderRadius: '50%',
                background: gradient,
                transition: isAnimating ? `transform ${Math.max(3.5, (rotation / 360) * 0.12 + 3)}s cubic-bezier(.17,.67,.12,1)` : 'none',
                transform: `rotate(${rotation}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 15px 45px rgba(102, 126, 234, 0.35), inset 0 6px 12px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(0,0,0,0.15)',
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.8em',
                  color: '#667eea',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                {isAnimating ? '⚡' : selected ? '✨' : '▶'}
              </div>
            </div>

            {/* labels around wheel */}
            {namesSafe.map((n, i) => {
              const angle = i * sliceAngle + sliceAngle / 2
              const rad = (angle - 90) * (Math.PI / 180)
              const r = wheelSize / 2 - 40
              const x = wheelSize / 2 + Math.cos(rad) * r
              const y = wheelSize / 2 + Math.sin(rad) * r
              
              // During animation, collapse to center; otherwise show at position
              const animX = isAnimating ? wheelSize / 2 : x
              const animY = isAnimating ? wheelSize / 2 : y
              
              return (
                <div
                  key={n}
                  style={{
                    position: 'absolute',
                    left: animX,
                    top: animY,
                    transform: 'translate(-50%,-50%)',
                    pointerEvents: 'none',
                    width: 100,
                    textAlign: 'center',
                    color: colors[i],
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: '0.85em',
                    opacity: isAnimating ? 0.3 : 1,
                    transition: isAnimating 
                      ? 'left 0.3s ease-in, top 0.3s ease-in, opacity 0.3s ease-in'
                      : `left ${Math.max(3.5, (rotation / 360) * 0.12 + 3)}s cubic-bezier(.17,.67,.12,1), top ${Math.max(3.5, (rotation / 360) * 0.12 + 3)}s cubic-bezier(.17,.67,.12,1), opacity 0.5s ease-out`,
                  }}
                >
                  {n}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: '#666', textAlign: 'center' }}>
          {namesSafe.length > 0 && <div>👥 {namesSafe.join(' • ')}</div>}
        </div>
      </div>
      {confetti && <Confetti />}
    </div>
  )
}
