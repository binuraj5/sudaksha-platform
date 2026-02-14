# M9-5: RUNTIME AI QUESTION GENERATION - ADAPTIVE DIFFICULTY
## Intelligent, On-the-Fly Assessment with Context-Aware Adaptive Difficulty

---

## 🎯 CONCEPT OVERVIEW

### What Is Runtime AI Question Generation?

Instead of creating all questions beforehand, the system **generates questions dynamically during the assessment** based on:
1. **Candidate's performance** (real-time adaptation)
2. **Role and competency requirements** (what we're testing)
3. **Previous answers quality** (context-aware follow-ups)
4. **Target proficiency level** (Junior/Middle/Senior/Expert)

### How It's Different from Static Assessments:

**Static Assessment (Current):**
```
Admin creates: 10 MCQ questions (all MEDIUM difficulty)
    ↓
Candidate takes assessment
    ↓
Answers all 10 questions (regardless of performance)
    ↓
Score: 70% (7/10 correct)
```

**Adaptive Assessment (M9-5):**
```
System starts: Question 1 (MEDIUM difficulty)
    ↓
Candidate answers CORRECTLY
    ↓
System generates: Question 2 (HARD difficulty) ← Adapted up
    ↓
Candidate answers INCORRECTLY
    ↓
System generates: Question 3 (MEDIUM difficulty) ← Adapted down
    ↓
Continues adapting based on performance
    ↓
More accurate assessment in fewer questions
```

---

## 🧠 ADAPTIVE DIFFICULTY ALGORITHM

### Item Response Theory (IRT) Based Approach

**Core Principle:**
- Each question has a **difficulty level** (θ): 1-10 scale
- Each candidate has an **ability level** (β): 1-10 scale
- System adjusts difficulty to match candidate's ability
- **Optimal learning zone:** Questions slightly above current ability

### Algorithm Flow:

```python
class AdaptiveAssessment:
    def __init__(self, role, competency, target_level):
        self.role = role
        self.competency = competency
        self.target_level = target_level
        
        # Start at target level baseline
        self.candidate_ability = self.get_baseline_ability(target_level)
        # JUNIOR: 3, MIDDLE: 5, SENIOR: 7, EXPERT: 9
        
        self.questions_asked = []
        self.responses = []
        
    def get_baseline_ability(self, level):
        """Initial estimate based on target level"""
        return {
            'JUNIOR': 3,
            'MIDDLE': 5,
            'SENIOR': 7,
            'EXPERT': 9
        }[level]
    
    def calculate_next_difficulty(self):
        """Determine next question difficulty based on performance"""
        
        if len(self.responses) == 0:
            # First question: start at baseline
            return self.candidate_ability
        
        # Analyze recent performance (last 3 questions)
        recent_responses = self.responses[-3:]
        correct_count = sum(1 for r in recent_responses if r['correct'])
        accuracy = correct_count / len(recent_responses)
        
        # Adaptive logic
        if accuracy >= 0.8:
            # Performing well → increase difficulty
            self.candidate_ability += 0.5
        elif accuracy <= 0.4:
            # Struggling → decrease difficulty
            self.candidate_ability -= 0.5
        # else: accuracy 0.4-0.8 → keep current level
        
        # Ensure ability stays in valid range (1-10)
        self.candidate_ability = max(1, min(10, self.candidate_ability))
        
        # Next question should be slightly above current ability
        # (optimal challenge zone)
        return min(10, self.candidate_ability + 0.5)
    
    async def generate_next_question(self):
        """Generate next question with adaptive difficulty"""
        
        difficulty = self.calculate_next_difficulty()
        
        # Get context from previous questions and answers
        context = self.build_context()
        
        # Generate question via AI
        question = await self.ai_generate_question(
            competency=self.competency,
            difficulty=difficulty,
            context=context
        )
        
        self.questions_asked.append(question)
        return question
    
    def build_context(self):
        """Build context from previous Q&A for intelligent follow-ups"""
        context = {
            'role': self.role.name,
            'competency': self.competency.name,
            'target_level': self.target_level,
            'previous_qa': []
        }
        
        for i, (q, r) in enumerate(zip(self.questions_asked, self.responses)):
            context['previous_qa'].append({
                'question_number': i + 1,
                'question': q.text,
                'candidate_answer': r['answer'],
                'was_correct': r['correct'],
                'difficulty': q.difficulty
            })
        
        return context
    
    async def ai_generate_question(self, competency, difficulty, context):
        """Generate question using GPT-4 with context awareness"""
        
        prompt = f"""
You are generating an assessment question for a {context['target_level']} level candidate.

Role: {context['role']}
Competency: {competency.name}
Competency Description: {competency.description}
Indicators to test: {self.get_relevant_indicators(competency)}

Target Difficulty: {difficulty}/10
- 1-3: Basic/Entry level
- 4-6: Intermediate/Practical
- 7-8: Advanced/Strategic
- 9-10: Expert/Thought leadership

Previous Questions and Performance:
{self.format_previous_qa(context['previous_qa'])}

CRITICAL RULES:
1. Generate a question at EXACTLY difficulty {difficulty}/10
2. DO NOT repeat or be too similar to previous questions
3. If candidate answered previous question correctly, explore a different aspect
4. If candidate struggled, provide a different angle on the same concept
5. Make it practical and role-relevant
6. Include realistic scenario if appropriate

Generate ONE multiple-choice question with:
- Question text
- 4 options (A, B, C, D)
- Correct answer
- Brief explanation
- Estimated difficulty (confirm it matches {difficulty}/10)

Return as JSON.
"""
        
        response = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert assessment designer creating adaptive difficulty questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        
        return self.parse_generated_question(response.choices[0].message.content)
    
    def record_response(self, question, answer, is_correct):
        """Record candidate's response and update ability estimate"""
        self.responses.append({
            'question_id': question.id,
            'answer': answer,
            'correct': is_correct,
            'timestamp': datetime.now()
        })
    
    def should_continue(self):
        """Determine if assessment should continue"""
        
        # Minimum questions: 8
        if len(self.responses) < 8:
            return True
        
        # Maximum questions: 15
        if len(self.responses) >= 15:
            return False
        
        # Stop if we have high confidence in ability estimate
        # (consistent performance over last 4 questions)
        if len(self.responses) >= 8:
            last_four = self.responses[-4:]
            accuracy = sum(1 for r in last_four if r['correct']) / 4
            
            # If very consistent (all correct or all wrong), we can stop
            if accuracy == 1.0 or accuracy == 0.0:
                return False
            
            # If somewhat consistent (75% or 25%), stop after 12 questions
            if len(self.responses) >= 12 and (accuracy >= 0.75 or accuracy <= 0.25):
                return False
        
        return True
    
    def calculate_final_score(self):
        """Calculate final assessment score"""
        
        total_difficulty = sum(q.difficulty for q in self.questions_asked)
        total_correct = sum(1 for r in self.responses if r['correct'])
        
        # Weighted score based on difficulty
        weighted_score = 0
        for q, r in zip(self.questions_asked, self.responses):
            if r['correct']:
                weighted_score += q.difficulty
        
        # Normalize to 0-100 scale
        max_possible = sum(q.difficulty for q in self.questions_asked)
        percentage = (weighted_score / max_possible) * 100
        
        return {
            'percentage': round(percentage, 2),
            'estimated_ability': round(self.candidate_ability, 2),
            'questions_answered': len(self.responses),
            'accuracy': round(total_correct / len(self.responses) * 100, 2),
            'difficulty_progression': [q.difficulty for q in self.questions_asked]
        }
```

---

## 🎬 USER EXPERIENCE FLOW

### Candidate's Perspective:

```
Assessment Start
    ↓
┌─────────────────────────────────────────────────┐
│ Question 1/~10                                  │
│ Difficulty: ●●●○○ (Medium)                      │
├─────────────────────────────────────────────────┤
│ As a project manager, your team is behind       │
│ schedule. What's your first step?               │
│                                                 │
│ A) Work overtime to catch up                    │
│ B) Analyze root cause of delays                 │
│ C) Request deadline extension                   │
│ D) Reduce project scope                         │
│                                                 │
│ [Submit Answer]                                 │
└─────────────────────────────────────────────────┘
    ↓
[Candidate selects B - CORRECT]
    ↓
[System: "Good answer! Adjusting difficulty..."]
    ↓
┌─────────────────────────────────────────────────┐
│ Question 2/~10                                  │
│ Difficulty: ●●●●○ (Hard) ← Adapted UP          │
├─────────────────────────────────────────────────┤
│ After analyzing delays, you identify that       │
│ dependencies with another team are the issue.   │
│ That team reports to a different VP. How do     │
│ you escalate?                                   │
│                                                 │
│ [More complex scenario...]                      │
└─────────────────────────────────────────────────┘
    ↓
[Candidate selects wrong answer - INCORRECT]
    ↓
[System: "Adjusting difficulty..."]
    ↓
┌─────────────────────────────────────────────────┐
│ Question 3/~10                                  │
│ Difficulty: ●●●○○ (Medium) ← Adapted DOWN      │
├─────────────────────────────────────────────────┤
│ When communicating project delays to            │
│ stakeholders, what should you include?          │
│                                                 │
│ [Simpler, more straightforward question]        │
└─────────────────────────────────────────────────┘

... continues for 8-15 questions based on performance

Final Score:
┌─────────────────────────────────────────────────┐
│ Assessment Complete                             │
├─────────────────────────────────────────────────┤
│ Your Score: 78/100                              │
│ Estimated Ability: 6.5/10 (Senior-level)       │
│                                                 │
│ Questions Answered: 12                          │
│ Accuracy: 75% (9/12 correct)                    │
│                                                 │
│ Difficulty Progression:                         │
│ ●●●○○ → ●●●●○ → ●●●○○ → ●●●●○ → ...           │
│ (Medium → Hard → Medium → Hard...)              │
│                                                 │
│ You performed at SENIOR level                   │
└─────────────────────────────────────────────────┘
```

### Key UX Features:

1. **Difficulty Indicator:** Shows current question difficulty visually
2. **Dynamic Question Count:** "Question 3/~10" (approximate, adjusts based on performance)
3. **Real-time Adaptation:** "Adjusting difficulty..." message between questions
4. **Progress Visualization:** Shows difficulty progression at the end
5. **Ability Estimate:** Final score includes estimated ability level

---

## 🔧 TECHNICAL IMPLEMENTATION

### Database Schema Additions:

```sql
-- Adaptive Assessment Session
CREATE TABLE adaptive_assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_model_id UUID REFERENCES assessment_models(id),
  member_id UUID REFERENCES members(id),
  competency_id UUID REFERENCES competencies(id),
  
  -- Adaptive tracking
  initial_ability DECIMAL(4,2), -- 1.00 - 10.00
  current_ability DECIMAL(4,2),
  target_level VARCHAR(20), -- JUNIOR | MIDDLE | SENIOR | EXPERT
  
  -- Session state
  status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS | COMPLETED | ABANDONED
  questions_asked INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  metadata JSONB -- Store full session context
);

-- Runtime Generated Questions
CREATE TABLE runtime_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES adaptive_assessment_sessions(id),
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'MCQ',
  options JSONB,
  correct_answer TEXT,
  
  -- Adaptive metadata
  difficulty DECIMAL(4,2), -- 1.00 - 10.00
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Context used for generation
  generation_context JSONB,
  
  -- Response tracking
  candidate_answer TEXT,
  is_correct BOOLEAN,
  time_taken_seconds INT,
  answered_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_adaptive_sessions_member ON adaptive_assessment_sessions(member_id);
CREATE INDEX idx_adaptive_sessions_status ON adaptive_assessment_sessions(status);
CREATE INDEX idx_runtime_questions_session ON runtime_questions(session_id);
```

---

### API Endpoints:

**1. Start Adaptive Assessment**
```typescript
POST /api/assessments/adaptive/start

Request:
{
  "assessmentModelId": "uuid",
  "memberId": "uuid",
  "competencyId": "uuid"
}

Response:
{
  "sessionId": "uuid",
  "initialAbility": 5.0,
  "targetLevel": "MIDDLE",
  "firstQuestion": {
    "id": "uuid",
    "text": "...",
    "options": [...],
    "difficulty": 5.0
  }
}
```

**2. Submit Answer & Get Next Question**
```typescript
POST /api/assessments/adaptive/answer

Request:
{
  "sessionId": "uuid",
  "questionId": "uuid",
  "answer": "B",
  "timeTaken": 45 // seconds
}

Response:
{
  "wasCorrect": true,
  "explanation": "...",
  "abilityUpdate": 5.5, // Updated ability estimate
  "nextQuestion": {
    "id": "uuid",
    "text": "...",
    "options": [...],
    "difficulty": 6.0 // Adapted difficulty
  },
  "shouldContinue": true,
  "questionsRemaining": "~5" // Approximate
}
```

**3. Complete Assessment**
```typescript
POST /api/assessments/adaptive/complete

Request:
{
  "sessionId": "uuid"
}

Response:
{
  "finalScore": {
    "percentage": 78,
    "estimatedAbility": 6.5,
    "questionsAnswered": 12,
    "accuracy": 75,
    "difficultyProgression": [5.0, 6.0, 5.5, 6.5, ...]
  },
  "performanceLevel": "SENIOR",
  "strengths": ["Problem analysis", "Strategic thinking"],
  "improvements": ["Stakeholder communication"]
}
```

---

### Frontend Component:

**File:** `components/assessment/AdaptiveAssessment.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AdaptiveAssessmentProps {
  assessmentModelId: string;
  competencyId: string;
  competencyName: string;
  onComplete: (results: any) => void;
}

export function AdaptiveAssessment({
  assessmentModelId,
  competencyId,
  competencyName,
  onComplete
}: AdaptiveAssessmentProps) {
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  // Start session on mount
  useEffect(() => {
    startSession();
  }, []);
  
  const startSession = async () => {
    const response = await fetch('/api/assessments/adaptive/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentModelId,
        competencyId
      })
    });
    
    const data = await response.json();
    setSession(data);
    setCurrentQuestion(data.firstQuestion);
  };
  
  const submitAnswer = async () => {
    if (!selectedAnswer) return;
    
    setIsSubmitting(true);
    
    const response = await fetch('/api/assessments/adaptive/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeTaken: 60 // Track actual time
      })
    });
    
    const result = await response.json();
    
    // Show feedback
    setFeedback(result);
    
    // Wait 2 seconds, then show next question or complete
    setTimeout(() => {
      if (result.shouldContinue) {
        setCurrentQuestion(result.nextQuestion);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        completeAssessment();
      }
      setIsSubmitting(false);
    }, 2000);
  };
  
  const completeAssessment = async () => {
    const response = await fetch('/api/assessments/adaptive/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId
      })
    });
    
    const results = await response.json();
    onComplete(results);
  };
  
  if (!currentQuestion) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{competencyName}</CardTitle>
            <div className="text-sm text-gray-600">
              Question {session?.questionsAsked || 0} / ~{session?.estimatedTotal || 10}
            </div>
          </div>
          
          {/* Difficulty Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Difficulty:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded-full ${
                    level <= Math.round(currentQuestion.difficulty / 2)
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({currentQuestion.difficulty.toFixed(1)}/10)
            </span>
          </div>
        </CardHeader>
      </Card>
      
      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-lg">{currentQuestion.text}</p>
            
            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option: any, idx: number) => (
                <label
                  key={idx}
                  className={`
                    flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer
                    transition-all
                    ${selectedAnswer === option.key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${feedback && option.key === feedback.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : ''
                    }
                    ${feedback && selectedAnswer === option.key && !feedback.wasCorrect
                      ? 'border-red-500 bg-red-50'
                      : ''
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.key}
                    checked={selectedAnswer === option.key}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={!!feedback}
                    className="w-5 h-5"
                  />
                  <span>{option.key}. {option.text}</span>
                </label>
              ))}
            </div>
            
            {/* Feedback */}
            {feedback && (
              <div className={`
                p-4 rounded-lg
                ${feedback.wasCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}
              `}>
                <div className="font-semibold mb-2">
                  {feedback.wasCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="text-sm">{feedback.explanation}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Adjusting difficulty based on your performance...
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <Button
              onClick={submitAnswer}
              disabled={!selectedAnswer || isSubmitting || !!feedback}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Submit Answer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎯 BENEFITS OF ADAPTIVE ASSESSMENT

### 1. More Accurate Ability Measurement
- **Traditional:** 10 medium questions → 70% score (but is it truly 70% ability?)
- **Adaptive:** Adjusts to find exact ability level → 6.5/10 ability estimate

### 2. Better Candidate Experience
- Not too easy (boring)
- Not too hard (frustrating)
- Always at optimal challenge level

### 3. Fewer Questions Needed
- **Traditional:** Need 20-30 questions to assess accurately
- **Adaptive:** 8-15 questions give same accuracy

### 4. Prevents Cheating
- Questions are generated on-the-fly
- Each candidate gets different questions
- Cannot share questions with others

### 5. Context-Aware Follow-ups
- If candidate mentions specific experience, AI can probe deeper
- If candidate struggles with concept A, AI can test related concept B
- More intelligent assessment than static questions

---

## 🚀 IMPLEMENTATION PRIORITY

**When to Implement:**
- ✅ After core assessment builder is stable
- ✅ After static assessments are working well
- ✅ After AI question generation is proven
- ✅ As an ENHANCEMENT, not a replacement

**Recommended Phase:**
- **Phase 1:** Build and perfect static assessments
- **Phase 2:** Add AI question generation for admin
- **Phase 3:** Add runtime AI generation (this feature)

**Estimated Timeline:**
- Backend logic: 3-4 days
- Frontend UI: 2-3 days
- Testing & tuning: 2-3 days
- **Total: 1-2 weeks**

---

## ✅ SUCCESS CRITERIA

Implementation is successful when:

1. ✅ Assessment starts at appropriate baseline difficulty
2. ✅ Difficulty increases when candidate performs well
3. ✅ Difficulty decreases when candidate struggles
4. ✅ Assessment completes in 8-15 questions
5. ✅ Final ability estimate is accurate (validated against static tests)
6. ✅ Questions are contextually relevant (not repetitive)
7. ✅ Candidate experience is smooth (no lag between questions)
8. ✅ Each candidate gets unique questions (prevents cheating)

---

## 📝 FINAL NOTES

This is an **advanced feature** that should be implemented AFTER:
- ✅ Core assessment builder
- ✅ Static question banks
- ✅ AI question generation (admin side)
- ✅ Manual entry and bulk upload
- ✅ Basic assessment taking and scoring

**Priority Level:** Medium-High (nice to have, not critical)

**Business Value:** High (better accuracy, better UX, anti-cheating)

**Technical Complexity:** High (requires careful tuning of adaptive algorithm)

---

**This document provides the complete architecture for M9-5: Runtime AI Question Generation with Adaptive Difficulty.**
