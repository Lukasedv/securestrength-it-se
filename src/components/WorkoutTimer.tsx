import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Minus } from '@phosphor-icons/react'
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

  // Initialize session when workout changes
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      const currentExercise = workout.exercises[0]
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id,
        actualReps: parseInt(currentExercise.targetReps) || 0
      })
    }
  }, [workout.id, session, setSession])

  // Timer effect
  useEffect(() => {
    if (!session?.timerRunning || session.timeLeft <= 0) return

    const interval = setInterval(() => {
      setSession(prev => prev ? {
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      } : null)
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.timerRunning, session?.timeLeft, setSession])

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
    return session ? workout.exercises[session.currentExercise] : null
  }

  const startRestTimer = () => {
    if (!session) return
    
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
      setSession(prev => prev ? { ...prev, canSkip: true, userAnswer: answer } : null)
      setFeedback('✅ Correct! You can now skip to the next set.')
    } else {
      setFeedback('❌ Wrong answer, redo the last set.')
      setSession(prev => prev ? {
        ...prev,
        state: 'input',
        timerRunning: false,
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
    }
  }

  const skipToNextSet = () => {
    if (!session?.canSkip) return
    nextSet()
  }

  const nextSet = () => {
    if (!session) return
    
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    if (session.currentSet + 1 >= currentExercise.sets) {
      // Move to next exercise
      const nextExerciseIndex = session.currentExercise + 1
      if (nextExerciseIndex >= workout.exercises.length) {
        onWorkoutComplete()
        return
      }
      const nextExercise = workout.exercises[nextExerciseIndex]
      setSession(prev => prev ? {
        ...prev,
        currentExercise: nextExerciseIndex,
        currentSet: 0,
        actualReps: parseInt(nextExercise.targetReps) || 0,
        state: 'input',
        timerRunning: false,
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
    } else {
      // Move to next set of same exercise
      setSession(prev => prev ? {
        ...prev,
        currentSet: prev.currentSet + 1,
        actualReps: parseInt(currentExercise.targetReps) || 0,
        state: 'input',
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading workout...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()
  if (!currentExercise) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Complete!</CardTitle>
          <CardDescription>Great job completing your workout!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onWorkoutComplete}>
            Return to Workout Selection
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <span>{currentExercise.name}</span>
            <span className="text-sm font-normal text-muted-foreground">
              Set {session.currentSet + 1}/{currentExercise.sets}
            </span>
          </div>
        </CardTitle>
        <CardDescription>Target: {currentExercise.targetReps} reps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {session.state === 'input' && (
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Adjust reps completed:
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustReps(-1)}
                disabled={session.actualReps <= 0}
              >
                <Minus size={16} />
              </Button>
              
              <span className="text-2xl font-bold w-16">
                {session.actualReps}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustReps(1)}
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <Button
              onClick={startRestTimer}
              disabled={session.actualReps === 0}
              className="w-full"
            >
              Set Done
            </Button>
          </div>
        )}

        {session.state === 'rest' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(session.timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">Rest time remaining</div>
            </div>

            {session.currentQuestion && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-primary mb-2">
                    Security Knowledge Check
                  </h3>
                  <p className="text-sm">
                    {session.currentQuestion.question}
                  </p>
                </div>
                
                {session.userAnswer === undefined && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSecurityAnswer(true)}
                    >
                      True
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSecurityAnswer(false)}  
                    >
                      False
                    </Button>
                  </div>
                )}
              </div>
            )}

            {feedback && (
              <div className="text-center">
                <p className="text-sm font-medium">{feedback}</p>
              </div>
            )}

            {session.canSkip && (
              <Button
                onClick={skipToNextSet}
                variant="default"
                className="w-full"
              >
                Skip to Next Set
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}