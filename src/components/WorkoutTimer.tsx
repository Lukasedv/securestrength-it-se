import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FastForward, CaretLeft, CaretRight, Shield } from '@phosphor-icons/react'
import { WorkoutDay, Exercise } from '@/App'

interface WorkoutTimerProps {
  workout: WorkoutDay
  onWorkoutComplete: () => void
}

type WorkoutState = 'input' | 'resting' | 'complete'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean // true = Yes, false = No
  explanation: string
  source?: string // CVE number or source
  isGenerated?: boolean
}

// CVE-based security questions
const CVE_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'cve-2024-3400',
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
    explanation: 'Yes - CVE-2024-3400 is a critical vulnerability in PAN-OS GlobalProtect that allows remote code execution.',
    source: 'CVE-2024-3400 (PAN-OS GlobalProtect RCE)'
  },
  {
    id: 'cve-2024-6387',
    question: 'Is this an sshd race condition that can lead to remote code execution on many Linux systems?',
    answer: true,
    explanation: 'Yes - CVE-2024-6387 "regreSSHion" is a race condition in OpenSSH that can lead to remote code execution.',
    source: 'CVE-2024-6387 (OpenSSH "regreSSHion")'
  },
  {
    id: 'cve-2024-3094',
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    answer: true,
    explanation: 'Yes - CVE-2024-3094 involved a sophisticated backdoor in XZ Utils that could be triggered through SSH connections.',
    source: 'CVE-2024-3094 (XZ Utils backdoor)'
  },
  {
    id: 'cve-2023-34362',
    question: 'Was this SQL injection widely exploited to drop web shells at scale?',
    answer: true,
    explanation: 'Yes - CVE-2023-34362 in MOVEit Transfer was a SQL injection vulnerability exploited by threat actors to deploy web shells.',
    source: 'CVE-2023-34362 (MOVEit Transfer SQLi)'
  },
  {
    id: 'cve-2023-4966',
    question: 'Can session tokens be stolen and reused to hijack valid sessions?',
    answer: true,
    explanation: 'Yes - CVE-2023-4966 "Citrix Bleed" allows attackers to steal session tokens and hijack authenticated sessions.',
    source: 'CVE-2023-4966 (Citrix/NetScaler "Bleed")'
  },
  {
    id: 'cve-2018-13379',
    question: 'Is this an old path-traversal bug that attackers still use for initial access?',
    answer: true,
    explanation: 'Yes - CVE-2018-13379 in Fortinet FortiOS SSL-VPN is an old vulnerability still actively exploited for initial access.',
    source: 'CVE-2018-13379 (Fortinet FortiOS SSL-VPN)'
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
    explanation: 'Yes - CVE-2021-44228 Log4Shell allows remote code execution through malicious JNDI lookups in log messages.',
    source: 'CVE-2021-44228 (Log4Shell)'
  },
  {
    id: 'cve-2021-34527',
    question: 'Can Windows Print Spooler lead to local privilege escalation or RCE?',
    answer: true,
    explanation: 'Yes - CVE-2021-34527 PrintNightmare affects Windows Print Spooler and can lead to privilege escalation or RCE.',
    source: 'CVE-2021-34527 (PrintNightmare)'
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange?',
    answer: true,
    explanation: 'Yes - CVE-2021-26855 is part of ProxyLogon chain allowing pre-authentication compromise of Exchange servers.',
    source: 'CVE-2021-26855 (Exchange ProxyLogon)'
  },
  {
    id: 'cve-2021-34473',
    question: 'Is this part of a chain that enables unauthenticated remote code execution on Exchange?',
    answer: true,
    explanation: 'Yes - CVE-2021-34473 is part of the ProxyShell vulnerability chain enabling unauthenticated RCE on Exchange.',
    source: 'CVE-2021-34473 (Exchange ProxyShell)'
  },
  {
    id: 'cve-2022-22965',
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data binding?',
    answer: true,
    explanation: 'Yes - CVE-2022-22965 Spring4Shell allows RCE in Spring MVC applications through malicious data binding.',
    source: 'CVE-2022-22965 (Spring4Shell)'
  },
  {
    id: 'cve-2022-26134',
    question: 'Does an OGNL injection allow unauthenticated RCE on Confluence Server/Data Center?',
    answer: true,
    explanation: 'Yes - CVE-2022-26134 allows unauthenticated remote code execution through OGNL injection in Confluence.',
    source: 'CVE-2022-26134 (Confluence OGNL RCE)'
  },
  {
    id: 'cve-2019-19781',
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    answer: true,
    explanation: 'Yes - CVE-2019-19781 is a path traversal vulnerability in Citrix ADC/Gateway that enables code execution.',
    source: 'CVE-2019-19781 (Citrix ADC/Gateway traversal)'
  },
  {
    id: 'cve-2020-5902',
    question: 'Is the management UI vulnerable to unauthenticated RCE?',
    answer: true,
    explanation: 'Yes - CVE-2020-5902 affects F5 BIG-IP TMUI allowing unauthenticated remote code execution.',
    source: 'CVE-2020-5902 (F5 BIG-IP TMUI RCE)'
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
    explanation: 'Yes - CVE-2022-30190 "Follina" allows code execution through Microsoft Support Diagnostic Tool without macros.',
    source: 'CVE-2022-30190 ("Follina" MSDT)'
  },
  {
    id: 'cve-2023-23397',
    question: 'Can a malicious calendar item force Outlook to leak NTLM hashes automatically?',
    answer: true,
    explanation: 'Yes - CVE-2023-23397 causes Outlook to automatically leak NTLM hashes when processing malicious calendar items.',
    source: 'CVE-2023-23397 (Outlook NTLM-leak)'
  },
  {
    id: 'cve-2022-47966',
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine products?',
    answer: true,
    explanation: 'Yes - CVE-2022-47966 is a SAML processing vulnerability affecting multiple Zoho ManageEngine products.',
    source: 'CVE-2022-47966 (Zoho ManageEngine SAML)'
  },
  {
    id: 'cve-2023-3519',
    question: 'Can unauthenticated attackers achieve code execution on vulnerable NetScaler ADC/Gateway?',
    answer: true,
    explanation: 'Yes - CVE-2023-3519 allows unauthenticated code execution on Citrix ADC and Gateway appliances.',
    source: 'CVE-2023-3519 (Citrix ADC code injection)'
  },
  {
    id: 'cve-2020-1472',
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    answer: true,
    explanation: 'Yes - CVE-2020-1472 "Zerologon" exploits Netlogon cryptographic flaws to enable domain controller compromise.',
    source: 'CVE-2020-1472 ("Zerologon")'
  },
  {
    id: 'cve-2023-22515',
    question: 'Can attackers create admin accounts by abusing an authentication bypass in Confluence Data Center/Server?',
    answer: true,
    explanation: 'Yes - CVE-2023-22515 allows attackers to create admin accounts through an authentication bypass vulnerability.',
    source: 'CVE-2023-22515 (Confluence auth bypass)'
  }
]

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
  showQuizResult: boolean
  userAnswer?: boolean
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
  actualReps: 0,
  showQuizResult: false
}

// Track used questions to avoid repeats in a session
let usedQuestionIds: string[] = []

// Get a random CVE question that hasn't been used recently
function getRandomCVEQuestion(): SecurityQuestion {
  // If all questions have been used, reset the used list
  if (usedQuestionIds.length >= CVE_QUESTIONS.length) {
    usedQuestionIds = []
  }
  
  // Get available questions
  const availableQuestions = CVE_QUESTIONS.filter(q => !usedQuestionIds.includes(q.id))
  
  // Pick a random available question
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  const selectedQuestion = availableQuestions[randomIndex]
  
  // Mark as used
  usedQuestionIds.push(selectedQuestion.id)
  
  return selectedQuestion
}

export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [session, setSession] = useKV<WorkoutSession>('workout-session', DEFAULT_SESSION)
  const [repsCount, setRepsCount] = useState(0)
  
  // Initialize session if it doesn't exist or workout changed
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      const newSession: WorkoutSession = {
        ...DEFAULT_SESSION,
        workoutId: workout.id,
        actualReps: 0
      }
      setSession(newSession)
      setRepsCount(0)
    }
  }, [workout.id, session, setSession])

  // Initialize reps count based on current exercise - only on input state
  useEffect(() => {
    if (session?.state === 'input') {
      const exercise = getCurrentExercise()
      if (exercise) {
        const targetReps = parseInt(exercise.targetReps) || 5
        setRepsCount(targetReps)
      }
    }
  }, [session?.currentExerciseIndex, session?.state])

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (session && session.timerRunning && session.timeLeft > 0) {
      interval = setInterval(() => {
        setSession((prev: WorkoutSession) => {
          const newTimeLeft = prev.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Play completion sound
            try {
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
            } catch (e) {
              // Fallback if audio context fails
              console.log('Timer completed!')
            }
            
            return {
              ...prev,
              timeLeft: 0,
              timerRunning: false
            }
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session?.timerRunning, session?.timeLeft, setSession])

  // Handle timer completion (when it naturally reaches 0)
  useEffect(() => {
    if (session && session.state === 'resting' && session.timeLeft === 0 && !session.timerRunning) {
      setTimeout(() => {
        moveToNextSet()
      }, 1000) // Small delay after timer completion
    }
  }, [session?.state, session?.timeLeft, session?.timerRunning])

  const getCurrentExercise = (): Exercise | null => {
    if (!session) return null
    return workout.exercises[session.currentExerciseIndex] || null
  }

  const getRandomQuestion = (): SecurityQuestion => {
    return getRandomCVEQuestion()
  }

  const handleSetDone = () => {
    if (repsCount <= 0 || !session) return

    // Get a CVE question immediately
    const question = getRandomQuestion()

    setSession((prev: WorkoutSession) => ({
      ...prev,
      actualReps: repsCount,
      state: 'resting',
      timerRunning: true,
      timeLeft: 180,
      initialTime: 180,
      canSkip: false,
      showQuizResult: false,
      currentQuestion: question,
      isGeneratingQuestion: false
    }))
  }

  const handleQuizAnswer = (answer: boolean) => {
    if (!session?.currentQuestion) return
    
    const isCorrect = answer === session.currentQuestion.answer
    setSession((prev: WorkoutSession) => ({
      ...prev,
      userAnswer: answer,
      showQuizResult: true,
      canSkip: isCorrect
    }))

    if (!isCorrect) {
      // Wrong answer - user must redo the set after showing explanation
      setTimeout(() => {
        setSession((prev: WorkoutSession) => ({
          ...prev,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0,
          showQuizResult: false,
          currentQuestion: undefined,
          userAnswer: undefined
        }))
        const exercise = getCurrentExercise()
        if (exercise) {
          setRepsCount(parseInt(exercise.targetReps) || 5)
        }
      }, 3000) // Show result for 3 seconds
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
        const nextExercise = workout.exercises[session.currentExerciseIndex + 1]
        setSession((prev: WorkoutSession) => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          state: 'input',
          timerRunning: false,
          canSkip: false,
          actualReps: 0,
          showQuizResult: false,
          currentQuestion: undefined,
          userAnswer: undefined
        }))
        setRepsCount(parseInt(nextExercise.targetReps) || 5)
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
        showQuizResult: false,
        currentQuestion: undefined,
        userAnswer: undefined
      }))
      setRepsCount(parseInt(currentExercise.targetReps) || 5)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const adjustReps = (delta: number) => {
    setRepsCount(prev => Math.max(0, prev + delta))
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
            <div className="space-y-3">
              <p className="text-center text-sm font-medium">How many reps did you complete?</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustReps(-1)}
                  disabled={repsCount <= 0}
                  className="h-12 w-12 p-0"
                >
                  <CaretLeft size={20} />
                </Button>
                <div className="text-3xl font-bold tabular-nums text-primary min-w-[60px] text-center">
                  {repsCount}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustReps(1)}
                  className="h-12 w-12 p-0"
                >
                  <CaretRight size={20} />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSetDone}
              disabled={repsCount <= 0}
              className="w-full"
              size="lg"
            >
              Set Done
            </Button>
          </div>
        )}

        {session.state === 'resting' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold tabular-nums text-primary">
                {formatTime(session.timeLeft)}
              </div>
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
                size="lg"
              >
                <FastForward size={20} />
                Skip to Next Set
              </Button>
            )}

            {/* Security Quiz integrated into the same card */}
            {session.currentQuestion && (
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Shield size={20} className="text-primary" />
                    Security Quiz
                  </div>
                  
                  {!session.showQuizResult ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{session.currentQuestion.question}</p>
                      {session.currentQuestion.source && (
                        <p className="text-xs text-muted-foreground italic">
                          Source: {session.currentQuestion.source}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleQuizAnswer(true)}
                          className="flex-1"
                          size="lg"
                        >
                          Yes
                        </Button>
                        <Button 
                          onClick={() => handleQuizAnswer(false)}
                          variant="outline"
                          className="flex-1"
                          size="lg"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <div className={`p-4 rounded-md ${
                        session.canSkip ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                      }`}>
                        <div className="text-lg font-semibold mb-2">
                          {session.canSkip ? '✅ Correct!' : '❌ Wrong answer, redo the last set.'}
                        </div>
                        <p className="text-sm">{session.currentQuestion.explanation}</p>
                        {session.currentQuestion.source && (
                          <p className="text-xs text-muted-foreground/80 mt-2 italic">
                            Source: {session.currentQuestion.source}
                          </p>
                        )}
                      </div>
                      {session.canSkip && (
                        <p className="text-sm text-muted-foreground">
                          You can now skip to the next set or wait for the rest timer to finish.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}