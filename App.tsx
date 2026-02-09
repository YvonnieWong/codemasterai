
import React, { useState, useEffect } from 'react';
import { generateLearningModule } from './services/geminiService';
import { LearningModule, AppStatus } from './types';
import Quiz from './components/Quiz';

// Simple Markdown-like renderer for the content
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // Enhanced parsing to handle code blocks and basic formatting
  const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

  return (
    <div className="prose prose-invert max-w-none space-y-4">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/(\`\`\`[a-z]*\n)|(\`\`\`)/g, '');
          const langMatch = part.match(/\`\`\`([a-z]*)/);
          const lang = langMatch ? langMatch[1] : 'code';
          return (
            <div key={i} className="relative group">
              <div className="absolute top-0 right-0 p-2 text-xs text-slate-500 font-mono uppercase">
                {lang}
              </div>
              <pre className="p-4 rounded-lg bg-slate-900 overflow-x-auto border border-slate-700 code-font text-sm leading-relaxed">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }
        
        // Handle basic bold, italic, and headers (simple regex)
        let formatted = part
          .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2 text-blue-300">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-blue-400">$1</h2>')
          .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
          .replace(/\n/g, '<br />');

        return (
          <div 
            key={i} 
            className="text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [learningModule, setLearningModule] = useState<LearningModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'tutorial' | 'example' | 'quiz'>('explanation');

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError("Please paste some code first!");
      return;
    }

    setStatus(AppStatus.LOADING);
    setError(null);
    setLearningModule(null);

    try {
      const module = await generateLearningModule(code);
      setLearningModule(module);
      setStatus(AppStatus.SUCCESS);
      setActiveTab('explanation');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              C
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CodeMaster AI
            </h1>
          </div>
          <div className="hidden md:block text-slate-500 text-sm">
            Powered by Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-200">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Input Your Code
              </h2>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your function, class, or logic here... (e.g. a Python sorting algorithm)"
                className="w-full h-[400px] bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none code-font text-sm resize-none transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={status === AppStatus.LOADING}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center space-x-2 ${
                  status === AppStatus.LOADING 
                    ? 'bg-blue-800/50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'
                }`}
              >
                {status === AppStatus.LOADING ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating Learning Module...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Tutorial & Quiz</span>
                  </>
                )}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Help/Empty State info */}
            <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-xl">
              <h3 className="text-blue-400 font-semibold text-sm mb-2 uppercase tracking-wide">Tips</h3>
              <ul className="text-slate-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Include context if the snippet is part of a larger system.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  AI works best with code that has some logical depth.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Works for Python, JavaScript, Rust, C++, and many more.
                </li>
              </ul>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7">
            {status === AppStatus.IDLE && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl min-h-[500px] p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Learn?</h3>
                <p className="text-center max-w-sm">
                  Paste a code snippet on the left and hit "Generate" to transform it into an interactive learning experience.
                </p>
              </div>
            )}

            {status === AppStatus.LOADING && (
              <div className="space-y-6">
                <div className="h-12 w-full bg-slate-800 animate-pulse rounded-lg"></div>
                <div className="h-64 w-full bg-slate-800 animate-pulse rounded-2xl"></div>
                <div className="h-32 w-full bg-slate-800 animate-pulse rounded-xl"></div>
              </div>
            )}

            {status === AppStatus.SUCCESS && learningModule && (
              <div className="bg-slate-800/30 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Language Badge */}
                <div className="bg-slate-900/80 px-6 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">{learningModule.language} Module</span>
                  </div>
                  <button 
                    onClick={() => {
                      setLearningModule(null);
                      setStatus(AppStatus.IDLE);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4"
                  >
                    Clear All
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 bg-slate-800/50">
                  {[
                    { id: 'explanation', label: 'Explanation', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'tutorial', label: 'Tutorial', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                    { id: 'example', label: 'Pro Example', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                    { id: 'quiz', label: 'Quiz', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-4 px-2 flex flex-col items-center space-y-1 transition-all relative ${
                        activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="text-xs font-semibold">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                  {activeTab === 'explanation' && <MarkdownContent content={learningModule.explanation} />}
                  {activeTab === 'tutorial' && <MarkdownContent content={learningModule.tutorial} />}
                  {activeTab === 'example' && <MarkdownContent content={learningModule.example} />}
                  {activeTab === 'quiz' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <Quiz 
                        questions={learningModule.quiz} 
                        language={learningModule.language}
                        contextCode={code}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900 mt-12">
        <p>© {new Date().getFullYear()} CodeMaster AI Tutor. Built for the future of learning.</p>
      </footer>
    </div>
  );
};

export default App;
