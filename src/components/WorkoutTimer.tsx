import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, Ca
import { CaretLeft, CaretRight, Shield } from '@phosphor-icons/react'
interface SecurityQuestion {
  question: string


  {
    question: 'Can
    source: 'CVE-
  {
 

  {
   
    id: 'cve-2024-3400',
    question: 'Can unauthenticated attackers get remote code execution on affected PAN-OS firewalls?',
    answer: true,
    source: 'CVE-2024-3400 (PAN-OS GlobalProtect RCE)'
    
   
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
  {
    question: 'Does a crafted JNDI lookup in logs allow remote code execution?',
    source: 'CVE-
  {
    
   
  {
    question: 'Is this a server-side request forgery that enabled pre-auth comprom
    source: 'CVE-
  {
    
   
  {
    question: 'Can certain Spring MVC apps be exploited for remote code execution via data bind
    source: 'CVE-
  {
    
   
  {
    question: 'Can path traversal let attackers execute code on Citrix appliance
    source: 'CVE-
  {
    
   
  {
    question: 'Can a crafted document trigger code execution via the MSDT handler wit
    source: 'CVE-
  {
    
   
  {
    question: 'Does a SAML processing flaw allow unauthenticated RCE across multiple ManageEngine pr
    source: 'CVE-
  {
    
   
  {
    question: 'Can Netlogon cryptographic weakness enable domain controller takeover?',
    source: 'CVE-
  {
    
   
]
interface WorkoutSession {
  currentExercise
  state: 'input' | 'rest' | 'complete'
  ti
  a
  userAnswer?: boolean
}
interface Workout
  onWorkoutComplete: () => void

  c
  state: 'input',
  timeLeft: 180,
  actualReps: 0,
}
func
  
    return SECURITY_QUES
  
  return availabl

  co
  c
  // Initialize session
    if (session && session.workoutId !== workout.id) {
        ...DEFAUL
      })
    
   
    }

  useEffect(() =>
      const exercise = getCurrentExercise()
    
   
  }, [session?.state, ses
  // Timer countdown
    let interval:
      interval = setInterval(() => {
    
   
    }
    return () => clearInterval(interval)

    if (!session) return null
  }
  c
    const question = get
      ...prev,
      timerRunnin
      currentQuestion: question,
    
   

    if (!session?.currentQuestion) return
    const isCorre

   
 

      setUsedQuestions(pre

    if (isCorrect) {
        setFeedback(
    }

    if (!session) 
    const currentExer

      // Move to next exercise
        setSession((pr
          currentE
 

          userAnswer: undefin
        }) : null)
        setSession((prev: Worko
 

      setSession((prev: WorkoutSession | null) => prev ? ({
        currentSet: prev.c
        timerRun
        userAnswe
        currentQuestio
    }
    setFeedback('')

    setSession(p
 

      canSkip: false
    setFeedback('')

    if (session?.canSkip) {
    }

  

    setSession(prev => prev ? { ...prev,


    return `${mins}:${secs.toString().padStart(2, '0')}`

  if (!session) {
  }

      <Card>
          <h2 class
            Great job completing {workout.name}!
          <Button 
          </Button>
      </Card>
  }
  const currentExercise = 
  return (
      <Card>
          <div className="tex
        
     
          <CardDescription className="t


          {session.
              <div className="flex items-center
                  variant="outline"
                  cla
                >
                </Button>
       
     
                  size="icon"

                  <C
              </div
              <Button 
                className="w-full"
              >
              </Button>
          )}
          {session.state === 'rest' &
              <div
              
     

              {session.currentQuestion &
                  <div className="flex items-center gap-2 mb

                  <p className="mb-4">{session.curren
                    <p classN
                    </p>
   

                        onC
                        
                        Yes
                      <Button 
              
                      >
                      </B
                  )}
                  {feedback && (
                     
                      }>
              
                   
   

                            Redo Set
                        </div>

                </div>


                  variant="defau
              
                <
            </div>
        </Card

}














































































































































































































































