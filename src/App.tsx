import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkoutTimer } from '@/components/WorkoutTimer'
import { ExerciseLogger } from '@/components/ExerciseLogger'
import { ProgressDashboard } from '@/components/ProgressDashboard'
import { TrendUp, Timer, BookOpen, ArrowCounterClockwise } from '@phosphor-icons/react'

export interface Exercise {
  id: string
  name: string
  sets: number
  targetReps: string
  weight?: number
  completed: boolean
  completedSets: number
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: Exercise[]
}

export interface SecurityTip {
  id: string
  title: string
  content: string
  category: string
  completed: boolean
  quiz?: {
    question: string
    options: string[]
    correct: number
  }
}

const STARTING_STRENGTH_PROGRAMS: WorkoutDay[] = [
  {
    id: 'day-a',
    name: 'Workout A',
    exercises: [
      { id: 'squat-a', name: 'Squat', sets: 3, targetReps: '5', completed: false, completedSets: 0 },
      { id: 'press-a', name: 'Press', sets: 3, targetReps: '5', completed: false, completedSets: 0 },
      { id: 'deadlift-a', name: 'Deadlift', sets: 1, targetReps: '5', completed: false, completedSets: 0 }
    ]
  },
  {
    id: 'day-b',
    name: 'Workout B',
    exercises: [
      { id: 'squat-b', name: 'Squat', sets: 3, targetReps: '5', completed: false, completedSets: 0 },
      { id: 'bench-b', name: 'Bench Press', sets: 3, targetReps: '5', completed: false, completedSets: 0 },
      { id: 'row-b', name: 'Barbell Row', sets: 3, targetReps: '5', completed: false, completedSets: 0 }
    ]
  }
]

function App() {
  const [currentWorkout, setCurrentWorkout] = useKV<WorkoutDay | null>('current-workout', null)
  const [, , deleteWorkoutSession] = useKV<any>('workout-session', null)
  const [, , deleteUsedQuestions] = useKV<string[]>('used-security-questions', [])
  const [activeTab, setActiveTab] = useState('timer')

  const startWorkout = (workoutDay: WorkoutDay) => {
    const freshWorkout = {
      ...workoutDay,
      exercises: workoutDay.exercises.map(ex => ({ ...ex, completed: false, completedSets: 0, weight: undefined }))
    }
    setCurrentWorkout(freshWorkout)
    setActiveTab('timer')
  }

  const completeWorkout = () => {
    setCurrentWorkout(null)
    deleteWorkoutSession()
    setActiveTab('timer')
  }

  const resetProgress = () => {
    setCurrentWorkout(null)
    deleteWorkoutSession()
    deleteUsedQuestions()
    setActiveTab('timer')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">SecureStrength</h1>
          <p className="text-muted-foreground">Build strength and security knowledge</p>
        </header>

        {!currentWorkout ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Workout</CardTitle>
                <CardDescription>
                  Choose from Starting Strength program workouts
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {STARTING_STRENGTH_PROGRAMS.map((workout) => (
                  <Card 
                    key={workout.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => startWorkout(workout)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {workout.exercises.map((exercise) => (
                          <li key={exercise.id}>
                            {exercise.name} - {exercise.sets} × {exercise.targetReps}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-auto grid-cols-3">
                <TabsTrigger value="timer" className="flex items-center gap-2">
                  <Timer size={16} />
                  Timer
                </TabsTrigger>
                <TabsTrigger value="logger" className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Log Sets
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <TrendUp size={16} />
                  Progress
                </TabsTrigger>
              </TabsList>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetProgress}
                className="flex items-center gap-2"
              >
                <ArrowCounterClockwise size={16} />
                Reset
              </Button>
            </div>

            <TabsContent value="timer" className="mt-6">
              <WorkoutTimer 
                workout={currentWorkout}
                onWorkoutComplete={completeWorkout}
              />
            </TabsContent>

            <TabsContent value="logger" className="mt-6">
              <ExerciseLogger 
                workout={currentWorkout}
                onWorkoutUpdate={setCurrentWorkout}
                onWorkoutComplete={completeWorkout}
              />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <ProgressDashboard />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

export default App