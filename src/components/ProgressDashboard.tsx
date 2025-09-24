import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { TrendUp, Calendar, CheckCircle, Shield, Database, Warning } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

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
  const [backendProgress, setBackendProgress] = useState<any[]>([])
  const [loadingBackend, setLoadingBackend] = useState(false)
  const [showBackendData, setShowBackendData] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  const API_BASE = 'http://localhost:3001'

  const fetchBackendProgress = async () => {
    setLoadingBackend(true)
    setBackendError(null)
    try {
      const response = await fetch(`${API_BASE}/api/progress/history`)
      const data = await response.json()
      setBackendProgress(data.progress || [])
    } catch (error) {
      console.error('Error fetching backend progress:', error)
      setBackendError('Failed to connect to backend database')
    } finally {
      setLoadingBackend(false)
    }
  }

  // Auto-fetch on component mount
  useEffect(() => {
    fetchBackendProgress()
  }, [])

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

      {/* Backend Database Progress - SQL Injection Demo */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Backend Database Progress
            <Badge variant="outline" className="text-xs">SQL Demo</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchBackendProgress}
              disabled={loadingBackend}
            >
              {loadingBackend ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button
              size="sm"
              variant={showBackendData ? "default" : "outline"}
              onClick={() => setShowBackendData(!showBackendData)}
            >
              {showBackendData ? 'Hide' : 'Show'} Database Entries
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backendError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <Warning size={16} className="text-red-600" />
              <span className="text-sm text-red-800">{backendError}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{backendProgress.length}</div>
              <div className="text-sm text-muted-foreground">Database Entries</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {new Set(backendProgress.map(p => p.exercise_name)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Exercises</div>
            </div>
          </div>

          {showBackendData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Recent Database Entries</h4>
                <Badge variant="outline" className="text-xs">
                  {backendProgress.length} total entries
                </Badge>
              </div>
              
              {backendProgress.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backendProgress.slice(0, 10).map((entry, index) => (
                    <div key={entry.id} className="p-3 border rounded-lg bg-orange-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.exercise_name}</span>
                            <Badge variant="outline" className="text-xs">
                              ID: {entry.id}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.reps} reps @ {entry.weight}lbs
                          </div>
                          {entry.notes && (
                            <div className="text-sm mt-1 p-2 bg-gray-100 rounded border">
                              <strong>Notes:</strong> <code className="text-xs">{entry.notes}</code>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{new Date(entry.created_at).toLocaleDateString()}</div>
                          <div>{new Date(entry.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Database size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No database entries yet</p>
                  <p className="text-sm">Use the "Log to Database" feature to see entries here</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}