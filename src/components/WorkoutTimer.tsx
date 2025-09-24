import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { SecurityTipCard } from '@/components/SecurityTipCard'
import { WorkoutDay } from '@/App'

interface WorkoutTimerProps {
  workout: WorkoutDay
  isActive: boolean
  onTimerStateChange: (active: boolean) => void
  onWorkoutComplete: () => void
}

export function WorkoutTimer({ workout, isActive, onTimerStateChange, onWorkoutComplete }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes default
  const [initialTime, setInitialTime] = useState(180)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setTimerRunning(false)
            onTimerStateChange(false)
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
            
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, timeLeft, onTimerStateChange])

  const startTimer = (duration: number = 180) => {
    setTimeLeft(duration)
    setInitialTime(duration)
    setTimerRunning(true)
    onTimerStateChange(true)
  }

  const pauseTimer = () => {
    setTimerRunning(false)
    onTimerStateChange(false)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimeLeft(initialTime)
    onTimerStateChange(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100

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
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                onClick={() => startTimer(180)}
                disabled={timerRunning}
                className="flex items-center gap-2"
              >
                <Play size={20} />
                3 min
              </Button>
              <Button
                size="lg"
                onClick={() => startTimer(300)}
                disabled={timerRunning}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Play size={20} />
                5 min
              </Button>
              {timerRunning ? (
                <Button
                  size="lg"
                  onClick={pauseTimer}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause size={20} />
                  Pause
                </Button>
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

      {(timerRunning || timeLeft < initialTime) && (
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