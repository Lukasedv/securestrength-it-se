import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Plus, Barbell } from '@phosphor-icons/react'
import { WorkoutDay, Exercise } from '@/App'

interface ExerciseLoggerProps {
  workout: WorkoutDay
  onWorkoutUpdate: (workout: WorkoutDay) => void
  onWorkoutComplete: () => void
}

interface WorkoutHistory {
  date: string
  workoutId: string
  exercises: {
    name: string
    sets: { reps: number; weight: number }[]
  }[]
}

export function ExerciseLogger({ workout, onWorkoutUpdate, onWorkoutComplete }: ExerciseLoggerProps) {
  const [workoutHistory, setWorkoutHistory] = useKV<WorkoutHistory[]>('workout-history', [])
  const [currentWeight, setCurrentWeight] = useState<Record<string, string>>({})
  const [currentReps, setCurrentReps] = useState<Record<string, string>>({})

  const updateExerciseWeight = (exerciseId: string, weight: string) => {
    setCurrentWeight(prev => ({ ...prev, [exerciseId]: weight }))
    
    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, weight: parseFloat(weight) || undefined } : ex
      )
    }
    onWorkoutUpdate(updatedWorkout)
  }

  const logSet = (exerciseId: string) => {
    const exercise = workout.exercises.find(ex => ex.id === exerciseId)
    if (!exercise) return

    const reps = parseInt(currentReps[exerciseId]) || parseInt(exercise.targetReps)
    const weight = parseFloat(currentWeight[exerciseId]) || exercise.weight || 0

    const updatedExercise = {
      ...exercise,
      completedSets: exercise.completedSets + 1,
      completed: exercise.completedSets + 1 >= exercise.sets,
      weight
    }

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map(ex => 
        ex.id === exerciseId ? updatedExercise : ex
      )
    }

    onWorkoutUpdate(updatedWorkout)
    
    // Clear current reps input for next set
    setCurrentReps(prev => ({ ...prev, [exerciseId]: '' }))
  }

  const completeWorkout = () => {
    // Save to workout history
    const historyEntry: WorkoutHistory = {
      date: new Date().toISOString(),
      workoutId: workout.id,
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        sets: Array(ex.completedSets).fill(null).map(() => ({
          reps: parseInt(ex.targetReps),
          weight: ex.weight || 0
        }))
      }))
    }

    setWorkoutHistory(current => [...(current || []), historyEntry])
    onWorkoutComplete()
  }

  const getLastWorkoutWeight = (exerciseName: string): number | undefined => {
    if (!workoutHistory) return undefined
    
    const lastWorkout = [...workoutHistory]
      .reverse()
      .find(w => w.exercises.some(ex => ex.name === exerciseName))
    
    if (!lastWorkout) return undefined
    
    const exercise = lastWorkout.exercises.find(ex => ex.name === exerciseName)
    return exercise?.sets[0]?.weight
  }

  const allExercisesCompleted = workout.exercises.every(ex => ex.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barbell size={20} />
            {workout.name} - Exercise Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {workout.exercises.map((exercise) => {
              const lastWeight = getLastWorkoutWeight(exercise.name)
              const isActive = !exercise.completed && workout.exercises.filter(ex => !ex.completed)[0]?.id === exercise.id
              
              return (
                <Card key={exercise.id} className={`${isActive ? 'border-primary' : ''} ${exercise.completed ? 'bg-muted/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {exercise.name}
                        {exercise.completed && <CheckCircle size={18} className="text-accent" />}
                      </CardTitle>
                      <Badge variant={exercise.completed ? "default" : "secondary"}>
                        {exercise.completedSets} / {exercise.sets} sets
                      </Badge>
                    </div>
                    {lastWeight && (
                      <p className="text-sm text-muted-foreground">
                        Last workout: {lastWeight}lbs
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`weight-${exercise.id}`}>Weight (lbs)</Label>
                        <Input
                          id={`weight-${exercise.id}`}
                          type="number"
                          placeholder={lastWeight ? lastWeight.toString() : "135"}
                          value={currentWeight[exercise.id] || exercise.weight?.toString() || ''}
                          onChange={(e) => updateExerciseWeight(exercise.id, e.target.value)}
                          disabled={exercise.completed}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                        <Input
                          id={`reps-${exercise.id}`}
                          type="number"
                          placeholder={exercise.targetReps}
                          value={currentReps[exercise.id] || ''}
                          onChange={(e) => setCurrentReps(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                          disabled={exercise.completed}
                        />
                      </div>
                    </div>

                    {exercise.completedSets < exercise.sets && (
                      <Button
                        onClick={() => logSet(exercise.id)}
                        disabled={!currentWeight[exercise.id] && !exercise.weight}
                        className="w-full"
                      >
                        <Plus size={16} className="mr-2" />
                        Log Set {exercise.completedSets + 1}
                      </Button>
                    )}

                    {exercise.completedSets > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>Completed sets:</p>
                        <div className="flex gap-2 mt-1">
                          {Array(exercise.completedSets).fill(null).map((_, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              Set {index + 1}: {exercise.targetReps} @ {exercise.weight || 0}lbs
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {allExercisesCompleted && (
        <Card className="border-accent bg-accent/5">
          <CardContent className="pt-6 text-center">
            <CheckCircle size={48} className="mx-auto text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Exercises Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Great workout! Your progress has been logged.
            </p>
            <Button onClick={completeWorkout} size="lg" className="w-full">
              Finish Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}