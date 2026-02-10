
import React, { useState, useEffect } from 'react';
import { generateLearningModule } from './services/geminiService';
import { LearningModule, AppStatus } from './types';
import Quiz from './components/Quiz';

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

  return (
    <div className="prose prose-invert max-w-none space-y-4">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/(\`\`\`[a-z]*\n)|(\`\`\`)/g, '');
          const langMatch = part.match(/\`\`\`([a-z]*)/);
          const lang = langMatch ? langMatch[1] : 'SYSTEM_NODE';
          return (
            <div key={i} className="relative group my-4">
              <div className="absolute top-0 right-0 p-2 text-[10px] text-[#00f0ff] font-mono uppercase bg-black/80 border-b border-l border-[#00f0ff]">
                DATA_STRATUM: {lang}
              </div>
              <pre className="p-5 bg-black/90 overflow-x-auto border-l-2 border-[#00f0ff] code-font text-sm leading-relaxed text-[#00f0ff]/90">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }
        
        let formatted = part
          .replace(/^### (.*$)/gim, '<h3 class="text-xl font-black mt-6 mb-2 text-[#fcee0a] uppercase tracking-tighter italic">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black mt-8 mb-4 text-[#ff003c] uppercase tracking-widest">$1</h2>')
          .replace(/^\* (.*$)/gim, '<li class="ml-4 list-none text-slate-300 border-l-2 border-[#00f0ff] pl-3 mb-2">$1</li>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#00f0ff]">$1</strong>')
          .replace(/\n/g, '<br />');

        return (
          <div 
            key={i} 
            className="text-slate-300 leading-relaxed font-medium"
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
      setError("CRITICAL_ERROR: NULL_INPUT_DETECTED");
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
      setError("UPLINK_FAILURE: " + (err.message || "UNKNOWN_ERROR"));
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#fcee0a] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-[#fcee0a] bg-black/90 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#fcee0a] flex items-center justify-center font-black text-black text-2xl skew-x-[-10deg]">
              2077
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-[#fcee0a] uppercase leading-none">
                Cyber-Tutor
              </h1>
              <span className="text-[10px] text-[#00f0ff] font-bold tracking-[0.2em] uppercase">Neural Net Interface</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
            <span className="animate-pulse">● SYSTEM_ONLINE</span>
            <span className="opacity-50">BRAINDANCE_ACTIVE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="cyber-card p-6 border-r-2 border-[#00f0ff]/20">
              <h2 className="text-sm font-black mb-4 flex items-center text-[#00f0ff] uppercase tracking-[0.3em]">
                <span className="w-2 h-2 bg-[#00f0ff] mr-2"></span>
                Input_Sequence
              </h2>
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Inject source code for analysis..."
                  className="w-full h-[450px] bg-black text-[#00f0ff] p-5 border border-[#00f0ff]/30 focus:border-[#fcee0a] outline-none code-font text-sm resize-none transition-all placeholder:text-[#00f0ff]/30"
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-[#00f0ff]/50 font-mono">
                  CHR_COUNT: {code.length}
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={status === AppStatus.LOADING}
                className={`w-full mt-6 py-5 cyber-button flex items-center justify-center space-x-3 text-lg ${
                  status === AppStatus.LOADING ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                {status === AppStatus.LOADING ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin"></div>
                    <span>Decrypting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Initiate Analysis</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-[#ff003c]/10 border border-[#ff003c] text-[#ff003c] text-xs font-bold uppercase tracking-tighter">
                  {error}
                </div>
              )}
            </div>

            <div className="border border-[#00f0ff]/20 p-4 bg-[#00f0ff]/5">
              <h3 className="text-[#fcee0a] font-black text-xs mb-3 uppercase italic">Operational_Protocols</h3>
              <div className="space-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center"><span className="w-1 h-1 bg-[#00f0ff] mr-2"></span> Complex Logic Processing</div>
                <div className="flex items-center"><span className="w-1 h-1 bg-[#00f0ff] mr-2"></span> Multi-Language Synthesis</div>
                <div className="flex items-center"><span className="w-1 h-1 bg-[#00f0ff] mr-2"></span> Real-time Quiz Generation</div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7">
            {status === AppStatus.IDLE && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 border border-[#00f0ff]/10 bg-black/40 min-h-[600px] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]"></div>
                <div className="w-24 h-24 border-2 border-[#00f0ff]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <svg className="w-12 h-12 text-[#00f0ff]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-[#00f0ff]/40 uppercase tracking-[0.5em] mb-2">Awaiting_Data</h3>
                <p className="text-center max-w-xs text-xs font-bold text-slate-600 uppercase tracking-widest leading-loose">
                  Neural link disconnected. Please inject source code to begin sequence.
                </p>
              </div>
            )}

            {status === AppStatus.LOADING && (
              <div className="space-y-6">
                <div className="h-14 w-full bg-[#00f0ff]/5 animate-pulse border-b border-[#00f0ff]/20"></div>
                <div className="h-[500px] w-full bg-[#00f0ff]/5 animate-pulse border-l-4 border-[#00f0ff]/20"></div>
              </div>
            )}

            {status === AppStatus.SUCCESS && learningModule && (
              <div className="flex flex-col h-full bg-black border-2 border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                {/* Tabs */}
                <div className="flex border-b border-[#00f0ff]/30 bg-black/90">
                  {[
                    { id: 'explanation', label: 'DECRYPT', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'tutorial', label: 'PROTOCOLS', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                    { id: 'example', label: 'SANDBOX', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                    { id: 'quiz', label: 'EVALUATION', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-5 flex flex-col items-center space-y-1 transition-all border-r border-[#00f0ff]/10 last:border-0 ${
                        activeTab === tab.id ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'text-slate-600 hover:text-[#00f0ff]/60'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fcee0a]"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="p-8 grow overflow-y-auto max-h-[75vh]">
                  {activeTab === 'explanation' && <MarkdownContent content={learningModule.explanation} />}
                  {activeTab === 'tutorial' && <MarkdownContent content={learningModule.tutorial} />}
                  {activeTab === 'example' && <MarkdownContent content={learningModule.example} />}
                  {activeTab === 'quiz' && (
                    <Quiz 
                      questions={learningModule.quiz} 
                      language={learningModule.language}
                      contextCode={code}
                    />
                  )}
                </div>

                {/* Language Footer */}
                <div className="px-6 py-2 bg-[#fcee0a] flex items-center justify-between">
                   <span className="text-[10px] font-black text-black uppercase tracking-widest">
                    MODULE: {learningModule.language.toUpperCase()}
                   </span>
                   <span className="text-[10px] font-black text-black/50 uppercase">
                    v2.77.AI
                   </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 bg-black border-t-2 border-[#00f0ff]/10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase">
          <p>© 2077 NIGHT_CITY_EDUCATIONAL_DISTRICT</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:text-[#00f0ff] cursor-pointer">TERMINAL_ACCESS</span>
            <span className="hover:text-[#00f0ff] cursor-pointer">NEURAL_POLICY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
