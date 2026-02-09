
import React, { useState, useEffect } from 'react';
import { QuizQuestion, CodeEvaluation } from '../types';
import { evaluateCodeAnswer } from '../services/geminiService';

interface QuizProps {
  questions: QuizQuestion[];
  language: string;
  contextCode: string;
}

const Quiz: React.FC<QuizProps> = ({ questions, language, contextCode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userCode, setUserCode] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<CodeEvaluation | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Initialize code for code questions
  useEffect(() => {
    if (currentQuestion.type === 'code' && currentQuestion.starterCode) {
      setUserCode(currentQuestion.starterCode);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (currentQuestion.type === 'choice') {
      if (selectedOption === null) return;
      if (selectedOption === currentQuestion.correctAnswerIndex) {
        setScore(prev => prev + 1);
      }
      setShowFeedback(true);
    } else {
      if (!userCode.trim()) return;
      setIsEvaluating(true);
      const result = await evaluateCodeAnswer(
        currentQuestion.task || currentQuestion.question,
        userCode,
        language,
        contextCode
      );
      setCodeFeedback(result);
      if (result.isCorrect) {
        setScore(prev => prev + 1);
      }
      setIsEvaluating(false);
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setUserCode('');
      setCodeFeedback(null);
      setShowFeedback(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserCode('');
    setCodeFeedback(null);
    setShowFeedback(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
        <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
        <p className="text-4xl font-bold text-blue-400 mb-2">{score} / {questions.length}</p>
        <p className="text-slate-400 mb-6">
          {score === questions.length ? "Perfect! You've mastered this concept." : "Good effort! Keep practicing."}
        </p>
        <button 
          onClick={resetQuiz}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            {currentQuestion.type === 'code' ? 'Code Challenge' : 'Multiple Choice'}
          </span>
          <span className="text-sm font-medium text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="h-1.5 w-32 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">{currentQuestion.question}</h3>
      {currentQuestion.type === 'code' && (
        <p className="text-slate-400 text-sm mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 italic">
          <strong>Task:</strong> {currentQuestion.task}
        </p>
      )}

      {/* Multiple Choice Layout */}
      {currentQuestion.type === 'choice' && (
        <div className="space-y-3 mb-8 mt-6">
          {currentQuestion.options?.map((option, index) => {
            let variant = "bg-slate-700 hover:bg-slate-600 border-slate-600";
            if (selectedOption === index) {
              variant = "bg-blue-900/30 border-blue-500 ring-1 ring-blue-500";
            }
            if (showFeedback) {
              if (index === currentQuestion.correctAnswerIndex) {
                variant = "bg-green-900/30 border-green-500 text-green-200";
              } else if (selectedOption === index) {
                variant = "bg-red-900/30 border-red-500 text-red-200";
              } else {
                variant = "bg-slate-700/50 border-slate-700 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${variant}`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 mr-3 text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Code Challenge Layout */}
      {currentQuestion.type === 'code' && (
        <div className="mb-8 mt-4">
          <div className="relative">
            <div className="absolute top-0 right-0 p-2 text-xs text-slate-500 font-mono uppercase bg-slate-900/80 rounded-bl-lg border-l border-b border-slate-700">
              {language} Editor
            </div>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              disabled={showFeedback || isEvaluating}
              className="w-full h-48 bg-slate-900 text-slate-300 p-6 rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none code-font text-sm leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {showFeedback && (
        <div className={`mb-8 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${
          (currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswerIndex) ||
          (currentQuestion.type === 'code' && codeFeedback?.isCorrect)
            ? 'bg-green-900/20 border-green-800/50' 
            : 'bg-red-900/20 border-red-800/50'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-sm font-bold uppercase ${
              (currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswerIndex) ||
              (currentQuestion.type === 'code' && codeFeedback?.isCorrect)
                ? 'text-green-400' : 'text-red-400'
            }`}>
              {(currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswerIndex) ||
              (currentQuestion.type === 'code' && codeFeedback?.isCorrect)
                ? 'Great Job!' : 'Keep Learning'}
            </span>
            {currentQuestion.type === 'code' && codeFeedback && (
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-400">
                AI Score: {codeFeedback.score}%
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentQuestion.type === 'choice' 
              ? currentQuestion.explanation 
              : codeFeedback?.feedback || currentQuestion.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!showFeedback ? (
          <button
            onClick={handleSubmit}
            disabled={
              (currentQuestion.type === 'choice' && selectedOption === null) || 
              (currentQuestion.type === 'code' && !userCode.trim()) ||
              isEvaluating
            }
            className={`px-8 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2 ${
              isEvaluating ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isEvaluating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Evaluating...</span>
              </>
            ) : (
              <span>Submit Answer</span>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
