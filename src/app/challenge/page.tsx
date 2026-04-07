'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface GameData {
  type: string
  data: any
  completed: boolean
}

interface Challenge {
  id: string
  game1: GameData
  game2: GameData
  game3: GameData
}

export default function Challenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [currentGame, setCurrentGame] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [reward, setReward] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchChallenge(token)
  }, [router])

  const fetchChallenge = async (token: string) => {
    try {
      const res = await fetch('/api/challenge', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }

      const data = await res.json()
      setChallenge(data.challenge)
      
      // Find first uncompleted game
      const completed1 = data.challenge.game1.completed
      const completed2 = data.challenge.game2.completed
      const completed3 = data.challenge.game3.completed
      
      if (!completed1) setCurrentGame(1)
      else if (!completed2) setCurrentGame(2)
      else if (!completed3) setCurrentGame(3)
      else {
        setCompleted(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const completeGame = async () => {
    const token = localStorage.getItem('token')
    if (!token || !challenge) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ gameNumber: currentGame, completed: true }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error')
      }

      if (data.completed) {
        setCompleted(true)
        setReward(data.reward)
      } else {
        // Go to next game
        setCurrentGame(currentGame + 1)
        // Reload challenge to see progress
        fetchChallenge(token)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link href="/dashboard" className="text-cyan-400 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
            Congratulations!
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            You completed all challenges!
          </p>
          <p className="text-2xl font-bold text-green-400 mb-6">
            +${reward}
          </p>
          <Link 
            href="/dashboard"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold hover:opacity-90 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentGameData = currentGame === 1 ? challenge?.game1 : 
                         currentGame === 2 ? challenge?.game2 : challenge?.game3

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between border-b border-white/10">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
          ← Quit
        </Link>
        <h1 className="text-xl font-bold">Daily Challenge</h1>
        <div className="text-sm text-gray-400">
          Game {currentGame}/3
        </div>
      </header>

      {/* Progress */}
      <div className="flex h-1 bg-white/10">
        <div className={`flex-1 ${challenge?.game1.completed ? 'bg-green-400' : currentGame === 1 ? 'bg-cyan-400' : 'bg-white/10'}`} />
        <div className={`flex-1 ${challenge?.game2.completed ? 'bg-green-400' : currentGame === 2 ? 'bg-cyan-400' : 'bg-white/10'}`} />
        <div className={`flex-1 ${challenge?.game3.completed ? 'bg-green-400' : currentGame === 3 ? 'bg-cyan-400' : 'bg-white/10'}`} />
      </div>

      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        {currentGameData && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            {currentGameData.type === 'memory' && (
              <MemoryGame data={currentGameData.data} onComplete={completeGame} submitting={submitting} />
            )}
            {currentGameData.type === 'sequence' && (
              <SequenceGame data={currentGameData.data} onComplete={completeGame} submitting={submitting} />
            )}
            {currentGameData.type === 'math' && (
              <MathGame data={currentGameData.data} onComplete={completeGame} submitting={submitting} />
            )}
            {currentGameData.type === 'pattern' && (
              <PatternGame data={currentGameData.data} onComplete={completeGame} submitting={submitting} />
            )}
            {currentGameData.type === 'reaction' && (
              <ReactionGame data={currentGameData.data} onComplete={completeGame} submitting={submitting} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Mini-Game Components
function MemoryGame({ data, onComplete, submitting }: { data: any; onComplete: () => void; submitting: boolean }) {
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [canFlip, setCanFlip] = useState(true)

  const handleFlip = (index: number) => {
    if (!canFlip || flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setCanFlip(false)
      const [first, second] = newFlipped
      if (data.grid[first] === data.grid[second]) {
        setMatched([...matched, first, second])
        setFlipped([])
        setCanFlip(true)
      } else {
        setTimeout(() => {
          setFlipped([])
          setCanFlip(true)
        }, 1000)
      }
    }
  }

  useEffect(() => {
    if (matched.length === data.grid.length && matched.length > 0) {
      setTimeout(onComplete, 500)
    }
  }, [matched, data.grid.length, onComplete])

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Memory Game</h3>
      <p className="text-gray-400 text-center mb-6">Find the matching pairs!</p>
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {data.grid.map((value: number, index: number) => (
          <button
            key={index}
            onClick={() => handleFlip(index)}
            disabled={submitting}
            className={`aspect-square rounded-xl text-2xl font-bold transition-all ${
              flipped.includes(index) || matched.includes(index)
                ? 'bg-cyan-400 text-black rotate-0'
                : 'bg-white/10 hover:bg-white/20 rotate-180'
            }`}
          >
            {(flipped.includes(index) || matched.includes(index)) ? value : '?'}
          </button>
        ))}
      </div>
    </div>
  )
}

function SequenceGame({ data, onComplete, submitting }: { data: any; onComplete: () => void; submitting: boolean }) {
  const [showing, setShowing] = useState(true)
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Show sequence for 3 seconds
    const timer = setTimeout(() => setShowing(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleNumber = (num: number) => {
    if (submitting) return
    
    const newSequence = [...userSequence, num]
    setUserSequence(newSequence)

    if (num !== data.sequence[currentIndex]) {
      // Wrong - restart
      setUserSequence([])
      setCurrentIndex(0)
      setShowing(true)
      setTimeout(() => setShowing(false), 2000)
      return
    }

    if (currentIndex + 1 === data.sequence.length) {
      // Completed
      onComplete()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Sequence</h3>
      <p className="text-gray-400 text-center mb-6">Memorize the sequence!</p>
      
      <div className="flex justify-center gap-2 mb-8 min-h-16">
        {showing ? (
          data.sequence.map((num: number, i: number) => (
            <div key={i} className="w-12 h-12 rounded-lg bg-cyan-400 text-black flex items-center justify-center text-xl font-bold">
              {num}
            </div>
          ))
        ) : (
          userSequence.map((num, i) => (
            <div key={i} className="w-12 h-12 rounded-lg bg-green-400 text-black flex items-center justify-center text-xl font-bold">
              {num}
            </div>
          ))
        )}
      </div>

      {!showing && (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              disabled={submitting}
              className="aspect-square rounded-xl bg-white/10 hover:bg-white/20 text-xl font-bold transition"
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MathGame({ data, onComplete, submitting }: { data: any; onComplete: () => void; submitting: boolean }) {
  const [answers, setAnswers] = useState<number[]>(new Array(data.operations.length).fill(0))
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleAnswer = (answer: number) => {
    if (submitting) return

    const newAnswers = [...answers]
    newAnswers[currentIndex] = answer
    setAnswers(newAnswers)

    if (answer === data.answers[currentIndex]) {
      if (currentIndex + 1 === data.operations.length) {
        onComplete()
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else {
      // Wrong - restart from beginning
      setAnswers(new Array(data.operations.length).fill(0))
      setCurrentIndex(0)
    }
  }

  const op = data.operations[currentIndex]
  const options = [
    data.answers[currentIndex],
    data.answers[currentIndex] + Math.floor(Math.random() * 5) + 1,
    data.answers[currentIndex] - Math.floor(Math.random() * 5) - 1,
    data.answers[currentIndex] + Math.floor(Math.random() * 10) - 5,
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).sort(() => Math.random() - 0.5)

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Quick Math</h3>
      <p className="text-gray-400 text-center mb-6">Calculation {currentIndex + 1}/{data.operations.length}</p>
      
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-cyan-400">
          {op.num1} {op.operator} {op.num2} = ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={submitting}
            className="py-4 rounded-xl bg-white/10 hover:bg-cyan-400/20 text-xl font-bold transition"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function PatternGame({ data, onComplete, submitting }: { data: any; onComplete: () => void; submitting: boolean }) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (submitting) return
    setSelected(index)
    
    if (index === data.correctIndex) {
      setTimeout(onComplete, 500)
    } else {
      setTimeout(() => setSelected(null), 500)
    }
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Pattern</h3>
      <p className="text-gray-400 text-center mb-6">What comes next in the sequence?</p>
      
      <div className="flex justify-center gap-2 mb-8">
        {data.shapes.map((shape: string, i: number) => (
          <div 
            key={i} 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
              shape === '?' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/10'
            }`}
          >
            {shape}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {data.options.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={submitting || selected !== null}
            className={`py-4 rounded-xl text-2xl font-bold transition ${
              selected === i 
                ? i === data.correctIndex 
                  ? 'bg-green-400 text-black' 
                  : 'bg-red-400 text-black'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ReactionGame({ data, onComplete, submitting }: { data: any; onComplete: () => void; submitting: boolean }) {
  const [started, setStarted] = useState(false)
  const [targetIndex, setTargetIndex] = useState(0)
  const [score, setScore] = useState(0)

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500']
  const targetColors = ['red', 'blue', 'green', 'yellow']

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        setTargetIndex(Math.floor(Math.random() * 4))
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [started])

  const handleClick = (colorIndex: number) => {
    if (!started || submitting) return

    if (targetColors[colorIndex] === data.targetColor) {
      const newScore = score + 1
      setScore(newScore)
      if (newScore >= 5) {
        onComplete()
      }
    }
  }

  if (!started) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Reaction Game</h3>
        <p className="text-gray-400 mb-6">Click the {data.targetColor} color 5 times!</p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold"
        >
          Start
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Reaction</h3>
      <p className="text-center text-gray-400 mb-4">Click the {data.targetColor} color!</p>
      <p className="text-center text-2xl font-bold mb-6">{score}/5</p>
      
      <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-white/10 flex items-center justify-center">
        <div className={`w-16 h-16 rounded-lg ${colors[targetIndex]}`} />
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {targetColors.map((color, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={submitting}
            className={`aspect-square rounded-xl ${colors[i]} hover:opacity-80 transition`}
          />
        ))}
      </div>
    </div>
  )
}
