import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaretLeft, CaretRight, Shield, Quest

  id: string
  answer: boolean

const SECURITY_QUESTIONS: Se
    id: 'cve
    answer: true,
  },
    id: 'cve-202
 

    id: 'cve-2021-26855',
   
  },
    id: 'cve-2022-22965',
    answer: true,
  },
    
   
  },
    id: 'cve-2022-30190',
    answer: true,
  }

  w
  currentSet: number
  timeLeft: number
  timerRunning: b
  userAnswer?: boolean
}
int
  onWorkoutComplete: () =

  currentExercise
  state: 'input',
  ac
  c

  const [session, setSession] = useKV<WorkoutSession | null>('workout-session', null
  const [feedback
  const getRandomQuestion = (): SecurityQuestion =
    
   
    }
  }
  const getCurren
    return workout.exercises[session.c

 


  useEffect(() => {
      const currentExerci
        ...DEFAULT_S
        actualReps: parseInt(currentEx
    }

  useEffect(() => {
      const interval = setInterval((
      }, 1000)
  canSkip: boolean
}

interface WorkoutTimerProps {
  workout: any
  onWorkoutComplete: () => void
}

const DEFAULT_SESSION: Omit<WorkoutSession, 'workoutId'> = {
  currentExercise: 0,
  currentSet: 0,
  state: 'input',
  timeLeft: 180,
  actualReps: 0,
  timerRunning: false,
  canSkip: false
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession | null>('workout-session', null)
  const [usedQuestions, setUsedQuestions] = useKV<string[]>('used-security-questions', [])
  const [feedback, setFeedback] = useState('')

  const getRandomQuestion = (): SecurityQuestion => {
    const usedIds = usedQuestions || []
    const availableQuestions = SECURITY_QUESTIONS.filter(q => !usedIds.includes(q.id))
    if (availableQuestions.length === 0) {
      setUsedQuestions([])
      return SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
    }
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
  }

  const getCurrentExercise = () => {
    if (!session) return null
    return workout.exercises[session.currentExercise]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize session
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      const currentExercise = workout.exercises[0]
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id,
        actualReps: parseInt(currentExercise?.targetReps || '0', 10) || 0
      })
    }
  }, [workout.id, session, setSession])

  // Timer countdown
  useEffect(() => {
    if (session?.timerRunning && session.timeLeft > 0) {
      const interval = setInterval(() => {
        setSession(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null)
      }, 1000)
      return () => clearInterval(interval)
    }
          timeLeft: 180,

          userAnswer: undefined,
        } : null)
   

        currentSet: prev.cu
        timeLeft: 180,
        timerRunning: false,
        userAn
      } : null)
  }
  if (!session) {
      <Card>
          <CardTitle>Loading
      </Card>
  }
  if (session.state
   

  const handleAnswerQuestion = (userAnswer: boolean) => {
          <Button onClick={onWorkoutCompl

    const isCorrect = userAnswer === session.currentQuestion.answer
    setSession(prev => prev ? { ...prev, userAnswer } : null)
  const currentExercise = getCurrentExercise()

    <Card>
        <div className="flex items-center justify-between">
            Exercise {session.currentExercise + 1} of {workout.ex
          <B
      setFeedback(`❌ Wrong answer, redo the last set.`)
      // Reset to input state to redo the set
      setTimeout(() => {
        setSession(prev => prev ? {
          ...prev,
          state: 'input',
          actualReps: parseInt(getCurrentExercise()?.targetReps || '0', 10) || 0,
          timerRunning: false,
          currentQuestion: undefined,
          userAnswer: undefined,
          canSkip: false
        } : null)
        setFeedback('')
      }, 2000)
     
   

                type="numb
                onChange={(e) => handleRe
                placehold

                variant="outline"
                onClick={() => handleRepsChange(1)
                <CaretRight />
            </div>
            <B
              onClick={startRest}
            >
            </Button>
        )}
        {session.state ==
            <div classNa
                {formatT
              <p className="te

              <div className="bg
                  <Shiel
                <
       
            
                  </div>
                  {session.userAn
                
                        variant="outline
                       
                      
                      
                        vari
                        className="
                        False
                    </
               
     
   

                 
            
            
              </div>

              variant
             
     
   

    </Card>
}













































                type="number"
                value={session.actualReps}
                onChange={(e) => handleRepsChange(Number(e.target.value) - session.actualReps)}
                className="w-20 text-center text-lg"
                placeholder="0"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRepsChange(1)}
              >
                <CaretRight />
              </Button>
            </div>
            
            <Button 
              className="w-full"
              onClick={startRest}
              disabled={session.actualReps <= 0}
            >
              Complete Set - Start Rest
            </Button>
          </div>
        )}

        {session.state === 'rest' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {formatTime(session.timeLeft)}
              </div>
              <p className="text-muted-foreground">Rest time remaining</p>
            </div>

            {session.currentQuestion && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Security Knowledge Check
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Question className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm">{session.currentQuestion.question}</p>
                  </div>
                  
                  {session.userAnswer === undefined ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnswerQuestion(true)}
                        className="flex-1"
                      >
                        True
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnswerQuestion(false)}
                        className="flex-1"
                      >
                        False
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className={`font-medium ${feedback.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              variant="default"
              className="w-full"
              onClick={skipRest}
              disabled={!session.canSkip && session.timeLeft > 0}
            >
              {session.canSkip || session.timeLeft === 0 ? 'Continue to Next Set' : `Wait ${formatTime(session.timeLeft)}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}