import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/but
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkoutDay, Exercise } from '@/App'
import { CaretLeft, CaretRight, Shield, Play, Pause } from '@phosphor-icons/react'

interface SecurityQuestion {
  answer: bo
}
const SECURITY_QU
    id: 'cve-2024
 

    id: 'cve-2023-34362',
   
    id: 'cve-2024-3094',
    question: 'Can a malicious backdoor in compression software affect SSH authentication?',
    answer: true,
    source: 'CVE-2024-3094 (XZ Utils backdoor)'
  },
  {
    id: 'cve-2023-34362',
    question: 'Was this SQL injection widely exploited to drop web shells at scale?',
    answer: true,
    source: 'CVE-2023-34362 (MOVEit Transfer SQLi)'
  },
  {
    id: 'cve-2023-4966',
    question: 'Can session tokens be stolen and reused to hijack valid sessions?',
    answer: true,
    source: 'CVE-2023-4966 (Citrix/NetScaler "Bleed")'
  },
  {
    id: 'cve-2018-13379',
    question: 'Is this an old path-traversal bug that attackers still use for initial access?',
    answer: true,
    source: 'CVE-2018-13379 (Fortinet FortiOS SSL-VPN)'
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
    source: 'CVE-2021-44228 (Log4Shell)'
  },
  {
    id: 'cve-2021-34527',
    question: 'Can Windows Print Spooler lead to local privilege escalation or RCE?',
    answer: true,
    source: 'CVE-2021-34527 (PrintNightmare)'
  },
  {
    id: 'cve-2019-19781',
    question: 'Does this Citrix ADC/Gateway flaw allow unauthenticated remote code execution?',
    answer: true,
    source: 'CVE-2019-19781 (Citrix ADC/Gateway RCE)'
  },
  {
    id: 'cve-2020-5902',
    question: 'Can TMUI configuration utility be exploited for remote code execution?',
    answer: true,
    source: 'CVE-2020-5902 (F5 BIG-IP TMUI RCE)'
  },
  {
  },
    id: 'cve-2022-47966',
    answer: true,
  },
    
   
  },
    id: 'cve-2020-1472',
    answer: true,
  },
    
   
  }

  workoutId: stri
  currentSet: number
  ti
  a
  currentQuestion?: Secu
  canSkip: boolean

  workout: WorkoutDay
}
con
  currentSet: 1,
  timeLeft: 180,
  actualReps: 0,
  canSkip: false

  c
  if (availableQuestions.
  }
  const randomInd
}
exp
 

  useEffect(() => {
      setSession({
        workoutId: workout.id
    } else if (!sess
        ...DEFAULT_SESSION,
      })
  }, [workout.id, sessi
  // Update reps bas
    if (session && ses
      if (exercise) {
        setSession(pr
    }


    if (session && session.ti
        setSession((p
          timeLeft: prev.timeLe
 

  }, [session?.timerRunning, session?.timeLeft, setSession])
  const getCurrentExercise
    return worko

    if (!session
    setSession((prev: 
      state: 're
      timerRunning:
  canSkip: false
}

function getRandomQuestion(usedQuestions: string[] = []): SecurityQuestion {
  const availableQuestions = SECURITY_QUESTIONS.filter(q => !usedQuestions.includes(q.id))
  
  if (availableQuestions.length === 0) {
    return SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  return availableQuestions[randomIndex]
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [usedQuestions, setUsedQuestions] = useKV<string[]>('used-security-questions', [])
  const [session, setSession] = useKV<WorkoutSession | null>('workout-session', null)
  const [feedback, setFeedback] = useState<string>('')

  // Initialize session
  useEffect(() => {
    if (session && session.workoutId !== workout.id) {
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id
      })
    } else if (!session) {
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id
      })
    }
  }, [workout.id, session, setSession])

  // Update reps based on exercise target
  useEffect(() => {
    if (session && session.state === 'input') {
      const exercise = getCurrentExercise()
      if (exercise) {
        const targetReps = parseInt(exercise.targetReps) || 5
        setSession(prev => prev ? { ...prev, actualReps: targetReps } : null)
      }
    }
  }, [session?.state, session?.currentExerciseIndex, setSession])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (session && session.timerRunning && session.timeLeft > 0) {
      interval = setInterval(() => {
        setSession((prev: WorkoutSession | null) => prev ? ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }) : null)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [session?.timerRunning, session?.timeLeft, setSession])

  const getCurrentExercise = (): Exercise | null => {
    if (!session) return null
    return workout.exercises[session.currentExerciseIndex] || null
  }

  const startRest = () => {
    if (!session) return
    const question = getRandomQuestion(usedQuestions)
    setSession((prev: WorkoutSession | null) => prev ? ({
      ...prev,
      state: 'rest' as const,
      actualReps: prev.actualReps,
      timerRunning: true,
      timeLeft: prev.initialTime,
      initialTime: 180,
      currentQuestion: question,
      canSkip: false
    }) : null)
  }

  const handleAnswer = (userAnswer: boolean) => {
    if (!session?.currentQuestion) return

    const isCorrect = userAnswer === session.currentQuestion.answer
    setFeedback(isCorrect ? 'Correct! 💪' : 'Wrong answer, redo the last set.')

    setSession(prev => prev ? ({
      ...prev,
      userAnswer,
      canSkip: isCorrect
    }) : null)

    if (session.currentQuestion) {
      setUsedQuestions(prev => [...(prev || []), session.currentQuestion!.id])
    }

    // Don't auto-clear on incorrect answers - let user see the feedback
    if (isCorrect) {
      setTimeout(() => {
        setFeedback('')
      }, 1500)
    }
  }

  const moveToNextSet = () => {
    if (!session) return

    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    if (session.currentSet >= currentExercise.sets) {
      // Move to next exercise
      if (session.currentExerciseIndex < workout.exercises.length - 1) {
        setSession((prev: WorkoutSession | null) => prev ? ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          state: 'input' as const,
          timerRunning: false,
          canSkip: false,
          currentQuestion: undefined,
          actualReps: 0
        }) : null)
      } else {
        setSession((prev: WorkoutSession | null) => prev ? ({
          ...prev,
          state: 'complete' as const
        }) : null)
      }
    } else {
      setSession((prev: WorkoutSession | null) => prev ? ({
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input' as const,
        timerRunning: false,
        actualReps: 0,
        userAnswer: undefined,
        canSkip: false
      }) : null)
    }
  }

  const skipRest = () => {
    if (session?.canSkip) {
      moveToNextSet()
    }
  }

  const decreaseReps = () => {
    setSession(prev => prev ? { ...prev, actualReps: Math.max(0, prev.actualReps - 1) } : null)
  }

  const increaseReps = () => {
    setSession(prev => prev ? { ...prev, actualReps: prev.actualReps + 1 } : null)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Early return if session is not loaded
  if (!session) {
    return <div>Loading...</div>
  }

  if (session.state === 'complete') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Workout Complete! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Great job completing {workout.name}!
          </p>
          <Button onClick={onWorkoutComplete}>
            Finish Workout
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()
  const completedSets = session.currentSet - 1
  const repsCount = session.actualReps

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-center text-sm text-muted-foreground">
            Exercise {session.currentExerciseIndex + 1} of {workout.exercises.length}
          </div>
          <CardTitle className="text-center text-2xl">
            {currentExercise?.name}
          </CardTitle>
          <CardDescription className="text-center">
            Set {session.currentSet} of {currentExercise?.sets}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {session.state === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={decreaseReps}
                >
                  <CaretLeft size={20} />
                </Button>
                <div className="text-4xl font-bold w-20 text-center">
                  {repsCount}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={increaseReps}
                >
                  <CaretRight size={20} />
                </Button>
              </div>
              
              <Button 
                onClick={startRest}
                className="w-full"
                size="lg"
              >
                Complete Set
              </Button>
            </div>
          )}

          {session.state === 'rest' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(session.timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground">Rest Timer</div>
              </div>

              {/* Security Question */}
              {session.currentQuestion && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={20} />
                    <span className="font-semibold">Security Question</span>
                  </div>
                  <p className="mb-4">{session.currentQuestion.question}</p>
                  {session.currentQuestion.source && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Related to: {session.currentQuestion.source}
                    </p>
                  )}
                  {!session.userAnswer && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAnswer(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button 
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  )}
                  {feedback && (
                    <div className="text-center mt-3 font-medium text-sm">
                      <span className={
                        session.canSkip ? 'text-green-600' : 'text-orange-600'
                      }>
                        {feedback}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {session.canSkip && (
                <Button 
                  onClick={skipRest}
                  variant="default"
                  className="w-full"
                >
                  Next Set
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}      timeLeft: prev.initialTime,
      initialTime: 180,
      currentQuestion: question,
      canSkip: false
    }) : null)
  }

  const handleAnswer = (userAnswer: boolean) => {
    if (!session?.currentQuestion) return

    const isCorrect = userAnswer === session.currentQuestion.answer
    setFeedback(isCorrect ? 'Correct! 💪' : 'Wrong answer, redo the last set.')

    setSession(prev => prev ? ({
      ...prev,
      userAnswer,
      canSkip: isCorrect
    }) : null)

    if (session.currentQuestion) {
      setUsedQuestions(prev => [...(prev || []), session.currentQuestion!.id])
    }

    // Don't auto-clear on incorrect answers - let user see the feedback
    if (isCorrect) {
      setTimeout(() => {
        setFeedback('')
      }, 1500)
    }
  }

  const moveToNextSet = () => {
    if (!session) return

    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    if (session.currentSet >= currentExercise.sets) {
      // Move to next exercise
      if (session.currentExerciseIndex < workout.exercises.length - 1) {
        setSession((prev: WorkoutSession | null) => prev ? ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          state: 'input' as const,
          timerRunning: false,
          canSkip: false,
          currentQuestion: undefined,
          userAnswer: undefined,
          actualReps: 0
        }) : null)
      } else {
        setSession((prev: WorkoutSession | null) => prev ? ({
          ...prev,
          state: 'complete' as const
        }) : null)
      }
    } else {
      setSession((prev: WorkoutSession | null) => prev ? ({
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input' as const,
        timerRunning: false,
        actualReps: 0,
        userAnswer: undefined,
        canSkip: false,
        currentQuestion: undefined
      }) : null)
    }
    
    setFeedback('')
  }

  const skipRest = () => {
    if (session?.canSkip) {
      moveToNextSet()
    }
  }

  const decreaseReps = () => {
    setSession(prev => prev ? { ...prev, actualReps: Math.max(0, prev.actualReps - 1) } : null)
  }

  const increaseReps = () => {
    setSession(prev => prev ? { ...prev, actualReps: prev.actualReps + 1 } : null)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Early return if session is not loaded
  if (!session) {
    return <div>Loading...</div>
  }

  if (session.state === 'complete') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Workout Complete! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Great job completing {workout.name}!
          </p>
          <Button onClick={onWorkoutComplete}>
            Finish Workout
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()
  const completedSets = session.currentSet - 1
  const repsCount = session.actualReps

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-center text-sm text-muted-foreground">
            Exercise {session.currentExerciseIndex + 1} of {workout.exercises.length}
          </div>
          <CardTitle className="text-center text-2xl">
            {currentExercise?.name}
          </CardTitle>
          <CardDescription className="text-center">
            Set {session.currentSet} of {currentExercise?.sets}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {session.state === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={decreaseReps}
                >
                  <CaretLeft size={20} />
                </Button>
                <div className="text-4xl font-bold w-20 text-center">
                  {repsCount}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={increaseReps}
                >
                  <CaretRight size={20} />
                </Button>
              </div>
              
              <Button 
                onClick={startRest}
                className="w-full"
                size="lg"
              >
                Complete Set
              </Button>
            </div>
          )}

          {session.state === 'rest' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(session.timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground">Rest Timer</div>
              </div>

              {/* Security Question */}
              {session.currentQuestion && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={20} />
                    <span className="font-semibold">Security Question</span>
                  </div>
                  <p className="mb-4">{session.currentQuestion.question}</p>
                  {session.currentQuestion.source && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Related to: {session.currentQuestion.source}
                    </p>
                  )}
                  {session.userAnswer === undefined && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAnswer(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button 
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  )}
                  {feedback && (
                    <div className="text-center mt-3 font-medium text-sm">
                      <span className={
                        session.canSkip ? 'text-green-600' : 'text-red-600'
                      }>
                        {feedback}
                      </span>
                      {!session.canSkip && (
                        <div className="mt-2">
                          <Button 
                            onClick={() => {
                              setSession(prev => prev ? ({
                                ...prev,
                                state: 'input',
                                timerRunning: false,
                                userAnswer: undefined,
                                currentQuestion: undefined,
                                canSkip: false
                              }) : null)
                              setFeedback('')
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Redo Set
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {session.canSkip && (
                <Button 
                  onClick={skipRest}
                  variant="default"
                  className="w-full"
                >
                  Next Set
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}