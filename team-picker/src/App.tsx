
import React, { useRef, useState } from 'react'
import Wheel from './components/Wheel'
import WinnersSidebar from './components/WinnersSidebar'
import BouncingBall from './components/BouncingBall'
import VoiceControl from './components/VoiceControl'
import TermsConditions from './components/TermsConditions'
import PrivacyPolicy from './components/PrivacyPolicy'

const DEFAULT_NAMES = [
  'Shruti',
  'Naman',
  'Keta',
  'Kuldip',
  'Praful',
  'Viren',
  
]

type Winner = {
  name: string
  points: number
  count: number
}

export default function App() {
  const [namesText, setNamesText] = useState(DEFAULT_NAMES.join('\n'))
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES)
  const [startKey, setStartKey] = useState(0)
  const [winners, setWinners] = useState<Winner[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [showBounce, setShowBounce] = useState(false)
  const [selectedWheelName, setSelectedWheelName] = useState<string | null>(null)
  const [selectedWheelColor, setSelectedWheelColor] = useState<string | undefined>(undefined)
  const [namesLoaded, setNamesLoaded] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  function loadNames() {
    const parsed = namesText
      .split(/[,\n]+/)
      .map(s => s.trim())
      .filter(Boolean)
    if (parsed.length > 0) setNames(parsed)
    else setNames(DEFAULT_NAMES)
    setNamesLoaded(true) // Mark names as loaded
  }

  function startPlay() {
    loadNames()
    setShowBounce(false)
    setSelectedName(null)
    // unlock audio with this user gesture and then start
    unlockAudio()
    setStartKey(k => k + 1)
  }

  // audio ref for winner sound
  const audioRef = useRef<HTMLAudioElement>(null)

  // Attempt to unlock audio on startPlay (user gesture). This will play
  // and immediately pause the audio so later playback isn't blocked.
  const unlockAudio = () => {
    try {
      if (audioRef.current) {
        console.log('🔊 Unlocking audio')
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()
        if (playPromise) {
          playPromise
            .then(() => {
              console.log('🔊 Audio unlocked, pausing')
              audioRef.current?.pause()
              audioRef.current!.currentTime = 0
            })
            .catch((err) => {
              console.log('🔊 Unlock attempt failed:', err)
            })
        }
      }
    } catch (e) {
      console.log('🔊 Error unlocking audio:', e)
    }
  }

  function handleWinner(name: string) {
    console.log('🏆 handleWinner called with:', name)
    setSelectedName(name)
    setShowBounce(true)

    // Play winner audio using HTML element
    try {
      if (audioRef.current) {
        console.log('🎵 Playing winner audio')
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()
        if (playPromise) {
          playPromise
            .then(() => {
              console.log('✅ Winner audio playing')
            })
            .catch((err) => {
              console.log('❌ Winner audio failed to play:', err)
            })
        }
      } else {
        console.log('⚠️ Audio element not ready')
      }
    } catch (e) {
      console.log('❌ Audio play error:', e)
    }

    // Update or add winner
    setWinners(prev => {
      const existing = prev.find(w => w.name === name)
      const updated = existing
        ? prev.map(w =>
            w.name === name ? { ...w, points: w.points + 5, count: w.count + 1 } : w
          )
        : [...prev, { name, points: 5, count: 1 }]
      console.log('📊 Winners updated:', updated)
      return updated
    })

    // Hide bouncing ball after 4 seconds
    setTimeout(() => {
      setShowBounce(false)
    }, 4000)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Left Sidebar - Winners */}
      <WinnersSidebar winners={winners} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, padding: 20, flex: 1 }}>
            {/* Wheel Section (middle) - header moved here and centered */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
              <h1 style={{ margin: 0, color: '#2c3e50' }}>🎡 Spinning Wheel</h1>
              <div style={{ marginTop: 6, color: '#6c7a89', fontSize: 14, fontWeight: 600 }}>Fun-Learn-Succeed</div>
            </div>
            <Wheel
              names={names}
              startSignal={startKey}
              onWinner={handleWinner}
              onSelected={(name, color) => {
                setSelectedWheelName(name)
                setSelectedWheelColor(color)
              }}
            />
          </div>

          {/* Features / Input Section (right) */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2c3e50', marginBottom: 12 }}>🎛️ Game Controls</div>
            {/* Show textarea and Load Names only when names are NOT yet loaded */}
            {!namesLoaded && (
              <>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                  Mock names (one per line or comma separated)
                </label>
                <textarea
                  value={namesText}
                  onChange={e => setNamesText(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    resize: 'none',
                    marginBottom: 12,
                  }}
                />
                <button
                  onClick={loadNames}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Load Names
                </button>
              </>
            )}

            {/* Always show Start Play button */}
            <button
              onClick={startPlay}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: namesLoaded ? 12 : 8,
              }}
            >
              🎮 Start Play
            </button>

            {/* Voice Control */}
            <VoiceControl onVoiceCommand={startPlay} />

            {/* Selected Winner Display */}
            {selectedWheelName && (
              <div style={{
                marginTop: 16,
                padding: '16px',
                background: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '3px solid #444',
              }}>
                <div style={{ fontSize: '0.85em', color: '#2c3e50', fontWeight: 700 }}>🎉 Selected</div>
                <div style={{ 
                  fontSize: '1.4em', 
                  fontWeight: 800, 
                  color: '#2c3e50',
                  marginTop: 6,
                }}>
                  {selectedWheelName}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginTop: '20px'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 700, color: '#2c3e50', textAlign: 'center' }}>❓ Frequently Asked Questions</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* FAQ 1 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '24px',
              borderRadius: '8px',
              border: '2px solid #3498db'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#3498db' }}>🎡 What is the Wheel Spinner for?</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
                <li>Make random selection fun and engaging</li>
                <li>Fair and unbiased team selection</li>
                <li>Pick lucky winners from survey attendees during presentations</li>
                <li>Track performance with automatic leaderboard</li>
                <li>Voice control support for hands-free operation</li>
              </ul>
            </div>

            {/* FAQ 2 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '24px',
              borderRadius: '8px',
              border: '2px solid #3498db'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#3498db' }}>🎮 How to use the Wheel Spinner?</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                <strong>Step 1:</strong> Enter names (one per line or comma-separated) in the text area on the right panel.
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                <strong>Step 2:</strong> Click "Load Names" to save your team members.
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                <strong>Step 3:</strong> Click "Start Play" or use voice commands to spin the wheel.
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                <strong>Step 4:</strong> Watch the wheel spin and see who gets selected! The leaderboard on the left tracks wins.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#2c3e50',
          color: '#ecf0f1',
          padding: '32px 20px 20px',
          marginTop: 'auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto 24px'
          }}>
            {/* About Section */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#3498db' }}>
                🎡 About FLS Wheel
              </h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#bdc3c7' }}>
                Fun-Learn-Succeed Spinning Wheel - An interactive team picker game that makes selection fun and fair.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#3498db' }}>
                Quick Links
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>
                  <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: '#ecf0f1', textDecoration: 'none', fontSize: '13px', cursor: 'pointer', padding: 0 }}>❓ FAQ</button>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: '#ecf0f1', textDecoration: 'none', fontSize: '13px', cursor: 'pointer', padding: 0 }}>📜 Terms & Conditions</button>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: '#ecf0f1', textDecoration: 'none', fontSize: '13px', cursor: 'pointer', padding: 0 }}>🔒 Privacy Policy</button>
                </li>
              </ul>
            </div>

            {/* Feedback */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#3498db' }}>
                Get in Touch
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="mailto:feedback@flswheel.com" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '13px' }}>💬 Send Feedback</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="https://github.com/virennitkkr/Online-PlayPicker" target="_blank" rel="noopener noreferrer" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '13px' }}>🌟 Star on GitHub</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid #34495e',
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#95a5a6'
          }}>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} FLS Spinning Wheel. Made with ❤️ for fun and learning.
            </p>
          </div>
        </footer>
      </div>
    </div>

      {/* Bouncing Ball */}
      <BouncingBall name={selectedName} isShowing={showBounce} />

      {/* Hidden audio element for winner sound - Mastercard Sonic Brand */}
      <audio
        ref={audioRef}
        preload="auto"
        onCanPlayThrough={() => console.log('🎵 Audio ready to play')}
        onError={(e) => console.log('🎵 Audio error:', e)}
      >
        <source src="/sounds/mc_m.opus" type="audio/ogg; codecs=opus" />
        <source src="/sounds/winner.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>

      {/* Modals */}
      {showTerms && <TermsConditions onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}
