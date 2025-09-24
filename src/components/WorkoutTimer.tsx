import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FastForward, CaretLeft, CaretRight, Shield } from '@phosphor-icons/react'
import { WorkoutDay, Exercise } from '@/App'

interface WorkoutTimerProps {
  workout: WorkoutDay
  onWorkoutComplete: () => void
}

type WorkoutState = 'input' | 'resting' | 'complete'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean // true = Yes, false = No
  explanation: string
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'password-reuse',
    question: 'Is it safe to use the same password for multiple accounts?',
    answer: false,
    explanation: 'No - Using the same password across multiple accounts creates a single point of failure.'
  },
  {
    id: 'public-wifi-banking',
    question: 'Should you do online banking on public Wi-Fi?',
    answer: false,
    explanation: 'No - Public Wi-Fi networks are often unsecured and can be monitored by attackers.'
  },
  {
    id: 'software-updates',
    question: 'Are software updates important for security?',
    answer: true,
    explanation: 'Yes - Updates often include critical security patches that fix vulnerabilities.'
  },
  {
    id: 'email-links',
    question: 'Should you click links in emails from unknown senders?',
    answer: false,
    explanation: 'No - Links from unknown senders could lead to malicious websites or downloads.'
  },
  {
    id: 'two-factor-auth',
    question: 'Does two-factor authentication make your accounts more secure?',
    answer: true,
    explanation: 'Yes - 2FA adds an extra layer of security beyond just passwords.'
  },
  {
    id: 'usb-devices',
    question: 'Is it safe to plug in USB drives you find lying around?',
    answer: false,
    explanation: 'No - Unknown USB devices could contain malware or be part of a social engineering attack.'
  },
  {
    id: 'backup-importance',
    question: 'Are regular backups important for data security?',
    answer: true,
    explanation: 'Yes - Backups protect against data loss from ransomware, hardware failure, or accidents.'
  },
  {
    id: 'social-media-info',
    question: 'Should you share personal information like your address on social media?',
    answer: false,
    explanation: 'No - Personal information on social media can be used by attackers for identity theft or social engineering.'
  }
]

interface WorkoutSession {
  workoutId: string
  currentExerciseIndex: number
  currentSet: number
  state: WorkoutState
  timeLeft: number
  initialTime: number
  timerRunning: boolean
  canSkip: boolean
  actualReps: number
  currentQuestion?: SecurityQuestion
  showQuizResult: boolean
  userAnswer?: boolean
}

const DEFAULT_SESSION: WorkoutSession = {
  workoutId: '',
  currentExerciseIndex: 0,
  currentSet: 1,
  state: 'input',
  timeLeft: 180,
  initialTime: 180,
  timerRunning: false,
  canSkip: false,
  actualReps: 0,
  showQuizResult: false
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession>('workout-session', DEFAULT_SESSION)
  const [repsCount, setRepsCount] = useState(0)
  
  // Reset session if workout changed
  useEffect(() => {
    if (session && session.workoutId !== workout.id) {
      const newSession = {
        ...DEFAULT_SESSION,
        workoutId: workout.id
      }
      setSession(newSession)
      setRepsCount(0)
    }
  }, [workout.id, session, setSession])

  // Initialize reps count based on current exercise
  useEffect(() => {
    const exercise = getCurrentExercise()
    if (exercise && session?.state === 'input') {
      const targetReps = parseInt(exercise.targetReps) || 5
      setRepsCount(targetReps)
    }
  }, [session?.currentExerciseIndex, session?.state])

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (session && session.timerRunning && session.timeLeft > 0) {
      interval = setInterval(() => {
        setSession((prev: WorkoutSession) => {
          const newTimeLeft = prev.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Play completion sound
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.value = 800
              oscillator.type = 'sine'
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
              
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 1)
            } catch (e) {
              // Fallback if audio context fails
              console.log('Timer completed!')
            }
            
            return {
              ...prev,
              timeLeft: 0,
              timerRunning: false
            }
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session?.timerRunning, session?.timeLeft, setSession])

  // Handle timer completion (when it naturally reaches 0)
  useEffect(() => {
    if (session && session.state === 'resting' && session.timeLeft === 0 && !session.timerRunning) {
      setTimeout(() => {
        moveToNextSet()
      }, 1000) // Small delay after timer completion
    }
  }, [session?.state, session?.timeLeft, session?.timerRunning])

  const getCurrentExercise = (): Exercise | null => {
    if (!session) return null
    return workout.exercises[session.currentExerciseIndex] || null
  }

  const getRandomQuestion = () => {
    return SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
  }

  const handleSetDone = () => {
    if (repsCount <= 0 || !session) return

    const question = getRandomQuestion()
    setSession((prev: WorkoutSession) => ({
      ...prev,
      actualReps: repsCount,
      state: 'resting',
      timerRunning: true,
      timeLeft: 180,
      initialTime: 180,
      canSkip: false,
      currentQuestion: question,
      showQuizResult: false
    }))
  }

  const handleQuizAnswer = (answer: boolean) => {
    if (!session?.currentQuestion) return
    
    const isCorrect = answer === session.currentQuestion.answer
    setSession((prev: WorkoutSession) => ({
      ...prev,
      userAnswer: answer,
      showQuizResult: true,
      canSkip: isCorrect
    }))

    if (!isCorrect) {
      // Wrong answer - user must redo the set after showing explanation
      setTimeout(() => {
        setSession((prev: WorkoutSession) => ({
          ...prev,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0,
          showQuizResult: false,
          currentQuestion: undefined,
          userAnswer: undefined
        }))
        const exercise = getCurrentExercise()
        if (exercise) {
          setRepsCount(parseInt(exercise.targetReps) || 5)
        }
      }, 3000) // Show result for 3 seconds
    }
  }

  const handleSkipToNextSet = () => {
    moveToNextSet()
  }

  const moveToNextSet = () => {
    if (!session) return
    
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    // Check if this was the last set of the current exercise
    if (session.currentSet >= currentExercise.sets) {
      // Move to next exercise
      if (session.currentExerciseIndex >= workout.exercises.length - 1) {
        // Workout complete
        setSession((prev: WorkoutSession) => ({
          ...prev,
          state: 'complete'
        }))
      } else {
        // Move to next exercise
        const nextExercise = workout.exercises[session.currentExerciseIndex + 1]
        setSession((prev: WorkoutSession) => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0,
          showQuizResult: false,
          currentQuestion: undefined,
          userAnswer: undefined
        }))
        setRepsCount(parseInt(nextExercise.targetReps) || 5)
      }
    } else {
      // Move to next set of same exercise
      setSession((prev: WorkoutSession) => ({
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input',
        timerRunning: false,
        canSkip: false,
        actualReps: 0,
        showQuizResult: false,
        currentQuestion: undefined,
        userAnswer: undefined
      }))
      setRepsCount(parseInt(currentExercise.targetReps) || 5)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const adjustReps = (delta: number) => {
    setRepsCount(prev => Math.max(0, prev + delta))
  }

  // Early return if session is not loaded
  if (!session) {
    return <div>Loading...</div>
  }

  const currentExercise = getCurrentExercise()
  
  if (!currentExercise || session.state === 'complete') {
    return (
      <Card className="border-accent">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-semibold text-accent mb-2">Workout Complete!</h3>
          <p className="text-muted-foreground mb-4">
            Great job finishing {workout.name}!
          </p>
          <Button onClick={onWorkoutComplete} className="w-full">
            Finish Workout
          </Button>
        </CardContent>
      </Card>
    )
  }

  const progress = session.timerRunning ? ((session.initialTime - session.timeLeft) / session.initialTime) * 100 : 0
  const completedSets = (session.currentExerciseIndex * workout.exercises.reduce((sum, ex) => sum + ex.sets, 0) / workout.exercises.length) + (session.currentSet - 1)
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{workout.name}</CardTitle>
        <div className="text-center text-sm text-muted-foreground">
          Set {Math.floor(completedSets) + 1} of {totalSets}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">{currentExercise.name}</h3>
          <p className="text-muted-foreground">
            Set {session.currentSet} of {currentExercise.sets} × {currentExercise.targetReps} reps
          </p>
        </div>

        {session.state === 'input' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-center text-sm font-medium">How many reps did you complete?</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustReps(-1)}
                  disabled={repsCount <= 0}
                  className="h-12 w-12 p-0"
                >
                  <CaretLeft size={20} />
                </Button>
                <div className="text-3xl font-bold tabular-nums text-primary min-w-[60px] text-center">
                  {repsCount}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustReps(1)}
                  className="h-12 w-12 p-0"
                >
                  <CaretRight size={20} />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSetDone}
              disabled={repsCount <= 0}
              className="w-full"
              size="lg"
            >
              Set Done
            </Button>
          </div>
        )}

        {session.state === 'resting' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold tabular-nums text-primary">
                {formatTime(session.timeLeft)}
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Rest time - You did {session.actualReps} reps
              </p>
            </div>

            {session.canSkip && (
              <Button 
                onClick={handleSkipToNextSet}
                variant="outline"
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <FastForward size={20} />
                Skip to Next Set
              </Button>
            )}

            {/* Security Quiz integrated into the same card */}
            {session.currentQuestion && (
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Shield size={20} className="text-primary" />
                    Security Quiz
                  </div>
                  
                  {!session.showQuizResult ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{session.currentQuestion.question}</p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleQuizAnswer(true)}
                          className="flex-1"
                          size="lg"
                        >
                          Yes
                        </Button>
                        <Button 
                          onClick={() => handleQuizAnswer(false)}
                          variant="outline"
                          className="flex-1"
                          size="lg"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <div className={`p-4 rounded-md ${
                        session.canSkip ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                      }`}>
                        <div className="text-lg font-semibold mb-2">
                          {session.canSkip ? '✅ Correct!' : '❌ Wrong answer, redo the last set.'}
                        </div>
                        <p className="text-sm">{session.currentQuestion.explanation}</p>
                      </div>
                      {session.canSkip && (
                        <p className="text-sm text-muted-foreground">
                          You can now skip to the next set or wait for the rest timer to finish.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}