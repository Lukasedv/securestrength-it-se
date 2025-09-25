import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from '@phosphor-icons/react'
import type { WorkoutDay } from '../App'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'cve-2024-3400',
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
  },
  {
    id: 'cve-2024-6387',
    question: 'Is this an sshd race condition that can lead to remote code execution on many Linux systems?',
    answer: true,
  },
  {
    id: 'cve-2024-3094',
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    answer: true,
  },
  {
    id: 'cve-2023-34362',
    question: 'Was this SQL injection widely exploited to drop web shells at scale?',
    answer: true,
  },
  {
    id: 'cve-2023-4966',
    question: 'Can session tokens be stolen and reused to hijack valid sessions?',
    answer: true,
  },
  {
    id: 'cve-2018-13379',
    question: 'Is this an old path-traversal bug that attackers still use for initial access?',
    answer: true,
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
  },
  {
    id: 'cve-2021-34527',
    question: 'Can Windows Print Spooler lead to local privilege escalation or RCE?',
    answer: true,
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange?',
    answer: true,
  },
  {
    id: 'cve-2021-34473',
    question: 'Is this part of a chain that enables unauthenticated remote code execution on Exchange?',
    answer: true,
  },
  {
    id: 'cve-2022-22965',
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data binding?',
    answer: true,
  },
  {
    id: 'cve-2022-26134',
    question: 'Does an OGNL injection allow unauthenticated RCE on Confluence Server/Data Center?',
    answer: true,
  },
  {
    id: 'cve-2019-19781',
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    answer: true,
  },
  {
    id: 'cve-2020-5902',
    question: 'Is the management UI vulnerable to unauthenticated RCE?',
    answer: true,
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
  },
  {
    id: 'cve-2023-23397',
    question: 'Can a malicious calendar item force Outlook to leak NTLM hashes automatically?',
    answer: true,
  },
  {
    id: 'cve-2022-47966',
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine products?',
    answer: true,
  },
  {
    id: 'cve-2023-3519',
    question: 'Can unauthenticated attackers achieve code execution on vulnerable NetScaler ADC/Gateway?',
    answer: true,
  },
  {
    id: 'cve-2020-1472',
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    answer: true,
  },
  {
    id: 'cve-2023-22515',
    question: 'Can attackers create admin accounts by abusing an authentication bypass in Confluence Data Center/Server?',
    answer: true,
  }
]

interface WorkoutSession {
  workoutId: string
  currentExercise: number
  currentSet: number
  state: 'input' | 'rest'
  timeLeft: number
  actualReps: number
  timerRunning: boolean
  currentQuestion?: SecurityQuestion
  userAnswer?: boolean
  canSkip: boolean
}

interface WorkoutTimerProps {
  workout: WorkoutDay
  onWorkoutComplete: () => void
}

const DEFAULT_SESSION: Omit<WorkoutSession, 'workoutId'> = {
  currentExercise: 0,
  currentSet: 0,
  state: 'input',
  timeLeft: 180,
  actualReps: 0,
  timerRunning: false,
  canSkip: false
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession | null>('workout-session', null)
  const [usedQuestions, setUsedQuestions] = useKV<string[]>('used-security-questions', [])
  const [feedback, setFeedback] = useState('')

  const getRandomQuestion = (): SecurityQuestion => {
    const usedIds = usedQuestions || []
    const availableQuestions = SECURITY_QUESTIONS.filter(q => !usedIds.includes(q.id))
    if (availableQuestions.length === 0) {
      setUsedQuestions([])
      return SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
    }
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
  }

  const getCurrentExercise = () => {
    if (!session) return null
    return workout.exercises[session.currentExercise]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize session
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      const currentExercise = workout.exercises[0]
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id,
        actualReps: parseInt(currentExercise?.targetReps || '0', 10) || 0
      })
    }
  }, [workout.id, session, setSession])

  // Timer countdown
  useEffect(() => {
    if (session?.timerRunning && session.timeLeft > 0) {
      const interval = setInterval(() => {
        setSession(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [session?.timerRunning, session?.timeLeft, setSession])

  const completeSet = () => {
    if (!session) return
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    // Start rest timer with security question
    const question = getRandomQuestion()
    setUsedQuestions(prev => [...(prev || []), question.id])
    setSession(prev => prev ? {
      ...prev,
      state: 'rest',
      timeLeft: 180,
      timerRunning: true,
      currentQuestion: question,
      userAnswer: undefined,
      canSkip: false
    } : null)
    setFeedback('')
  }

  const handleSecurityAnswer = (answer: boolean) => {
    if (!session?.currentQuestion) return

    const isCorrect = answer === session.currentQuestion.answer
    
    if (isCorrect) {
      setFeedback('✅ Correct! You can skip to the next set.')
      setSession(prev => prev ? { ...prev, userAnswer: answer, canSkip: true } : null)
    } else {
      setFeedback('❌ Wrong answer, redo the last set.')
      // Reset to repeat the set
      setSession(prev => prev ? {
        ...prev,
        state: 'input',
        timerRunning: false,
        actualReps: parseInt(getCurrentExercise()?.targetReps || '0', 10),
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
      setFeedback('')
    }
  }

  const skipRest = () => {
    if (!session?.canSkip) return
    nextSet()
  }

  const nextSet = () => {
    if (!session) return
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    const nextSetNumber = session.currentSet + 1
    
    if (nextSetNumber >= currentExercise.sets) {
      // Move to next exercise
      const nextExerciseIndex = session.currentExercise + 1
      if (nextExerciseIndex >= workout.exercises.length) {
        // Workout complete
        onWorkoutComplete()
        return
      }
      
      const nextExercise = workout.exercises[nextExerciseIndex]
      setSession(prev => prev ? {
        ...prev,
        currentExercise: nextExerciseIndex,
        currentSet: 0,
        state: 'input',
        actualReps: parseInt(nextExercise?.targetReps || '0', 10) || 0,
        timerRunning: false,
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
    } else {
      // Next set of same exercise
      setSession(prev => prev ? {
        ...prev,
        currentSet: nextSetNumber,
        state: 'input',
        actualReps: parseInt(currentExercise?.targetReps || '0', 10) || 0,
        timerRunning: false,
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
    }
    setFeedback('')
  }

  const adjustReps = (delta: number) => {
    setSession(prev => prev ? {
      ...prev,
      actualReps: Math.max(0, prev.actualReps + delta)
    } : null)
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (session.currentExercise >= workout.exercises.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎉 Workout Complete!</CardTitle>
          <CardDescription>Great job completing your workout!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onWorkoutComplete}>
            Finish Workout
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()
  if (!currentExercise) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {currentExercise.name} - Set {session.currentSet + 1} of {currentExercise.sets}
            </CardTitle>
            <CardDescription>Target: {currentExercise.targetReps} reps</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedback && (
          <div className={`p-3 rounded-md text-sm ${
            feedback.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback}
          </div>
        )}

        {session.state === 'input' && (
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Target: {currentExercise.targetReps} reps
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={session.actualReps <= 0}
                onClick={() => adjustReps(-1)}
              >
                <Minus size={16} />
              </Button>
              
              <div className="text-2xl font-bold min-w-[60px]">
                {session.actualReps}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustReps(1)}
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <Button
              className="w-full"
              disabled={session.actualReps <= 0}
              onClick={completeSet}
            >
              Complete Set - Start Rest Timer
            </Button>
          </div>
        )}

        {session.state === 'rest' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {formatTime(session.timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">Rest Timer</div>
            </div>
            
            {session.currentQuestion && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="font-medium text-sm">
                  Security Knowledge Check
                </div>
                <p className="text-sm">
                  {session.currentQuestion.question}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSecurityAnswer(true)}
                    disabled={session.userAnswer !== undefined}
                  >
                    True
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSecurityAnswer(false)}
                    disabled={session.userAnswer !== undefined}
                  >
                    False
                  </Button>
                </div>
              </div>
            )}
            
            {session.canSkip && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Answer correct! You can skip the rest timer.
                </p>
                <Button
                  variant="default"
                  onClick={skipRest}
                >
                  Skip to Next Set
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}