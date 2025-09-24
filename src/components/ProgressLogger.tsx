import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Database, Warning } from '@phosphor-icons/react'

interface ProgressLogEntry {
  workoutId: string
  exerciseName: string
  reps: number
  weight: number
  notes: string
}

interface ProgressLoggerProps {
  workoutId: string
  exerciseName: string
  defaultReps?: number
  defaultWeight?: number
  onLogSuccess?: (result: any) => void
  className?: string
}

const API_BASE = 'http://localhost:3001'

export function ProgressLogger({ 
  workoutId, 
  exerciseName, 
  defaultReps = 5, 
  defaultWeight = 135,
  onLogSuccess,
  className = ""
}: ProgressLoggerProps) {
  const [reps, setReps] = useState(defaultReps.toString())
  const [weight, setWeight] = useState(defaultWeight.toString())
  const [notes, setNotes] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [showVulnerabilityHint, setShowVulnerabilityHint] = useState(false)

  const logProgress = async () => {
    setIsLogging(true)
    setLastResult(null)

    const entry: ProgressLogEntry = {
      workoutId,
      exerciseName,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0,
      notes: notes || ''
    }

    try {
      const response = await fetch(`${API_BASE}/api/progress/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      })

      const result = await response.json()
      setLastResult(result)
      
      if (result.success && onLogSuccess) {
        onLogSuccess(result)
      }

      // Clear form on success
      if (result.success) {
        setNotes('')
      }

    } catch (error) {
      console.error('Error logging progress:', error)
      setLastResult({ 
        error: 'Network error', 
        message: 'Failed to connect to backend server' 
      })
    } finally {
      setIsLogging(false)
    }
  }

  const tryExamplePayloads = [
    "Great set! Felt strong today.",
    "'); SELECT username, password FROM users; --",
    "test'; DROP TABLE workout_progress; --",
    "admin' UNION SELECT id, username, password, email FROM users; --"
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          Log Workout Progress
        </CardTitle>
        <CardDescription>
          Record your set with custom notes (connects to backend database)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercise Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="exercise">Exercise</Label>
            <Input 
              id="exercise" 
              value={exerciseName} 
              disabled 
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="reps">Reps</Label>
            <Input 
              id="reps" 
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input 
              id="weight" 
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        {/* Notes Section - This is where SQL injection happens */}
        <div>
          <Label htmlFor="notes" className="flex items-center gap-2">
            Notes & Comments
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVulnerabilityHint(!showVulnerabilityHint)}
              className="h-6 px-2 text-xs"
            >
              <Warning size={12} />
              Security Demo
            </Button>
          </Label>
          <Textarea
            id="notes"
            placeholder="Add notes about your set (e.g., how it felt, RPE, form notes)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Vulnerability Hint Panel */}
        {showVulnerabilityHint && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-800">
                🔓 SQL Injection Demo - Try These Payloads:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tryExamplePayloads.map((payload, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setNotes(payload)}
                    className="text-xs h-7 px-2"
                  >
                    Try #{index + 1}
                  </Button>
                  <code className="text-xs bg-orange-100 px-2 py-1 rounded">
                    {payload.length > 50 ? `${payload.substring(0, 50)}...` : payload}
                  </code>
                </div>
              ))}
              <p className="text-xs text-orange-700 mt-2">
                ⚠️ This demonstrates SQL injection vulnerabilities in string concatenation. 
                Check server logs and database contents after testing.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Log Button */}
        <Button 
          onClick={logProgress} 
          disabled={isLogging || !reps || !weight}
          className="w-full"
        >
          {isLogging ? 'Logging...' : 'Log Progress to Database'}
        </Button>

        {/* Result Display */}
        {lastResult && (
          <Card className={lastResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                {lastResult.success ? (
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                ) : (
                  <Warning size={16} className="text-red-600 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className={`text-sm ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {lastResult.message || lastResult.error}
                  </p>
                  
                  {lastResult.executedQuery && (
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">Executed SQL:</Badge>
                      <code className="text-xs block bg-gray-100 p-2 rounded overflow-x-auto">
                        {lastResult.executedQuery}
                      </code>
                    </div>
                  )}

                  {lastResult.success && (
                    <p className="text-xs text-green-600">
                      Entry ID: {lastResult.id} • Workout: {workoutId} • Exercise: {exerciseName}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}