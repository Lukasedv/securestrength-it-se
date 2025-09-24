import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from '@phosphor-icons/react'

interface SecurityQuestion {
  id: string
  question: string
  answer: boolean // true = Yes, false = No
  explanation: string
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'password-reuse',
    question: 'Is it safe to use the same password for multiple accounts?',
    answer: false,
    explanation: 'No - Using the same password across multiple accounts creates a single point of failure.'
  },
  {
    id: 'public-wifi-banking',
    question: 'Should you do online banking on public Wi-Fi?',
    answer: false,
    explanation: 'No - Public Wi-Fi networks are often unsecured and can be monitored by attackers.'
  },
  {
    id: 'software-updates',
    question: 'Are software updates important for security?',
    answer: true,
    explanation: 'Yes - Updates often include critical security patches that fix vulnerabilities.'
  },
  {
    id: 'email-links',
    question: 'Should you click links in emails from unknown senders?',
    answer: false,
    explanation: 'No - Links from unknown senders could lead to malicious websites or downloads.'
  },
  {
    id: 'two-factor-auth',
    question: 'Does two-factor authentication make your accounts more secure?',
    answer: true,
    explanation: 'Yes - 2FA adds an extra layer of security beyond just passwords.'
  },
  {
    id: 'usb-devices',
    question: 'Is it safe to plug in USB drives you find lying around?',
    answer: false,
    explanation: 'No - Unknown USB devices could contain malware or be part of a social engineering attack.'
  },
  {
    id: 'backup-importance',
    question: 'Are regular backups important for data security?',
    answer: true,
    explanation: 'Yes - Backups protect against data loss from ransomware, hardware failure, or accidents.'
  },
  {
    id: 'social-media-info',
    question: 'Should you share personal information like your address on social media?',
    answer: false,
    explanation: 'No - Personal information on social media can be used by attackers for identity theft or social engineering.'
  }
]

interface SecurityQuizProps {
  onCorrectAnswer: () => void
  onWrongAnswer: () => void
  className?: string
}

export function SecurityQuiz({ onCorrectAnswer, onWrongAnswer, className = '' }: SecurityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(() => 
    SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)]
  )
  const [showResult, setShowResult] = useState(false)
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)

  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer)
    setShowResult(true)
    
    setTimeout(() => {
      if (answer === currentQuestion.answer) {
        onCorrectAnswer()
      } else {
        onWrongAnswer()
      }
    }, 2000) // Show result for 2 seconds
  }

  const getNextQuestion = () => {
    const availableQuestions = SECURITY_QUESTIONS.filter(q => q.id !== currentQuestion.id)
    const nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    setCurrentQuestion(nextQuestion)
    setShowResult(false)
    setUserAnswer(null)
  }

  const isCorrect = userAnswer === currentQuestion.answer

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield size={20} />
          Security Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showResult ? (
          <>
            <div className="space-y-3">
              <p className="text-sm font-medium">{currentQuestion.question}</p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAnswer(true)}
                  className="flex-1"
                  size="lg"
                >
                  Yes
                </Button>
                <Button 
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  No
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 text-center">
            <div className={`p-4 rounded-md ${
              isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
            }`}>
              <div className="text-lg font-semibold mb-2">
                {isCorrect ? '✅ Correct!' : '❌ Wrong answer, redo the last set.'}
              </div>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
            {isCorrect && (
              <p className="text-sm text-muted-foreground">
                You can now skip to the next set or wait for the rest timer to finish.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}