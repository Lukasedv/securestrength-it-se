import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, Car
import { Progress } from '@/components/ui/progress'
import { WorkoutDay, Exercise } from '@/App'
import { Progress } from '@/components/ui/progress'
import { FastForward, CaretLeft, CaretRight, Shield } from '@phosphor-icons/react'
import { WorkoutDay, Exercise } from '@/App'

  id: string
  answer: boolean // 
  source?: string // CVE number
}

  {

    explanation: 'Yes - CV
  workoutId: string
    id: 'cve-2024-6387',
  currentSet: number
    source: 'CVE-2024
  timeLeft: number
    question: 'Did a 
    explanation: 'Yes -
  },
    id: 'cve-2023-34
 

  {
    question: 'C
    explanation: 'Yes - CV
  currentSet: 1,
    id: 'cve-2018
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
    explanation: 'Yes - CVE-2022-301
  },
    id: 'cve-2023-23397',
          
    source: 'CVE-2023-23397 (Outl
  {
    question: 'Do
    explanation: 'Yes - CVE-2022-47966 is a SAML processing vulnerability affecting multiple Zoho Ma
  },
    id: 'cve-2023-3519',
              
    source: 'CVE-2023-3519 (Citrix ADC cod
  {
    question: 
    explanation: 'Yes - CVE-2020-1472 "Zerolog
  },
    id: 'cve-2023-22515',
    answer: true,
    source: 'C
]
interface WorkoutSession {
  currentExerciseIndex: n
  state: WorkoutState
  initialTime: number
  canSkip: bo
  currentQue
  userAnswer?: boole

  workoutId: '',
  currentSet: 1,
  timeLeft: 1
  timerRunn
  actualRe
}
// Track used questi

function ge
  if (used
  }
  // 

  const randomInde
  
  use
  return selectedQuestion

  const [session, setSession] = useKV<WorkoutSession>('wor
  
  useEffect(() => {
      const newSession: 
        workoutId: work
      }
     
  }, [workout.id, session, setSession])

    if (session?.state === 'input') {
      if (exercise) {
        setRepsCount(targetReps)
   

  useEffect(() => {
    
      interval = setInterval(() => {

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
        {session.state === 'resting' && (
                <Label htmlFor="reps-input">How many reps did you complete?</Label>
                <Input
                  id="reps-input"
                  type="number"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                  placeholder={`Target: ${currentExercise.targetReps}`}
                  className="text-center text-lg"
                  min="0"
                Sk
              </div>
            {/* Securi
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
                  )}
                >
                  <FastForward size={20} />
                  Skip to Next Set
  )
              )}

          )}
        </CardContent>
      </Card>

      {session.state === 'resting' && (

          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
        />

    </div>

}