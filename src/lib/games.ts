// Mini-games pentru daily challenge - fără limbaj, doar vizuale/calcule simple

export type GameType = 'memory' | 'sequence' | 'math' | 'pattern' | 'reaction'

export interface MemoryGame {
  type: 'memory'
  grid: number[] // Perechi de numere (ex: [1,1,2,2,3,3])
  timeLimit: number // secunde
}

export interface SequenceGame {
  type: 'sequence'
  sequence: number[] // Șir de numere ascunse unul câte unul
  userInput: number[]
  length: number
}

export interface MathGame {
  type: 'math'
  operations: { num1: number; num2: number; operator: '+' | '-' | '*' }[]
  answers: number[]
}

export interface PatternGame {
  type: 'pattern'
  shapes: string[] // ['○', '△', '□', '○', '△', '?']
  options: string[]
  correctIndex: number
}

export interface ReactionGame {
  type: 'reaction'
  targetColor: string
  distractors: string[]
  timeLimit: number
}

export type GameData = MemoryGame | SequenceGame | MathGame | PatternGame | ReactionGame

// Generare jocuri random
export function generateMemoryGame(): MemoryGame {
  const pairs = 4 // 4 perechi = 8 cărți
  const grid: number[] = []
  for (let i = 1; i <= pairs; i++) {
    grid.push(i, i)
  }
  // Shuffle
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]]
  }
  return { type: 'memory', grid, timeLimit: 60 }
}

export function generateSequenceGame(): SequenceGame {
  const length = 5 + Math.floor(Math.random() * 3) // 5-7 numere
  const sequence: number[] = []
  let current = Math.floor(Math.random() * 9) + 1
  for (let i = 0; i < length; i++) {
    sequence.push(current)
    current = (current + Math.floor(Math.random() * 3) + 1) % 9 + 1
  }
  return { type: 'sequence', sequence, userInput: [], length }
}

export function generateMathGame(): MathGame {
  const operations: MathGame['operations'] = []
  const answers: number[] = []
  const ops: ('+' | '-' | '*')[] = ['+', '-', '*']
  
  for (let i = 0; i < 5; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)]
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    operations.push({ num1, num2, operator: op })
    
    let ans = 0
    switch (op) {
      case '+': ans = num1 + num2; break
      case '-': ans = num1 - num2; break
      case '*': ans = num1 * num2; break
    }
    answers.push(ans)
  }
  return { type: 'math', operations, answers }
}

export function generatePatternGame(): PatternGame {
  const shapes = ['○', '△', '□', '☆', '♦']
  const patternLength = 6
  const pattern: string[] = []
  const sequenceLength = 3 // Pattern de 3 care se repetă
  
  for (let i = 0; i < sequenceLength; i++) {
    pattern.push(shapes[i])
  }
  
  const fullPattern: string[] = []
  for (let i = 0; i < patternLength - 1; i++) {
    fullPattern.push(pattern[i % sequenceLength])
  }
  fullPattern.push('?') // Ultimul element de ghicit
  
  const correctIndex = (patternLength - 1) % sequenceLength
  const correctShape = pattern[correctIndex]
  
  // Generare opțiuni (inclusiv răspunsul corect)
  const options = [correctShape]
  while (options.length < 4) {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
    if (!options.includes(randomShape)) {
      options.push(randomShape)
    }
  }
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }
  
  return { 
    type: 'pattern', 
    shapes: fullPattern, 
    options, 
    correctIndex: options.indexOf(correctShape) 
  }
}

export function generateReactionGame(): ReactionGame {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple']
  const targetColor = colors[Math.floor(Math.random() * colors.length)]
  const distractors = colors.filter(c => c !== targetColor).slice(0, 3)
  return { type: 'reaction', targetColor, distractors, timeLimit: 30 }
}

export function generateDailyChallenge(): [GameData, GameData, GameData] {
  const games: (() => GameData)[] = [
    generateMemoryGame,
    generateSequenceGame,
    generateMathGame,
    generatePatternGame,
    generateReactionGame,
  ]
  
  // Selectăm 3 jocuri random
  const selected: GameData[] = []
  const indices = new Set<number>()
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * games.length))
  }
  indices.forEach(i => selected.push(games[i]()))
  
  return selected as [GameData, GameData, GameData]
}
