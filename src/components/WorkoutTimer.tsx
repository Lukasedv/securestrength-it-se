import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, ArrowCounterClockwise, FastForward } from '@phosphor-icons/react'
import { SecurityTipCard } from '@/components/SecurityTipCard'
import { WorkoutDay } from '@/App'

interface WorkoutTimerProps {
  workout: WorkoutDay
  isActive: boolean
  onTimerStateChange: (active: boolean) => void
  onWorkoutComplete: () => void
}

interface TimerState {
  timeLeft: number
  initialTime: number
  timerRunning: boolean
  workoutId: string
}

export function WorkoutTimer({ workout, isActive, onTimerStateChange, onWorkoutComplete }: WorkoutTimerProps) {
  const [timerState, setTimerState] = useKV<TimerState | null>('timer-state', null)
  
  // Initialize timer state if it doesn't exist or is for a different workout
  const currentState = timerState?.workoutId === workout.id ? timerState : {
    timeLeft: 180,
    initialTime: 180,
    timerRunning: false,
    workoutId: workout.id
  }

  // Initialize timer state for new workout
  useEffect(() => {
    if (!timerState || timerState.workoutId !== workout.id) {
      const newState = {
        timeLeft: 180,
        initialTime: 180,
        timerRunning: false,
        workoutId: workout.id
      }
      setTimerState(newState)
    }
  }, [workout.id, timerState, setTimerState])

  // Sync timer state with parent component whenever timer running state changes
  useEffect(() => {
    if (timerState?.workoutId === workout.id) {
      onTimerStateChange(timerState.timerRunning)
    }
  }, [timerState?.timerRunning, timerState?.workoutId, workout.id, onTimerStateChange])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerState?.workoutId === workout.id && timerState.timerRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState((prevState): TimerState | null => {
          if (!prevState || prevState.workoutId !== workout.id) return prevState || null
          
          const newTimeLeft = prevState.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Play completion sound (simple beep)
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
            
            return {
              ...prevState,
              timeLeft: 0,
              timerRunning: false
            }
          }
          
          return {
            ...prevState,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState?.timerRunning, timerState?.timeLeft, timerState?.workoutId, workout.id, setTimerState])

  const startTimer = (duration: number = 180) => {
    setTimerState({
      timeLeft: duration,
      initialTime: duration,
      timerRunning: true,
      workoutId: workout.id
    })
  }

  const pauseTimer = () => {
    setTimerState((prev) => prev ? { ...prev, timerRunning: false } : null)
  }

  const resetTimer = () => {
    setTimerState((prev) => prev ? { 
      ...prev, 
      timerRunning: false, 
      timeLeft: prev.initialTime 
    } : null)
  }

  const skipTimer = () => {
    setTimerState((prev) => prev ? { 
      ...prev, 
      timerRunning: false, 
      timeLeft: 0 
    } : null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current timer state, falling back to defaults
  const displayState = timerState?.workoutId === workout.id ? timerState : currentState
  const progress = displayState.initialTime > 0 ? ((displayState.initialTime - displayState.timeLeft) / displayState.initialTime) * 100 : 0

  const currentExercise = workout.exercises.find(ex => !ex.completed)
  const completedExercises = workout.exercises.filter(ex => ex.completed).length
  const totalExercises = workout.exercises.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{workout.name}</CardTitle>
          <div className="text-center text-sm text-muted-foreground">
            {completedExercises} / {totalExercises} exercises completed
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {currentExercise && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{currentExercise.name}</h3>
              <p className="text-muted-foreground">
                Set {currentExercise.completedSets + 1} of {currentExercise.sets} × {currentExercise.targetReps} reps
                {currentExercise.weight && ` @ ${currentExercise.weight}lbs`}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-6xl font-bold tabular-nums text-primary">
              {formatTime(displayState.timeLeft)}
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                size="lg"
                onClick={() => startTimer(180)}
                disabled={displayState.timerRunning}
                className="flex items-center gap-2"
              >
                <Play size={20} />
                3 min
              </Button>
              <Button
                size="lg"
                onClick={() => startTimer(300)}
                disabled={displayState.timerRunning}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Play size={20} />
                5 min
              </Button>
              {displayState.timerRunning ? (
                <>
                  <Button
                    size="lg"
                    onClick={pauseTimer}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Pause size={20} />
                    Pause
                  </Button>
                  <Button
                    size="lg"
                    onClick={skipTimer}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <FastForward size={20} />
                    Skip
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={resetTimer}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowCounterClockwise size={20} />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(displayState.timerRunning || displayState.timeLeft < displayState.initialTime) && (
        <SecurityTipCard />
      )}

      {completedExercises === totalExercises && (
        <Card className="border-accent">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold text-accent mb-2">Workout Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Great job finishing {workout.name}. Time to log your progress.
            </p>
            <Button onClick={onWorkoutComplete} className="w-full">
              Finish Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}