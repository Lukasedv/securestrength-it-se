import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Shield, Lock, Eye } from '@phosphor-icons/react'

interface SecurityTip {
  id: string
  title: string
  content: string
  category: string
  completed: boolean
  quiz?: {
    question: string
    options: string[]
    correct: number
  }
}

const SECURITY_TIPS: SecurityTip[] = [
  {
    id: 'password-strength',
    title: 'Strong Password Fundamentals',
    content: 'Use passwords with at least 12 characters, mixing uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal information.',
    category: 'Authentication',
    completed: false,
    quiz: {
      question: 'What makes a password strong?',
      options: ['Length only', 'Complexity only', 'Both length and complexity', 'Using personal information'],
      correct: 2
    }
  },
  {
    id: 'two-factor-auth',
    title: 'Two-Factor Authentication (2FA)',
    content: '2FA adds an extra security layer by requiring two forms of verification: something you know (password) and something you have (phone/token).',
    category: 'Authentication',
    completed: false,
    quiz: {
      question: 'Why is 2FA more secure than passwords alone?',
      options: ['It\'s faster', 'It requires two different types of credentials', 'It\'s easier to remember', 'It works offline'],
      correct: 1
    }
  },
  {
    id: 'phishing-basics',
    title: 'Recognizing Phishing Attempts',
    content: 'Phishing emails often have urgent language, suspicious links, poor grammar, and ask for sensitive information. Always verify sender authenticity.',
    category: 'Social Engineering',
    completed: false,
    quiz: {
      question: 'What\'s a red flag in emails?',
      options: ['Professional formatting', 'Urgent action required', 'Proper grammar', 'Known sender address'],
      correct: 1
    }
  },
  {
    id: 'software-updates',
    title: 'Importance of Software Updates',
    content: 'Regular updates patch security vulnerabilities and add new features. Enable automatic updates when possible for critical security patches.',
    category: 'System Security',
    completed: false
  },
  {
    id: 'public-wifi-risks',
    title: 'Public Wi-Fi Security Risks',
    content: 'Public networks are often unencrypted and monitored. Avoid sensitive activities or use a VPN to encrypt your traffic when on public Wi-Fi.',
    category: 'Network Security',
    completed: false,
    quiz: {
      question: 'What should you use on public Wi-Fi?',
      options: ['Nothing special', 'VPN', 'Incognito mode', 'Antivirus only'],
      correct: 1
    }
  },
  {
    id: 'data-backup',
    title: '3-2-1 Backup Strategy',
    content: 'Keep 3 copies of important data: 2 local (different devices/media) and 1 remote (cloud/offsite). Regular backups protect against ransomware and hardware failure.',
    category: 'Data Protection',
    completed: false
  }
]

export function SecurityTipCard() {
  const [completedTips, setCompletedTips] = useKV<string[]>('completed-security-tips', [])
  const [currentTip, setCurrentTip] = useState<SecurityTip | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    const availableTips = SECURITY_TIPS.filter(tip => !completedTips?.includes(tip.id))
    if (availableTips.length > 0) {
      const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)]
      setCurrentTip(randomTip)
    } else {
      // All tips completed, show a random one again
      const randomTip = SECURITY_TIPS[Math.floor(Math.random() * SECURITY_TIPS.length)]
      setCurrentTip(randomTip)
    }
  }, [completedTips])

  const markAsRead = () => {
    if (currentTip && !completedTips?.includes(currentTip.id)) {
      setCompletedTips(current => [...(current || []), currentTip.id])
    }
    if (currentTip?.quiz) {
      setShowQuiz(true)
    }
  }

  const submitQuizAnswer = () => {
    if (currentTip?.quiz && selectedAnswer !== null) {
      const correct = selectedAnswer === currentTip.quiz.correct
      setIsCorrect(correct)
      setQuizCompleted(true)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Lock size={16} />
      case 'Social Engineering':
        return <Eye size={16} />
      case 'System Security':
      case 'Network Security':
      case 'Data Protection':
        return <Shield size={16} />
      default:
        return <Shield size={16} />
    }
  }

  if (!currentTip) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getCategoryIcon(currentTip.category)}
            Security Tip
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {currentTip.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">{currentTip.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentTip.content}
          </p>
        </div>

        {!showQuiz && !completedTips?.includes(currentTip.id) && (
          <Button onClick={markAsRead} size="sm" className="w-full">
            <CheckCircle size={16} className="mr-2" />
            Mark as Read
          </Button>
        )}

        {showQuiz && currentTip.quiz && !quizCompleted && (
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Quick Quiz:</h5>
            <p className="text-sm">{currentTip.quiz.question}</p>
            <div className="space-y-2">
              {currentTip.quiz.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => setSelectedAnswer(index)}
                >
                  <span className="text-xs mr-2 font-mono">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-sm">{option}</span>
                </Button>
              ))}
            </div>
            {selectedAnswer !== null && (
              <Button onClick={submitQuizAnswer} size="sm" className="w-full">
                Submit Answer
              </Button>
            )}
          </div>
        )}

        {quizCompleted && (
          <div className={`p-3 rounded-md text-sm ${
            isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
          }`}>
            {isCorrect ? '✅ Correct! Great job.' : '❌ Not quite right, but good effort!'}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{completedTips?.length || 0} / {SECURITY_TIPS.length} tips completed</span>
          {completedTips?.includes(currentTip.id) && (
            <span className="flex items-center gap-1">
              <CheckCircle size={12} />
              Completed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}