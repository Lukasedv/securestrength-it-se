import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import type { WorkoutDay } from '../App'
interface SecurityQuestion {
  question: string

const SECURITY_QUESTIONS: Se
    id: 'cve
    answer: true,
  {
 

    id: 'cve-2024-3094',
   
  {
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
  },
  {
    id: 'cve-2024-6387',
    question: 'Is this an sshd race condition that can lead to remote code execution on many Linux systems?',
    answer: true,
  },
  {
    id: 'cve-2024-3094',
    question: 'Did a compromised release of xz/liblzma introduce a backdoor reachable via OpenSSH?',
    answer: true,
  },
  {
    id: 'cve-2023-34362',
    question: 'Was this SQL injection widely exploited to drop web shells at scale?',
    answer: true,
  },
  {
    id: 'cve-2023-4966',
    question: 'Can session tokens be stolen and reused to hijack valid sessions?',
    answer: true,
  },
  {
    id: 'cve-2018-13379',
    question: 'Is this an old path-traversal bug that attackers still use for initial access?',
    answer: true,
  },
  {
    id: 'cve-2021-44228',
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    answer: true,
  },
  {
    id: 'cve-2021-34527',
    question: 'Can Windows Print Spooler lead to local privilege escalation or RCE?',
    answer: true,
  },
  {
    id: 'cve-2021-26855',
    question: 'Is this a server-side request forgery that enabled pre-auth compromise of Exchange?',
    answer: true,
  },
  {
    id: 'cve-2021-34473',
    question: 'Is this part of a chain that enables unauthenticated remote code execution on Exchange?',
    answer: true,
  },
  {
    question: 'Is the man
  },
    id: 'cve-2022
    
  {
    question: 'Can a mali
  },
    id: 'cve-2022
    
  {
    question: 'Can unauth
  },
    id: 'cve-2020
    
  {
    id: 'cve-2020-5902',
    question: 'Is the management UI vulnerable to unauthenticated RCE?',
    answer: true,
  },
  {
    id: 'cve-2022-30190',
    question: 'Can a crafted document trigger code execution via the MSDT handler without macros?',
    answer: true,
  },
  {
    id: 'cve-2023-23397',
    question: 'Can a malicious calendar item force Outlook to leak NTLM hashes automatically?',
    answer: true,
  },
  {
    id: 'cve-2022-47966',
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine products?',
    answer: true,
  },
  {
    id: 'cve-2023-3519',
    question: 'Can unauthenticated attackers achieve code execution on vulnerable NetScaler ADC/Gateway?',
    answer: true,
  },
  {
    id: 'cve-2020-1472',
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    answer: true,
  },
  {
    id: 'cve-2023-22515',
    question: 'Can attackers create admin accounts by abusing an authentication bypass in Confluence Data Center/Server?',
    answer: true,
  }
]

interface WorkoutSession {
  workoutId: string
  currentExercise: number
  currentSet: number
  state: 'input' | 'rest'
  timeLeft: number
  actualReps: number
  timerRunning: boolean
  currentQuestion?: SecurityQuestion
  userAnswer?: boolean
  canSkip: boolean
}

interface WorkoutTimerProps {
  workout: WorkoutDay
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

    if (!session) return
   

    setUsedQuestions(prev => [...(prev || [
      ...prev,
      timeLeft: 180,
      currentQuestion: question,
   


    if (!session?.c
    const isCorrect = answer === session.currentQuestio
    if (isCorrect) {
      setSession(p
      setFeedback('❌ Wrong 
      setSession(prev => prev 
        state: 'input',
        
     
      } : null)


    if (!session?.c
  }
  const nextSet = () => {
    const currentExercise = getCurrentExercise()

    
     
      if (nextExerciseIndex >= workout.exercises.length) {

      }
      const nextExercise
        ...prev,
        currentSet: 0,

        currentQuestion: undefined,
        canSkip: false
    } else {
      setSession(prev => prev ?
        curren
        actualReps: 
        currentQuest
        canSkip: false
    }
  }
  const adjustReps =
      ...prev
    } : null)


        <CardHeader>
        </CardHeader>


    
        <CardHeader>
          <CardDescription>Great job completing your workout!
        <CardContent>
            
        </CardContent>
    )

  if (!currentEx
  return (
      <CardHeader>
          <div>
              {currentExercise.name
            <CardDescription>T
        </div>
      <CardCont
          <div classN
     
   


          <div className="text-ce
             
   

                size="sm"
                onClick=
                <Minus size={16} />
              

              
    
                onClick={() => adjustReps(1)}
                <Plus size={16
            </div>
            <Button
              disabled={ses
            >
            </
       
      
            <div className="text-center">
                {formatTime(sessi
              <d
            
              <div cla
                  Secur
                <p className="text-sm">
                </p>
                  <Button
                    size="sm"
                    di
               
            
                    size="sm"
                    disabled={ses
                
                </div>
            )}
            {session.canSkip && (
                <p className
                </p>
                  variant="def
                >
               
     
        )}
   



























































































































































