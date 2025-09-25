import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CaretLeft, CaretRight, Shield, Question } from '@phosphor-icons/react'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean
  source: string
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'cve-2024-3400',
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
    source: 'CVE-2024-3400 (PAN-OS GlobalProtect RCE)'
  },
  {
    id: 'cve-2024-6387',
    question: 'Is this an sshd race condition that can lead to remote code execution on many Linux systems?',
    answer: true,
    source: 'CVE-2024-6387 (OpenSSH "regreSSHion")'
  },
  {
    id: 'cve-2024-3094',
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    answer: true,
    source: 'CVE-2024-3094 (XZ Utils backdoor)'
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
    source: 'CVE-2021-44228 (Log4Shell)'
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange servers?',
    answer: true,
    source: 'CVE-2021-26855 (ProxyLogon)'
  },
  {
    id: 'cve-2022-22965',
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data binding?',
    answer: true,
    source: 'CVE-2022-22965 (Spring4Shell)'
  },
  {
    id: 'cve-2023-3519',
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    answer: true,
    source: 'CVE-2023-3519 (Citrix NetScaler ADC)'
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
    source: 'CVE-2022-30190 (Follina)'
  },
  {
    id: 'cve-2022-47966',
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine products?',
    answer: true,
    source: 'CVE-2022-47966 (ManageEngine SAML RCE)'
  },
  {
    id: 'cve-2020-1472',
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    answer: true,
    source: 'CVE-2020-1472 (Zerologon)'
  }
]

interface WorkoutSession {
  workoutId: string
  currentExercise: number
  currentSet: number
  state: 'input' | 'rest' | 'complete'
  timeLeft: number
  actualReps: number
  timerRunning: boolean
  currentQuestion?: SecurityQuestion
  userAnswer?: boolean
  canSkip: boolean
}

interface WorkoutTimerProps {
  workout: any
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
    const used = usedQuestions || []
    const availableQuestions = SECURITY_QUESTIONS.filter(q => !used.includes(q.id))
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

  // Initialize session
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id
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

  // Auto-transition when timer ends
  useEffect(() => {
    if (session?.state === 'rest' && session.timeLeft === 0) {
      const exercise = getCurrentExercise()
      if (!exercise) return

      if (session.currentSet + 1 >= exercise.sets) {
        // Move to next exercise or complete workout
        if (session.currentExercise + 1 >= workout.exercises.length) {
          setSession(prev => prev ? { ...prev, state: 'complete' } : null)
        } else {
          setSession(prev => prev ? {
            ...prev,
            currentExercise: prev.currentExercise + 1,
            currentSet: 0,
            state: 'input',
            actualReps: 0,
            userAnswer: undefined,
            currentQuestion: undefined,
            canSkip: false
          } : null)
        }
      } else {
        // Move to next set
        setSession(prev => prev ? {
          ...prev,
          currentSet: prev.currentSet + 1,
          state: 'input',
          actualReps: 0,
          userAnswer: undefined,
          currentQuestion: undefined,
          canSkip: false
        } : null)
      }
    }
  }, [session?.state, session?.timeLeft, session?.currentSet, session?.currentExercise, workout.exercises.length, setSession])

  const startRestTimer = () => {
    if (!session) return
    const question = getRandomQuestion()
    setSession(prev => prev ? {
      ...prev,
      state: 'rest',
      timeLeft: 180,
      timerRunning: true,
      currentQuestion: question,
      canSkip: false
    } : null)
    setFeedback('')
  }

  const handleSecurityAnswer = (answer: boolean) => {
    if (!session?.currentQuestion) return
    const isCorrect = answer === session.currentQuestion.answer

    setSession(prev => prev ? { ...prev, userAnswer: answer } : null)
    setUsedQuestions(prev => [...(prev || []), session.currentQuestion!.id])

    if (isCorrect) {
      setFeedback(`✅ Correct! ${session.currentQuestion.source}`)
      setSession(prev => prev ? { ...prev, canSkip: true } : null)
    } else {
      setFeedback(`❌ Incorrect. ${session.currentQuestion.source}`)
    }
  }

  const skipRest = () => {
    if (!session) return
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    if (session.currentSet + 1 >= currentExercise.sets) {
      // Move to next exercise or complete workout
      if (session.currentExercise + 1 >= workout.exercises.length) {
        setSession(prev => prev ? { ...prev, state: 'complete' } : null)
      } else {
        setSession(prev => prev ? {
          ...prev,
          currentExercise: prev.currentExercise + 1,
          currentSet: 0,
          state: 'input',
          actualReps: 0,
          userAnswer: undefined,
          currentQuestion: undefined,
          canSkip: false
        } : null)
      }
    } else {
      setSession(prev => prev ? {
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input',
        actualReps: 0,
        userAnswer: undefined,
        currentQuestion: undefined,
        canSkip: false
      } : null)
    }
    setFeedback('')
  }

  const redoSet = () => {
    setSession(prev => prev ? {
      ...prev,
      state: 'input',
      actualReps: 0,
      timerRunning: false,
      userAnswer: undefined,
      currentQuestion: undefined,
      canSkip: false
    } : null)
    setFeedback('')
  }

  const handleRepsChange = (value: string) => {
    const reps = parseInt(value) || 0
    setSession(prev => prev ? { ...prev, actualReps: reps } : null)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session) {
    return <div>Loading...</div>
  }

  if (session.state === 'complete') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Workout Complete!</CardTitle>
          <CardDescription>
            Great job completing {workout.name}!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onWorkoutComplete} className="w-full">
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
          <CardTitle>{currentExercise.name}</CardTitle>
          <Badge variant="outline">
            Set {session.currentSet + 1} of {currentExercise.sets}
          </Badge>
        </div>
        <CardDescription className="text-center text-lg">
          Target: {currentExercise.targetReps} reps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.state === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRepsChange((session.actualReps - 1).toString())}
                disabled={session.actualReps <= 0}
              >
                <CaretLeft size={16} />
              </Button>
              <Input
                type="number"
                value={session.actualReps}
                onChange={(e) => handleRepsChange(e.target.value)}
                className="text-center text-2xl font-bold"
                placeholder="Reps completed"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRepsChange((session.actualReps + 1).toString())}
              >
                <CaretRight size={16} />
              </Button>
            </div>
            <Button 
              onClick={startRestTimer}
              disabled={session.actualReps === 0}
              className="w-full"
            >
              Start Rest Timer
            </Button>
          </div>
        )}

        {session.state === 'rest' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {formatTime(session.timeLeft)}
              </div>
              <p className="text-muted-foreground">Rest time remaining</p>
            </div>

            {session.currentQuestion && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-primary" size={20} />
                  <span className="font-semibold">Security Question</span>
                </div>
                <p className="mb-4">{session.currentQuestion.question}</p>
                
                {session.userAnswer === undefined ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSecurityAnswer(true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleSecurityAnswer(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feedback && (
                      <p className={`p-2 rounded text-sm ${
                        feedback.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={redoSet} variant="outline" className="flex-1">
                Redo Set
              </Button>
              <Button 
                onClick={skipRest} 
                disabled={!session.canSkip && session.timeLeft > 0}
                variant="default"
                className="flex-1"
              >
                {session.currentSet + 1 >= currentExercise.sets ? 'Next Exercise' : 'Next Set'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}