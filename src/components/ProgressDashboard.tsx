import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendUp, Calendar, CheckCircle, Shield } from '@phosphor-icons/react'

interface WorkoutHistory {
  date: string
  workoutId: string
  exercises: {
    name: string
    sets: { reps: number; weight: number }[]
  }[]
}

export function ProgressDashboard() {
  const [workoutHistory] = useKV<WorkoutHistory[]>('workout-history', [])
  const [completedTips] = useKV<string[]>('completed-security-tips', [])

  const totalSecurityTips = 6 // From SecurityTipCard component
  const securityProgress = ((completedTips?.length || 0) / totalSecurityTips) * 100

  const getExerciseProgression = (exerciseName: string) => {
    if (!workoutHistory) return []
    
    return workoutHistory
      .filter(workout => workout.exercises.some(ex => ex.name === exerciseName))
      .map(workout => {
        const exercise = workout.exercises.find(ex => ex.name === exerciseName)
        const maxWeight = exercise?.sets.reduce((max, set) => Math.max(max, set.weight), 0) || 0
        return {
          date: new Date(workout.date).toLocaleDateString(),
          weight: maxWeight
        }
      })
      .slice(-5) // Last 5 workouts
  }

  const getRecentWorkouts = () => {
    if (!workoutHistory) return []
    return workoutHistory
      .slice(-5)
      .reverse()
      .map(workout => ({
        ...workout,
        date: new Date(workout.date).toLocaleDateString(),
        totalSets: workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)
      }))
  }

  const totalWorkouts = workoutHistory?.length || 0
  const recentWorkouts = getRecentWorkouts()

  const exercises = ['Squat', 'Bench Press', 'Deadlift', 'Press', 'Barbell Row']

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={20} />
              Workout Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Workouts</span>
                <Badge variant="secondary">{totalWorkouts}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span>{recentWorkouts.length}</span>
                </div>
                <Progress value={(recentWorkouts.length / 12) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Security Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tips Completed</span>
                <Badge variant="secondary">{completedTips?.length || 0} / {totalSecurityTips}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(securityProgress)}%</span>
                </div>
                <Progress value={securityProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            Exercise Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {exercises.map(exercise => {
              const progression = getExerciseProgression(exercise)
              const currentWeight = progression[progression.length - 1]?.weight || 0
              const previousWeight = progression[progression.length - 2]?.weight || 0
              const improvement = currentWeight - previousWeight

              return (
                <div key={exercise} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{exercise}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current: {currentWeight}lbs
                      {improvement > 0 && (
                        <span className="text-accent ml-2">
                          (+{improvement}lbs)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {progression.length} sessions
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {workout.workoutId === 'day-a' ? 'Workout A' : 'Workout B'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{workout.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{workout.totalSets} sets</Badge>
                    <CheckCircle size={16} className="text-accent" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No workouts completed yet</p>
              <p className="text-sm">Start your first workout to see progress here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}