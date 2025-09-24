import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { FastForward } from '@phosphor-icons/react'
import { SecurityQuiz } from '@/components/SecurityQuiz'
import { WorkoutDay, Exercise } from '@/App'

interface WorkoutTimerProps {
  workout: WorkoutDay
  onWorkoutComplete: () => void
}

type WorkoutState = 'input' | 'resting' | 'complete'

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
  actualReps: 0
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession>('workout-session', DEFAULT_SESSION)
  const [repsInput, setRepsInput] = useState('')
  
  // Reset session if workout changed
  useEffect(() => {
    if (session && session.workoutId !== workout.id) {
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id
      })
      setRepsInput('')
    }
  }, [workout.id, session, setSession])

  // Sync timer state with parent
  useEffect(() => {
    // Timer state syncing is handled internally now
  }, [])

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

  const handleSetDone = () => {
    const reps = parseInt(repsInput) || 0
    if (reps <= 0 || !session) return

    setSession((prev: WorkoutSession) => ({
      ...prev,
      actualReps: reps,
      state: 'resting',
      timerRunning: true,
      timeLeft: 180,
      initialTime: 180,
      canSkip: false
    }))
    setRepsInput('')
  }

  const handleCorrectAnswer = () => {
    if (!session) return
    setSession((prev: WorkoutSession) => ({
      ...prev,
      canSkip: true
    }))
  }

  const handleWrongAnswer = () => {
    if (!session) return
    // Wrong answer - user must redo the set
    setSession((prev: WorkoutSession) => ({
      ...prev,
      state: 'input',
      timerRunning: false,
      canSkip: false,
      actualReps: 0
    }))
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
        setSession((prev: WorkoutSession) => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0
        }))
      }
    } else {
      // Move to next set of same exercise
      setSession((prev: WorkoutSession) => ({
        ...prev,
        currentSet: prev.currentSet + 1,
        state: 'input',
        timerRunning: false,
        canSkip: false,
        actualReps: 0
      }))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
    <div className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="reps-input">How many reps did you complete?</Label>
                <Input
                  id="reps-input"
                  type="number"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                  placeholder={`Target: ${currentExercise.targetReps}`}
                  className="text-center text-lg"
                  min="0"
                />
              </div>
              <Button 
                onClick={handleSetDone}
                disabled={!repsInput || parseInt(repsInput) <= 0}
                className="w-full"
                size="lg"
              >
                Set Done
              </Button>
            </div>
          )}

          {session.state === 'resting' && (
            <div className="space-y-4">
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
            </div>
          )}
        </CardContent>
      </Card>

      {session.state === 'resting' && (
        <SecurityQuiz 
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
        />
      )}
    </div>
  )
}