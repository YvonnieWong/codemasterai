
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
  const [revealSolution, setRevealSolution] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

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
      setRevealSolution(false);
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
    setRevealSolution(false);
  };

  if (quizFinished) {
    return (
      <div className="bg-black p-10 border-4 border-[#fcee0a] text-center">
        <h3 className="text-3xl font-black mb-4 text-[#fcee0a] italic uppercase italic">EVALUATION_COMPLETE</h3>
        <div className="text-6xl font-black text-[#00f0ff] mb-4 tracking-tighter">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
          Synchronization Level: {score} of {questions.length} Nodes
        </p>
        <button 
          onClick={resetQuiz}
          className="cyber-button px-10 py-4"
        >
          REBOOT_SEQUENCE
        </button>
      </div>
    );
  }

  const isCurrentAnswerCorrect = currentQuestion.type === 'choice' 
    ? selectedOption === currentQuestion.correctAnswerIndex
    : codeFeedback?.isCorrect;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-2 border-[#00f0ff]/20 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#fcee0a] uppercase tracking-[0.4em] mb-1 block">
            {currentQuestion.type === 'code' ? 'NEURAL_CONSTRUCT' : 'LOGIC_GATE'}
          </span>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            NODE {currentQuestionIndex + 1} / {questions.length}
          </h3>
        </div>
        <div className="h-4 w-40 bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-0.5">
          <div 
            className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)] transition-all duration-700" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
          {currentQuestion.question}
        </h3>
        {currentQuestion.type === 'code' && (
          <div className="bg-[#00f0ff]/5 border-l-2 border-[#00f0ff] p-4 text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest leading-loose">
            TASK_PARAM: {currentQuestion.task}
          </div>
        )}
      </div>

      {currentQuestion.type === 'choice' && (
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options?.map((option, index) => {
            let style = "border-[#00f0ff]/20 bg-black text-slate-400 hover:border-[#00f0ff]/60 hover:text-white";
            if (selectedOption === index) style = "border-[#fcee0a] bg-[#fcee0a]/10 text-[#fcee0a]";
            if (showFeedback) {
              if (index === currentQuestion.correctAnswerIndex) style = "border-[#00ff00] bg-[#00ff00]/10 text-[#00ff00]";
              else if (selectedOption === index) style = "border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c]";
              else style = "border-[#00f0ff]/5 bg-black text-slate-700 opacity-40";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback}
                className={`text-left p-5 border-2 transition-all group relative ${style}`}
              >
                <div className="flex items-center">
                  <span className="font-black mr-4 text-xs opacity-50">[{index.toString().padStart(2, '0')}]</span>
                  <span className="font-bold uppercase tracking-tight text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {currentQuestion.type === 'code' && (
        <div className="relative">
          <div className="absolute top-0 right-0 p-2 text-[9px] text-[#00f0ff] font-mono uppercase z-10 bg-black/80 border-l border-b border-[#00f0ff]/30">
            BUFFER_STREAM: {language}
          </div>
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            disabled={showFeedback || isEvaluating}
            className="w-full h-64 bg-black text-[#00f0ff] p-6 border-2 border-[#00f0ff]/30 focus:border-[#fcee0a] outline-none code-font text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
      )}

      {showFeedback && (
        <div className={`p-6 border-l-4 animate-in slide-in-from-left-4 duration-500 ${
          isCurrentAnswerCorrect ? 'bg-[#00ff00]/5 border-[#00ff00]' : 'bg-[#ff003c]/5 border-[#ff003c]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-black uppercase tracking-[0.3em] ${isCurrentAnswerCorrect ? 'text-[#00ff00]' : 'text-[#ff003c]'}`}>
              {isCurrentAnswerCorrect ? 'SYNERGY_OPTIMAL' : 'CORE_CONFLICT_DETECTED'}
            </span>
            {currentQuestion.type === 'code' && codeFeedback && (
              <span className="text-[10px] font-black text-slate-500">SYNC_VAL: {codeFeedback.score}%</span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-loose">
            {currentQuestion.type === 'choice' ? currentQuestion.explanation : codeFeedback?.feedback}
          </p>

          {!isCurrentAnswerCorrect && currentQuestion.type === 'code' && currentQuestion.solution && (
            <div className="mt-6">
              {!revealSolution ? (
                <button 
                  onClick={() => setRevealSolution(true)}
                  className="text-[10px] font-black text-[#fcee0a] hover:underline uppercase tracking-widest"
                >
                  [OVERRIDE_VIEW_CANONICAL_SOURCE]
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CANONICAL_SOURCE:</span>
                  <pre className="p-4 bg-black/80 border border-[#fcee0a]/30 text-[#fcee0a]/80 code-font text-xs overflow-x-auto">
                    {currentQuestion.solution}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-6">
        {!showFeedback ? (
          <button
            onClick={handleSubmit}
            disabled={(currentQuestion.type === 'choice' && selectedOption === null) || (currentQuestion.type === 'code' && !userCode.trim()) || isEvaluating}
            className={`cyber-button px-12 py-4 ${isEvaluating ? 'opacity-50 animate-pulse' : ''}`}
          >
            {isEvaluating ? 'PROCESSING...' : 'TRANSMIT'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="cyber-button px-12 py-4"
          >
            {currentQuestionIndex === questions.length - 1 ? 'LOG_OUT' : 'NEXT_NODE'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
