import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CaretLeft, CaretRight, Shield, Question } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean
  source: string
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
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

  const handleRepsChange = (delta: number) => {
    setSession(prev => prev ? { ...prev, actualReps: Math.max(0, prev.actualReps + delta) } : null)
  }

  const startRest = () => {
    const question = getRandomQuestion()
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

  const handleAnswerQuestion = (isCorrect: boolean) => {
    if (!session?.currentQuestion) return

    setUsedQuestions(prev => [...(prev || []), session.currentQuestion!.id])
    
    if (isCorrect) {
      setSession(prev => prev ? { ...prev, canSkip: true } : null)
      setFeedback(`✅ Correct! ${session.currentQuestion.source}`)
    } else {
      setFeedback(`❌ Incorrect. ${session.currentQuestion.source}`)
    }
  }

  const skipRest = () => {
    const exercise = getCurrentExercise()
    if (!exercise) return

    if (session && session.currentSet + 1 >= exercise.sets) {
      // Move to next exercise or complete workout
      if (session.currentExercise + 1 >= workout.exercises.length) {
        setSession(prev => prev ? { ...prev, state: 'complete' } : null)
      } else {
        setSession(prev => prev ? {
          ...prev,
          currentExercise: prev.currentExercise + 1,
          currentSet: 0,
          state: 'input',
          timeLeft: 180,
          actualReps: 0,
          timerRunning: false,
          currentQuestion: undefined,
          userAnswer: undefined,
          canSkip: false
        } : null)
      }
    } else {
      // Move to next set
      setSession(prev => prev ? {
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input',
        timeLeft: 180,
        actualReps: 0,
        timerRunning: false,
        currentQuestion: undefined,
        userAnswer: undefined,
        canSkip: false
      } : null)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Loading workout...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (session.state === 'complete') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>🎉 Workout Complete!</CardTitle>
          <CardDescription>Great job finishing {workout.name}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onWorkoutComplete}>Start New Workout</Button>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()
  if (!currentExercise) return null

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Exercise {session.currentExercise + 1} of {workout.exercises.length}
          </Badge>
          <Badge variant="outline">
            Set {session.currentSet + 1} of {currentExercise.sets}
          </Badge>
        </div>
        <CardTitle className="text-2xl mt-4">{currentExercise.name}</CardTitle>
        <CardDescription>
          Target: {currentExercise.targetReps} reps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {session.state === 'input' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRepsChange(-1)}
                disabled={session.actualReps <= 0}
              >
                <CaretLeft />
              </Button>
              
              <Input
                type="number"
                value={session.actualReps}
                onChange={(e) => handleRepsChange(Number(e.target.value) - session.actualReps)}
                className="w-20 text-center text-lg"
                placeholder="0"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRepsChange(1)}
              >
                <CaretRight />
              </Button>
            </div>
            
            <Button 
              className="w-full"
              onClick={startRest}
              disabled={session.actualReps <= 0}
            >
              Complete Set - Start Rest
            </Button>
          </div>
        )}

        {session.state === 'rest' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {formatTime(session.timeLeft)}
              </div>
              <p className="text-muted-foreground">Rest time remaining</p>
            </div>

            {session.currentQuestion && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Security Knowledge Check
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Question className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm">{session.currentQuestion.question}</p>
                  </div>
                  
                  {session.userAnswer === undefined ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnswerQuestion(true)}
                        className="flex-1"
                      >
                        True
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnswerQuestion(false)}
                        className="flex-1"
                      >
                        False
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className={`font-medium ${feedback.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              variant="default"
              className="w-full"
              onClick={skipRest}
              disabled={!session.canSkip && session.timeLeft > 0}
            >
              {session.canSkip || session.timeLeft === 0 ? 'Continue to Next Set' : `Wait ${formatTime(session.timeLeft)}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}