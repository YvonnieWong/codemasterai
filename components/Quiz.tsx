
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
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
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <div className="h-1.5 w-32 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, index) => {
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

      {showFeedback && (
        <div className={`mb-8 p-4 rounded-lg border ${selectedOption === currentQuestion.correctAnswerIndex ? 'bg-green-900/20 border-green-800/50' : 'bg-red-900/20 border-red-800/50'}`}>
          <p className="font-medium mb-1">
            {selectedOption === currentQuestion.correctAnswerIndex ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showFeedback ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-8 py-2 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 rounded-lg transition-colors font-medium"
          >
            Submit Answer
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
