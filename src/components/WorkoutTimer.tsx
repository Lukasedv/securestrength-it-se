import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WorkoutDay, Exercise } from '@/App'
import { FastForward, CaretLeft, CaretRight, Shield, CheckCircle, XCircle } from '@phosphor-icons/react'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean
  source?: string
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'cve-2024-3400',
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
    source: 'CVE-2024-3400 (PAN-OS GlobalProtect RCE)'
  },
  {
    id: 'cve-2024-6387',
    question: 'Is this an sshd race condition that can lead to remote code execution on many Linux systems?',
    answer: true,
    source: 'CVE-2024-6387 (OpenSSH "regreSSHion")'
  },
  {
    id: 'cve-2024-3094',
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    answer: true,
    source: 'CVE-2024-3094 (XZ Utils backdoor)'
  },
  {
    id: 'cve-2023-34362',
    question: 'Was this SQL injection widely exploited to drop web shells at scale?',
    answer: true,
    source: 'CVE-2023-34362 (MOVEit Transfer SQLi)'
  },
  {
    id: 'cve-2023-4966',
    question: 'Can session tokens be stolen and reused to hijack valid sessions?',
    answer: true,
    source: 'CVE-2023-4966 (Citrix/NetScaler "Bleed")'
  },
  {
    id: 'cve-2018-13379',
    question: 'Is this an old path-traversal bug that attackers still use for initial access?',
    answer: true,
    source: 'CVE-2018-13379 (Fortinet FortiOS SSL-VPN)'
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
    source: 'CVE-2021-44228 (Log4Shell)'
  },
  {
    id: 'cve-2021-34527',
    question: 'Can Windows Print Spooler lead to local privilege escalation or RCE?',
    answer: true,
    source: 'CVE-2021-34527 (PrintNightmare)'
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange?',
    answer: true,
    source: 'CVE-2021-26855 (Exchange ProxyLogon)'
  },
  {
    id: 'cve-2021-34473',
    question: 'Is this part of a chain that enables unauthenticated remote code execution on Exchange?',
    answer: true,
    source: 'CVE-2021-34473 (Exchange ProxyShell)'
  },
  {
    id: 'cve-2022-22965',
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data binding?',
    answer: true,
    source: 'CVE-2022-22965 (Spring4Shell)'
  },
  {
    id: 'cve-2022-26134',
    question: 'Does an OGNL injection allow unauthenticated RCE on Confluence Server/Data Center?',
    answer: true,
    source: 'CVE-2022-26134 (Confluence OGNL RCE)'
  },
  {
    id: 'cve-2019-19781',
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    answer: true,
    source: 'CVE-2019-19781 (Citrix ADC/Gateway traversal)'
  },
  {
    id: 'cve-2020-5902',
    question: 'Is the management UI vulnerable to unauthenticated RCE?',
    answer: true,
    source: 'CVE-2020-5902 (F5 BIG-IP TMUI RCE)'
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
    source: 'CVE-2022-30190 ("Follina" MSDT)'
  },
  {
    id: 'cve-2023-23397',
    question: 'Can a malicious calendar item force Outlook to leak NTLM hashes automatically?',
    answer: true,
    source: 'CVE-2023-23397 (Outlook NTLM-leak)'
  },
  {
    id: 'cve-2022-47966',
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine products?',
    answer: true,
    source: 'CVE-2022-47966 (Zoho ManageEngine SAML)'
  },
  {
    id: 'cve-2023-3519',
    question: 'Can unauthenticated attackers achieve code execution on vulnerable NetScaler ADC/Gateway?',
    answer: true,
    source: 'CVE-2023-3519 (Citrix ADC code injection)'
  },
  {
    id: 'cve-2020-1472',
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    answer: true,
    source: 'CVE-2020-1472 ("Zerologon")'
  },
  {
    id: 'cve-2023-22515',
    question: 'Can attackers create admin accounts by abusing an authentication bypass in Confluence Data Center/Server?',
    answer: true,
    source: 'CVE-2023-22515 (Confluence auth bypass)'
  }
]

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
  currentQuestion?: SecurityQuestion
  userAnswer?: boolean
}

interface WorkoutTimerProps {
  workout: WorkoutDay
  onWorkoutComplete: () => void
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

function getRandomQuestion(usedQuestions: string[], setUsedQuestions: (questions: string[]) => void): SecurityQuestion {
  const availableQuestions = SECURITY_QUESTIONS.filter(q => !usedQuestions.includes(q.id))
  
  // If all questions used, reset the pool
  if (availableQuestions.length === 0) {
    setUsedQuestions([])
    return SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  const selectedQuestion = availableQuestions[randomIndex]
  
  // Mark question as used
  setUsedQuestions([...usedQuestions, selectedQuestion.id])
  
  return selectedQuestion
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession>('workout-session', DEFAULT_SESSION)
  const [usedQuestions, setUsedQuestions] = useKV<string[]>('used-security-questions', [])
  const [repsCount, setRepsCount] = useState(5)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  
  // Reset session if workout changed
  useEffect(() => {
    if (session && session.workoutId !== workout.id) {
      const newSession: WorkoutSession = {
        ...DEFAULT_SESSION,
        workoutId: workout.id
      }
      setSession(newSession)
    }
  }, [workout.id, session, setSession])

  // Initialize reps count when state changes to input
  useEffect(() => {
    if (session?.state === 'input') {
      const exercise = getCurrentExercise()
      if (exercise) {
        const targetReps = parseInt(exercise.targetReps) || 5
        setRepsCount(targetReps)
      }
    }
  }, [session?.state, session?.currentExerciseIndex])

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (session && session.timerRunning && session.timeLeft > 0) {
      interval = setInterval(() => {
        setSession((prev: WorkoutSession) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1)
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session?.timerRunning, session?.timeLeft, setSession])

  const getCurrentExercise = (): Exercise | null => {
    if (!session || session.currentExerciseIndex >= workout.exercises.length) {
      return null
    }
    return workout.exercises[session.currentExerciseIndex]
  }

  const handleSetDone = () => {
    if (!session) return
    
    const question = getRandomQuestion(usedQuestions || [], setUsedQuestions)
    
    setSession((prev: WorkoutSession) => ({
      ...prev,
      actualReps: repsCount,
      state: 'resting',
      timerRunning: true,
      timeLeft: 180,
      initialTime: 180,
      canSkip: false,
      currentQuestion: question,
      userAnswer: undefined
    }))
    setFeedbackMessage('')
  }

  const handleAnswer = (answer: boolean) => {
    if (!session || !session.currentQuestion) return
    
    const isCorrect = answer === session.currentQuestion.answer
    
    setSession((prev: WorkoutSession) => ({
      ...prev,
      userAnswer: answer,
      canSkip: isCorrect
    }))

    if (isCorrect) {
      setFeedbackMessage('Correct! You can now skip to the next set.')
    } else {
      setFeedbackMessage('Wrong answer, redo the last set.')
      // Reset to input state after a delay
      setTimeout(() => {
        setSession((prev: WorkoutSession) => ({
          ...prev,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0,
          currentQuestion: undefined,
          userAnswer: undefined
        }))
        setFeedbackMessage('')
      }, 2000)
    }
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
          actualReps: 0,
          currentQuestion: undefined,
          userAnswer: undefined
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
        actualReps: 0,
        currentQuestion: undefined,
        userAnswer: undefined
      }))
    }
    setFeedbackMessage('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const decreaseReps = () => {
    setRepsCount(Math.max(0, repsCount - 1))
  }

  const increaseReps = () => {
    setRepsCount(repsCount + 1)
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
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">How many reps did you complete?</p>
                
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseReps}
                    className="h-12 w-12"
                  >
                    <CaretLeft size={20} />
                  </Button>
                  
                  <div className="text-4xl font-bold text-primary min-w-[80px]">
                    {repsCount}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseReps}
                    className="h-12 w-12"
                  >
                    <CaretRight size={20} />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSetDone}
                className="w-full"
                size="lg"
              >
                Set Done
              </Button>
            </div>
          )}

          {session.state === 'resting' && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold tabular-nums text-primary">
                  {formatTime(session.timeLeft)}
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Rest time - You did {session.actualReps} reps
                </p>
              </div>

              {/* Security Quiz integrated in the same card */}
              {session.currentQuestion && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Shield size={20} />
                    <span className="font-semibold">Security Quiz</span>
                  </div>
                  
                  {session.currentQuestion.source && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {session.currentQuestion.source}
                    </p>
                  )}
                  
                  <p className="text-sm">{session.currentQuestion.question}</p>
                  
                  {session.userAnswer === undefined ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleAnswer(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Yes
                      </Button>
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${
                        session.canSkip ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {feedbackMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {session.canSkip && (
                <Button 
                  onClick={handleSkipToNextSet}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <FastForward size={20} />
                  Skip to Next Set
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}