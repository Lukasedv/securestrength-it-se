import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CaretLeft, CaretRight, Shield, Question } from '@phosphor-icons/react'

  question: string
  source: st

  {
    question: 'C
 

    question: 'Is this an sshd race condition th
   
  {
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    source: 'CVE-
  {
    
   
  {
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange servers?',
    source: 'CVE-
  {
    
   
  {
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    source: 'CVE-
    source: 'CVE-2024-3094 (XZ Utils backdoor)'
  },
   
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
    source: 'CVE-2021-44228 (Log4Shell)'
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange servers?',
    answer: true,
    source: 'CVE-2021-26855 (ProxyLogon)'
  },
  {
    id: 'cve-2022-22965',
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data binding?',
    answer: true,
    source: 'CVE-2022-22965 (Spring4Shell)'
  },
  {
    id: 'cve-2023-3519',
    question: 'Can path traversal let attackers execute code on Citrix appliances?',
    answer: true,
    source: 'CVE-2023-3519 (Citrix NetScaler ADC)'
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
    source: 'CVE-2022-30190 (Follina)'
  },
  {
  workout: any
}
const DEFAULT_SES
  currentSet: 0,
  ti
  t
}
export function WorkoutTimer({ workout, onWorkoutComplete }: WorkoutTimerProps) {
  const [usedQues

   
 

    return availableQuesti

  currentExercise: number
  currentSet: number
  state: 'input' | 'rest' | 'complete'
  timeLeft: number
  actualReps: number
  timerRunning: boolean
  currentQuestion?: SecurityQuestion
  userAnswer?: boolean
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
    const availableQuestions = SECURITY_QUESTIONS.filter(q => !usedQuestions.includes(q.id))
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

  // Initialize session
  useEffect(() => {
    if (!session || session.workoutId !== workout.id) {
      setSession({
        ...DEFAULT_SESSION,
        workoutId: workout.id
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
  }, [session?.timerRunning, session?.timeLeft, setSession])

  // Auto-transition when timer ends
  useEffect(() => {
    if (session?.state === 'rest' && session.timeLeft === 0) {
      const exercise = getCurrentExercise()
      if (!exercise) return

      if (session.currentSet + 1 >= exercise.sets) {
        // Move to next exercise or complete workout
        if (session.currentExercise + 1 >= workout.exercises.length) {
          setSession(prev => prev ? { ...prev, state: 'complete' } : null)
        } else {
          setSession(prev => prev ? {
            ...prev,
            currentExercise: prev.currentExercise + 1,
            currentSet: 0,
    setUsedQuestions(prev =
    if (isCorrect) {
      setSession(prev => prev ? { 
      setFeedback(`❌ Incorrect. ${sessi
  }
  const skipRest = 
    const

      // Move to next exerc
        setSession(prev => prev ? {
        setSession
          currentExercise: prev.currentExe
          state: 'input',
          userAnswer: un
          canSkip: false
      }
      setSession(prev =>
        currentSe
       
     
      } : null)


    setSession(prev => p
      state: 'input',
      timerRunning: false,
      currentQ
    } : null)
  }
  const handleRepsChange 
    setSession(prev => prev ? { 

    const min
    return `${mins}



    return (
        <CardHeader className="text-center">

          </CardDescription>
        <CardContent className="text-center">

        </CardConten
    )

  if (!curre
  return (
     
   

        </div>
          Target: {curre
      </CardHeader>
        {session.state === 'inpu

                variant="outline"
                onClick={() => handleRepsChange((s
              >
              </Button>
              
                onChange={(e) => ha
                pl
              <Button
                size="ic
              >
              </Button>
            <Button 
              disabled={session.actua
            >
            </But
       
        {ses
            <div className="text-
                
              <p className="text-muted-f

              <div cla
                  <Shield clas
                </div>
                
               
     
                   
   

                      cla
                      No
              
                  <di
                    
                      }`}>
                      </p>
                  </div>
              </div>

              <Butt
   

                variant="default"
              >
              </Button>
   

  )

















































































































































