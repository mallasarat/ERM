import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ListChecks, 
  AlertCircle, 
  Activity, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  FileText, 
  ArrowUpRight, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Globe, 
  MessageSquare, 
  Send, 
  Users, 
  Building2, 
  Network, 
  Cpu, 
  Boxes, 
  BarChart3, 
  LogOut,
  Zap,
  Check,
  X,
  PlusCircle,
  Database,
  Bot,
  Minimize2,
  Maximize2,
  Settings,
  ArrowLeft,
  Navigation,
  Layers,
  History,
  Map,
  Filter,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  Legend,
  ReferenceLine,
  PolarRadiusAxis
} from "recharts";

// ── CONSTANTS ───────────────────────────────────────────────────────

const STYLES = {
  mono: "font-mono tracking-tight",
  heading: "font-mono font-bold uppercase tracking-[0.2em] text-[11px] text-sky-700",
  card: "bg-white border border-sky-100 rounded-2xl p-6 relative group overflow-hidden shadow-[0_18px_50px_rgba(37,99,235,0.08)]",
  gridLine: "absolute inset-0 border border-sky-50 pointer-events-none rounded-2xl",
};

const formatLabel = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const labelMap: Record<string, string> = {
    target: "Target",
    industry: "Industry",
    peer: "Peers",
    peers: "Peers",
    external: "External Reference",
  };

  if (labelMap[normalized]) {
    return labelMap[normalized];
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ── COMPONENTS ──────────────────────────────────────────────────────

const Card = ({ children, className = "", noPadding = false, ...props }: any) => (
  <div className={`${STYLES.card} ${noPadding ? 'p-0' : 'p-6'} ${className}`} {...props}>
    <div className={STYLES.gridLine} />
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: "blue" | "emerald" | "rose" | "orange" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

// ── RISKXAI ASSISTANT ─────────────────────────────────────────────

const getAssistantReply = (prompt: string, analysis: any) => {
  const normalized = prompt.toLowerCase();

  if (!analysis) {
    if (normalized.includes("weight") || normalized.includes("score")) {
      return "RISK X AI uses a two-dimensional weighting model: dimension-weighted scoring inside each pillar, then a pillar-weighted rollup into the overall maturity score.";
    }

    if (normalized.includes("benchmark") || normalized.includes("peer") || normalized.includes("industry") || normalized.includes("external")) {
      return "Benchmarking compares the selected business unit against target, industry, peers, or external reference baselines across all 10 pillars.";
    }

    if (normalized.includes("roadmap") || normalized.includes("action")) {
      return "Roadmap actions are prioritized by expected uplift versus delivery cost and duration, then sequenced into Phase 1, Phase 2, and Phase 3.";
    }

    return "This RISK X AI demo captures questionnaire responses, computes weighted maturity scores, detects drift, compares benchmarks, and generates a phased improvement roadmap.";
  }

  const weakestPillar = [...analysis.analytics].sort((a: any, b: any) => b.gap - a.gap)[0];
  const topRoadmap = analysis.roadmap?.[0];

  if (normalized.includes("weak") || normalized.includes("gap")) {
    if (!weakestPillar) {
      return "All pillars are currently aligned with the selected benchmark.";
    }

    return `${weakestPillar.pillarName} is the primary gap at ${weakestPillar.score.toFixed(2)}/5 versus a ${weakestPillar.target.toFixed(2)} ${formatLabel(analysis.benchmarkType)} benchmark. The gap is ${weakestPillar.gap.toFixed(2)} points.`;
  }

  if (normalized.includes("benchmark") || normalized.includes("target") || normalized.includes("peer") || normalized.includes("industry")) {
    return `The current benchmark profile is ${formatLabel(analysis.benchmarkType)} with an average reference score of ${analysis.benchmarkAverage.toFixed(2)}. ${analysis.systemIntegrity}% of pillars are currently meeting or exceeding that baseline.`;
  }

  if (normalized.includes("drift") || normalized.includes("regression")) {
    if (!analysis.regressions?.length) {
      return "No negative drift is currently detected across the assessed pillars.";
    }

    return `${analysis.regressions.length} regression signal(s) are active. The most severe is ${analysis.regressions[0].pillarName} at ${analysis.regressions[0].delta.toFixed(3)}.`;
  }

  if (normalized.includes("roadmap") || normalized.includes("action") || normalized.includes("phase")) {
    if (!topRoadmap) {
      return "No roadmap actions are required because the selected business unit is already aligned with the benchmark profile.";
    }

    return `Top priority is ${topRoadmap.description} in ${topRoadmap.phase}, with an expected uplift of ${topRoadmap.expectedUplift.toFixed(1)} and a priority score of ${topRoadmap.priorityScore.toFixed(2)}.`;
  }

  if (normalized.includes("evidence") || normalized.includes("note")) {
    return `${analysis.responseSummary.evidenceCount} responses include evidence and ${analysis.responseSummary.noteCount} include analyst notes. Last response timestamp: ${new Date(analysis.responseSummary.lastAnsweredAt).toLocaleString()}.`;
  }

  return `Overall maturity is ${analysis.overallScore.toFixed(2)} with mission status ${analysis.missionStatus.replaceAll("_", " ")}. Ask about gaps, benchmarks, drift, roadmap actions, or response coverage.`;
};

const NavigatorAssistant = ({ analysis }: { analysis?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    window.setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getAssistantReply(userMsg, analysis) }]);
      setLoading(false);
    }, 250);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-[100] border border-blue-200">
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white border border-sky-100 shadow-2xl z-[101] flex flex-col font-mono text-[11px] overflow-hidden rounded-2xl">
            <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bot size={16} className="text-blue-600" /><span className="font-bold uppercase tracking-widest text-slate-900">RISK X AI Assistant</span></div>
              <button onClick={() => setIsOpen(false)}><Minimize2 size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center py-8 opacity-40 uppercase tracking-[0.2em]">Ready for queries</div>
                  <div className="p-3 bg-sky-50 border border-sky-100 text-slate-700 leading-relaxed rounded-xl">
                    Ask about the scoring matrix, benchmark logic, drift detection, roadmap sequencing, or evidence coverage.
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-[85%] rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-sky-50 border border-sky-100 text-slate-700'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-blue-600 animate-pulse uppercase tracking-widest">Processing...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-sky-100 bg-white flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent outline-none text-slate-900 border-b border-sky-200 text-[11px] font-mono" placeholder="Ask about gaps, drift, or benchmarks..." />
              <button onClick={handleSend} className="text-blue-600"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── VECTOR CAPTURE PIPELINE ───────────────────────────────────────────

const VectorCapturePipeline = ({ questions, pillars, bu, onComplete, onBack }: any) => {
  const [currIdx, setCurrIdx] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [evidenceNames, setEvidenceNames] = useState<Record<number, string>>({});
  const [answeredAt, setAnsweredAt] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const currentQ = questions[currIdx];
  const currentPillar = pillars.find((p: any) => p.id === currentQ.pillarId);
  const progress = (Object.keys(responses).length / questions.length) * 100;
  const isAnswered = responses[currentQ.id] !== undefined;
  const allAnswered = Object.keys(responses).length === questions.length;
  const noteCount = Object.values(notes).filter(Boolean).length;
  const evidenceCount = Object.values(evidenceNames).filter(Boolean).length;
  const lastAnsweredAt = Object.values(answeredAt).sort().at(-1) as string | undefined;

  const handleAnswer = (score: number) => {
    const timestamp = new Date().toISOString();
    const newResponses = { ...responses, [currentQ.id]: score };
    setResponses(newResponses);
    setAnsweredAt((prev) => ({ ...prev, [currentQ.id]: timestamp }));
    
    if (currIdx < questions.length - 1) {
      setTimeout(() => setCurrIdx(currIdx + 1), 200);
    } else {
      if (Object.keys(newResponses).length === questions.length) {
        setShowSummary(true);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await onComplete({ responses, notes, evidenceNames, answeredAt });
    } catch (e) {
        alert("Assessment submission failed. Please verify all required responses.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const pillarsProgress = useMemo(() => {
    return pillars.map((p: any) => {
      const pQuestions = questions.filter((q: any) => q.pillarId === p.id);
      const answered = pQuestions.filter((q: any) => responses[q.id] !== undefined).length;
      return { ...p, answered, total: pQuestions.length };
    });
  }, [pillars, questions, responses]);

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto p-12 min-h-screen">
        <header className="mb-12">
           <p className={STYLES.heading}>Assessment Summary</p>
           <h1 className="text-4xl font-black text-slate-900 tracking-widest mt-4 uppercase">Assessment Completion Check</h1>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
           {pillarsProgress.map((p: any) => (
             <Card key={p.id} className="flex justify-between items-center bg-sky-50 border-sky-100">
                <div>
                   <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">{p.name}</p>
                   <p className="text-slate-900 font-mono font-bold">{p.answered} / {p.total} Questions</p>
                </div>
                {p.answered === p.total ? <CheckCircle2 className="text-blue-600" size={20} /> : <AlertCircle className="text-rose-500" size={20} />}
             </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-sky-50 border-sky-100">
            <p className={STYLES.heading}>Analyst Notes</p>
            <p className="mt-3 text-3xl font-black text-slate-900 font-mono">{noteCount}</p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Responses with supporting commentary</p>
          </Card>
          <Card className="bg-sky-50 border-sky-100">
            <p className={STYLES.heading}>Evidence References</p>
            <p className="mt-3 text-3xl font-black text-slate-900 font-mono">{evidenceCount}</p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Uploaded proof references captured</p>
          </Card>
          <Card className="bg-sky-50 border-sky-100">
            <p className={STYLES.heading}>Last Timestamp</p>
            <p className="mt-3 text-sm font-bold text-slate-900">{lastAnsweredAt ? new Date(lastAnsweredAt).toLocaleString() : "Pending"}</p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Autogenerated on each score selection</p>
          </Card>
        </div>

        <div className="flex gap-4">
           <button onClick={() => setShowSummary(false)} className="flex-1 py-4 border border-sky-200 text-slate-900 font-mono uppercase text-[12px] hover:bg-sky-50 tracking-widest rounded-2xl">Back to Questionnaire</button>
           <button 
             onClick={handleSubmit} 
             disabled={!allAnswered || isSubmitting} 
             className="flex-1 py-4 bg-blue-600 text-white font-mono font-black uppercase text-[12px] tracking-widest hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl"
           >
             {isSubmitting ? "Calculating Scores..." : "Finalize Assessment"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white/80 border-r border-sky-100 p-6 flex flex-col overflow-hidden backdrop-blur-sm">
        <div className="mb-8">
           <p className={STYLES.heading}>Pillar Overview</p>
           <div className="mt-4 h-1 bg-sky-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.35)]" />
           </div>
           <p className="text-[9px] font-mono text-slate-500 mt-2 uppercase tracking-widest">{progress.toFixed(0)}% Assessment Completion</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
           {pillarsProgress.map((p: any) => (
             <button 
               key={p.id} 
               onClick={() => {
                 const firstQIdx = questions.findIndex((q: any) => q.pillarId === p.id);
                 setCurrIdx(firstQIdx);
               }}
               className={`w-full p-3 text-left border rounded-2xl ${currentPillar.id === p.id ? 'bg-blue-50 border-blue-200' : 'bg-transparent border-transparent hover:bg-sky-50'} transition-all group`}
             >
               <div className="flex justify-between items-center mb-1">
                 <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${currentPillar.id === p.id ? 'text-blue-700' : 'text-slate-500'}`}>
                   {p.name}
                 </span>
                 <span className="text-[8px] font-mono text-slate-600">{p.answered}/{p.total}</span>
               </div>
               <div className="h-0.5 w-full bg-sky-100">
                  <div className="h-full bg-blue-500/60" style={{ width: `${(p.answered / p.total) * 100}%` }} />
               </div>
             </button>
           ))}
        </div>

        <button onClick={onBack} className="mt-8 flex items-center gap-2 text-slate-500 hover:text-blue-700 font-mono uppercase text-[10px] tracking-widest border-t border-sky-100 pt-8">
          <RotateCcw size={14} /> Reset Pipeline
        </button>
      </aside>

      {/* Main Questionnaire Stage */}
      <main className="flex-1 p-16 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,rgba(239,246,255,0.95)_72%)]">
        <div className="max-w-2xl w-full">
           <div className="mb-12">
              <div className="flex gap-3 mb-6">
                 <Badge color="blue">{currentPillar.name}</Badge>
                 <Badge color="orange">{currentQ.dimensionId}</Badge>
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">{currentQ.text}</h2>
              <p className="mt-6 text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Question {currIdx + 1} of {questions.length}</p>
           </div>

           <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(score => (
                <button 
                  key={score} 
                  onClick={() => handleAnswer(score)} 
                  className={`aspect-square flex flex-col items-center justify-center border rounded-2xl transition-all ${responses[currentQ.id] === score ? 'bg-blue-600 border-blue-500 shadow-[0_0_24px_rgba(37,99,235,0.25)]' : 'bg-white border-sky-100 hover:border-blue-400'}`}
                >
                   <span className={`text-2xl font-black ${responses[currentQ.id] === score ? 'text-white' : 'text-slate-900'}`}>{score}</span>
                   <span className={`text-[7px] uppercase font-mono tracking-widest mt-1 ${responses[currentQ.id] === score ? 'text-blue-100' : 'text-slate-400'}`}>Lvl</span>
                </button>
              ))}
           </div>

           <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className={STYLES.heading}>Analyst Note</p>
                <textarea
                  value={notes[currentQ.id] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                  className="w-full min-h-32 bg-white border border-sky-100 p-4 text-slate-900 text-sm outline-none focus:border-blue-500 resize-none rounded-2xl"
                  placeholder="Capture context, assumptions, or control observations for this question..."
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className={STYLES.heading}>Evidence Reference</p>
                  <label className="flex items-center justify-between gap-4 border border-dashed border-sky-200 bg-white px-4 py-4 cursor-pointer hover:border-blue-500/50 transition-colors rounded-2xl">
                    <span className="text-sm text-slate-900">{evidenceNames[currentQ.id] || "Attach supporting file reference"}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600">Select File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setEvidenceNames((prev) => ({ ...prev, [currentQ.id]: file?.name || "" }));
                      }}
                    />
                  </label>
                </div>
                <div className="border border-sky-100 bg-sky-50 p-4 rounded-2xl">
                  <p className={STYLES.heading}>Response Details</p>
                  <div className="mt-4 space-y-2 text-[11px] text-slate-700">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono">Score</span>
                      <span>{isAnswered ? `${responses[currentQ.id]}/5` : "Pending"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono">Timestamp</span>
                      <span>{answeredAt[currentQ.id] ? new Date(answeredAt[currentQ.id]).toLocaleString() : "Autogenerated on answer"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono">Evidence</span>
                      <span>{evidenceNames[currentQ.id] || "None attached"}</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="mt-16 flex items-center justify-between">
              <button 
                onClick={() => setCurrIdx(Math.max(0, currIdx - 1))} 
                disabled={currIdx === 0} 
                className="p-4 border border-sky-200 text-slate-500 hover:text-blue-700 disabled:opacity-0 transition-all rounded-2xl"
              >
                <ChevronLeft size={20} />
              </button>

              {allAnswered && (
                <button 
                  onClick={() => setShowSummary(true)} 
                  className="px-10 py-4 bg-blue-600 text-white font-mono font-black uppercase text-[12px] tracking-widest hover:bg-blue-500 transition-all shadow-xl rounded-2xl"
                >
                   Review Responses
                </button>
              )}

              <button 
                onClick={() => setCurrIdx(Math.min(questions.length - 1, currIdx + 1))} 
                disabled={!isAnswered || currIdx === questions.length - 1} 
                className="p-4 border border-sky-200 text-slate-900 hover:border-blue-400 disabled:opacity-20 transition-all rounded-2xl"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

// ── RNOS COMMAND CENTER ───────────────────────────────────────────

const RNOSCommandCenter = ({ analysis, bu, allBUs, benchmarkTypes, benchmarkType, onBenchmarkTypeChange, onEntityChange, onBack }: any) => {
  const { 
    analytics, 
    dimensions, 
    driftProfile, 
    regressions, 
    roadmap, 
    overallScore, 
    systemIntegrity, 
    entityName,
    criticalRegressionsCount,
    activeRoadmapCount,
    targetBaseline,
    benchmarkAverage,
    averageGap,
    responseSummary,
    missionStatus,
    isSynced
  } = analysis;
  
  const radarData = useMemo(() => analytics.map((a: any) => ({
    pillar: a.pillarName,
    score: a.score,
    target: a.target,
    fullMark: 5
  })), [analytics]);

  const benchmarkComparisonData = useMemo(() => analytics.map((item: any) => ({
    pillar: item.pillarName,
    score: item.score,
    benchmark: item.target,
    gap: item.gap,
  })), [analytics]);

  const alignedPillarCount = analytics.filter((item: any) => item.score >= item.target).length;

  const StatusDisplay = ({ status }: { status: string }) => {
    const colors: any = {
      NOMINAL_SYNC: "text-blue-700 border-blue-200 bg-blue-50",
      CRITICAL_GAP: "text-rose-500 border-rose-200 bg-rose-50",
      VECTOR_DRIFT: "text-amber-600 border-amber-200 bg-amber-50",
      STRUCTURAL_WEAKNESS: "text-rose-600 border-rose-200 bg-rose-50"
    };
    return (
      <div className={`px-4 py-2 border rounded-2xl font-mono text-[10px] font-black tracking-[0.3em] flex items-center gap-3 ${colors[status] || "text-slate-500 border-sky-100"}`}>
        <Activity size={14} className={status !== 'NOMINAL_SYNC' ? 'animate-pulse' : ''} />
        {status.replaceAll('_', ' ')}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* ── TOP TIER: SYSTEM HUD ─────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white border border-sky-100 p-8 relative overflow-hidden rounded-[28px] shadow-[0_24px_50px_rgba(37,99,235,0.08)]">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} className="text-blue-600" />
        </div>
        
        <div className="flex gap-8 items-center relative z-10 w-full xl:w-auto">
            <button onClick={onBack} className="w-12 h-12 flex items-center justify-center border border-sky-100 hover:bg-sky-50 transition-all text-slate-500 hover:text-blue-700 rounded-2xl"><ArrowLeft size={18} /></button>
            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                    <p className="text-blue-600 font-mono text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2">
                        <Navigation size={12} className="animate-pulse" /> RNOS Command Center
                    </p>
                    <StatusDisplay status={missionStatus} />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select 
                            value={bu.id} 
                            onChange={(e) => onEntityChange(allBUs.find((b: any) => b.id === e.target.value))}
                            className="bg-transparent border-b-2 border-sky-100 text-slate-900 font-mono font-black py-1 pr-10 outline-none appearance-none hover:border-blue-500 transition-all cursor-pointer text-3xl uppercase tracking-tighter"
                        >
                            {allBUs.map((b: any) => (
                                <option key={b.id} value={b.id} className="bg-white">{b.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                             <ChevronRight size={20} className="rotate-90" />
                        </div>
                    </div>
                    <div className="h-10 w-px bg-sky-100" />
                    <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Selected Business Unit</p>
                        <p className="text-slate-900 font-mono font-bold text-[12px]">{entityName} // {isSynced ? 'Verified' : 'Action Required'}</p>
                    </div>
                    <div className="h-10 w-px bg-sky-100 hidden xl:block" />
                    <div className="min-w-[180px] hidden xl:block">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Benchmark Profile</p>
                        <select
                          value={benchmarkType}
                          onChange={(e) => onBenchmarkTypeChange(e.target.value)}
                          className="w-full bg-sky-50 border border-sky-100 px-3 py-2 text-slate-900 text-[11px] font-mono uppercase tracking-widest outline-none hover:border-blue-500 transition-colors rounded-2xl"
                        >
                          {benchmarkTypes.map((type: string) => (
                            <option key={type} value={type} className="bg-white">
                              {formatLabel(type)}
                            </option>
                          ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-8 xl:gap-12 relative z-10">
            <div className="text-right">
                <p className={STYLES.heading}>Benchmark Alignment</p>
                <div className="text-3xl font-black text-blue-600 font-mono tracking-tighter">{systemIntegrity}%</div>
            </div>
            <div className="text-right">
                <p className={STYLES.heading}>Maturity Score</p>
                <p className="text-5xl font-black text-slate-900 font-mono leading-none tracking-tighter">{overallScore.toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className={STYLES.heading}>Benchmark Summary</p>
                <p className="text-2xl font-black text-blue-600 font-mono leading-none tracking-tighter">{alignedPillarCount}/10</p>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">At or above {formatLabel(benchmarkType)}</p>
            </div>
        </div>
      </header>

      <div className="xl:hidden">
        <Card className="bg-sky-50 border-sky-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={STYLES.heading}>Benchmark Profile</p>
              <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Switch comparison context</p>
            </div>
            <select
              value={benchmarkType}
              onChange={(e) => onBenchmarkTypeChange(e.target.value)}
              className="bg-white border border-sky-100 px-3 py-2 text-slate-900 text-[11px] font-mono uppercase tracking-widest outline-none hover:border-blue-500 transition-colors rounded-2xl"
            >
              {benchmarkTypes.map((type: string) => (
                <option key={type} value={type} className="bg-white">
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {analytics.map((item: any) => (
          <Card key={item.pillarId} className="bg-sky-50 border-sky-100">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">{item.pillarName}</p>
              <Badge color={item.score >= item.target ? "emerald" : "rose"}>{item.score >= item.target ? "Above" : "Below"}</Badge>
            </div>
            <p className="mt-4 text-lg font-black text-slate-900">{item.score.toFixed(2)}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500 uppercase tracking-widest">{formatLabel(benchmarkType)}</span>
              <span className="text-slate-900">{item.target.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500 uppercase tracking-widest">Gap</span>
              <span className={item.gap > 0 ? "text-rose-400" : "text-emerald-400"}>
                {item.gap > 0 ? `-${item.gap.toFixed(2)}` : "Aligned"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── MIDDLE TIER: UNIFIED OPERATIONS SURFACE ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Vector Visualizations */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className={STYLES.heading}>Pillar Comparison</p>
                            <h4 className="text-[10px] font-mono text-slate-500 mt-1">Current maturity score against benchmark by pillar</h4>
                        </div>
                        <Badge color="blue">Weighted Scoring Engine</Badge>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="rgba(148,163,184,0.25)" />
                                <PolarAngleAxis dataKey="pillar" stroke="#64748b" fontSize={9} />
                                <Radar name="Current" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                <Radar name={formatLabel(benchmarkType)} dataKey="target" stroke="#ec4899" fill="transparent" strokeDasharray="4 4" />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(125,211,252,0.7)', fontSize: '10px' }} />
                                <Legend verticalAlign="bottom" height={36} content={({ payload }) => (
                                    <div className="flex justify-center gap-6 mt-4">
                                        {payload?.map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2" style={{ backgroundColor: entry.color }} />
                                                <span className="text-[8px] font-mono uppercase text-slate-500 tracking-widest">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className={STYLES.heading}>Operating Dimension Scores</p>
                            <h4 className="text-[10px] font-mono text-slate-500 mt-1">People, Process, Technology, and Governance performance</h4>
                        </div>
                    </div>
                    <div className="space-y-6 mt-4">
                        {dimensions.map((d: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[9px] uppercase font-mono tracking-widest leading-none">
                                    <span className={d.score >= targetBaseline ? 'text-slate-900 font-bold' : 'text-slate-500'}>{d.name.toUpperCase()}</span>
                                    <span className="text-slate-900 font-black">{d.score.toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-sky-100 rounded-none overflow-hidden relative">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(d.score / 5) * 100}%` }}
                                        className={`h-full absolute left-0 ${d.score >= targetBaseline ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-400'}`}
                                    />
                                    <div className="absolute top-0 bottom-0 left-[80%] w-px bg-rose-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-sky-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                                <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Remaining Gap</p>
                                <p className="text-xl font-black text-slate-900 font-mono">{((1 - (overallScore / 5)) * 100).toFixed(1)}%</p>
                            </div>
                            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                                <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Stability Index</p>
                                <p className="text-xl font-black text-blue-600 font-mono">{(100 - regressions.length * 5).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            
            <Card className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className={STYLES.heading}>Benchmark Comparison</p>
                        <h4 className="text-[10px] font-mono text-slate-500 mt-1">Current vs {formatLabel(benchmarkType)} profile by pillar</h4>
                    </div>
                    <Badge color="blue">AVG {benchmarkAverage.toFixed(2)}</Badge>
                </div>
                <div className="min-h-[280px]">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={benchmarkComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                            <XAxis dataKey="pillar" stroke="#64748b" fontSize={8} />
                            <YAxis domain={[0, 5]} axisLine={false} tickLine={false} stroke="#64748b" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(125,211,252,0.7)', fontSize: '10px' }} />
                            <Legend />
                            <Bar dataKey="score" name="Current" fill="#6366f1" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="benchmark" name={formatLabel(benchmarkType)} fill="#38bdf8" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                        <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Aligned Pillars</p>
                        <p className="text-xl font-black text-slate-900 font-mono">{alignedPillarCount}</p>
                    </div>
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                        <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Average Gap</p>
                        <p className="text-xl font-black text-rose-400 font-mono">{averageGap.toFixed(2)}</p>
                    </div>
                </div>
            </Card>
            
            {/* Action Roadmap - Integrated as Operational Queue */}
            <Card noPadding className="flex-1 border-sky-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <List size={14} className="text-blue-600" />
                        <p className={STYLES.heading}>Improvement Roadmap</p>
                    </div>
                    <Badge color="blue">{activeRoadmapCount} Actions Active</Badge>
                </div>
                <div className="overflow-auto max-h-[350px]">
                    <table className="w-full text-left font-mono">
                        <thead className="bg-sky-50 text-[8px] uppercase tracking-[0.3em] text-slate-500">
                            <tr>
                                <th className="p-4 font-normal">Action</th>
                                <th className="p-4 font-normal">Phase</th>
                                <th className="p-4 font-normal text-right">Priority</th>
                                <th className="p-4 font-normal text-right">Uplift</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                            {roadmap.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-sky-50 transition-colors border-l-2 border-transparent hover:border-blue-500">
                                    <td className="p-4">
                                        <div className="text-[11px] text-slate-900 font-bold uppercase tracking-tight mb-1">{item.description}</div>
                                        <div className="flex gap-4 text-[8px] uppercase tracking-widest text-slate-500">
                                            <span>{analytics.find((entry: any) => entry.pillarId === item.pillarId)?.pillarName || item.pillarId}</span>
                                            <span className="text-blue-600/70">{item.dimensionId}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-[9px] font-black uppercase tracking-widest ${item.phase === 'Phase 1' ? 'text-blue-600' : 'text-amber-600'}`}>
                                            {item.phase}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-slate-900 text-xs font-black">{item.priorityScore.toFixed(2)}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-blue-600 text-xs font-black">+{item.expectedUplift.toFixed(1)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        {/* Temporal & Alert Lateral Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="h-[280px]">
                <div className="flex items-center justify-between mb-6">
                    <p className={STYLES.heading}>Drift Analysis</p>
                    <Badge color="rose">DELTA</Badge>
                </div>
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={driftProfile}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                            <XAxis dataKey="pillar" hide />
                            <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(125,211,252,0.7)', fontSize: '10px' }} />
                            <Line type="step" dataKey="delta" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="flex-1 bg-white border-sky-100">
                <div className="flex items-center justify-between mb-6">
                    <p className={STYLES.heading}>Regression Alerts</p>
                    <AlertCircle size={14} className="text-rose-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                    {regressions.length > 0 ? regressions.map((r: any, i: number) => (
                        <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center group hover:border-rose-200 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-1 h-3 ${r.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-orange-500'}`} />
                                <div>
                                    <p className="text-[10px] font-mono font-black text-slate-900 uppercase tracking-widest">{r.pillarName}</p>
                                    <p className="text-[8px] font-mono text-slate-500 uppercase">{r.severity} THRESHOLD</p>
                                </div>
                            </div>
                            <div className="text-rose-400 font-mono font-black text-sm">
                                {r.delta.toFixed(3)}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-40">
                            <ShieldCheck size={40} className="mx-auto mb-4 text-blue-600" />
                            <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-500">No regressions detected</p>
                        </div>
                    )}
                </div>
                <div className="mt-8 pt-8 border-t border-sky-100">
                    <div className="bg-sky-50 p-6 border border-sky-100 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <Database size={16} className="text-blue-600" />
                            <p className="text-[10px] font-mono font-black text-slate-900 uppercase tracking-widest">Assessment Evidence Summary</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Responses Captured</span>
                                <span className="text-[10px] font-mono text-slate-900">{responseSummary.totalResponses}/100</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Evidence Linked</span>
                                <span className="text-[10px] font-mono text-blue-600">{responseSummary.evidenceCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Notes Logged</span>
                                <span className="text-[10px] font-mono text-slate-900">{responseSummary.noteCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Last Response</span>
                                <span className="text-[10px] font-mono text-slate-900">{new Date(responseSummary.lastAnsweredAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APPLICATION ───────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<"login" | "scope" | "assessment" | "navigator">("login");
  const [selectedBU, setSelectedBU] = useState<any>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({ pillars: [], questions: [], weights: [] });
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [benchmarkType, setBenchmarkType] = useState("target");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/entities").then(r => r.json()).then(setEntities).catch(console.error);
    fetch("/api/metadata").then(r => r.json()).then(setMetadata).catch(console.error);
    fetch("/api/benchmarks").then(r => r.json()).then(setBenchmarks).catch(console.error);
  }, []);

  const benchmarkTypes = useMemo(() => {
    const types = Array.from(new Set(benchmarks.map((entry: any) => entry.type)));
    return types.length ? types : ["target"];
  }, [benchmarks]);

  const getEntityIcon = (entityId: string) => {
    if (entityId === "gen") return Zap;
    if (entityId === "tra") return Network;
    if (entityId === "dis") return Boxes;
    if (entityId === "corp") return Building2;
    if (entityId === "sub") return Layers;
    if (entityId === "jv") return Users;
    return Shield;
  };

  const handleLogin = async () => {
    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (!/^[^@\s]+@gmail\.com$/i.test(normalizedEmail)) {
      setLoginError("Use any Gmail address to enter the demo.");
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError("Enter any password to continue.");
      return;
    }

    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: loginPassword })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to enter the platform.");
      }

      setLoginEmail(normalizedEmail);
      setScreen("scope");
    } catch (e: any) {
      setLoginError(e.message || "Unable to enter the platform.");
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySelect = async (bu: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId: bu.id })
      });
      const data = await res.json();
      setAssessmentId(data.id);
      setSelectedBU(bu);
      setScreen("assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCommandCenterData = async (assessmentId: string, activeBenchmarkType = benchmarkType, skipRecompute = false) => {
    setLoading(true);
    try {
      if (!skipRecompute) {
        await fetch("/api/compute-maturity-vector", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assessmentId }) });
        await fetch("/api/compute-drift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assessmentId }) });
        await fetch("/api/generate-roadmap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assessmentId }) });
      }

      // Unified Analysis Fetch
      const res = await fetch(`/api/assessments/${assessmentId}/analysis?benchmarkType=${activeBenchmarkType}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
       console.error("Command Center Context Refresh Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async ({ responses, notes, evidenceNames, answeredAt }: any) => {
    const questionCount = metadata.questions.length;
    const answeredCount = Object.keys(responses).filter(k => responses[k] !== undefined && responses[k] !== null).length;

    if (answeredCount !== questionCount) {
      alert(`CRITICAL PIPELINE BLOCK: ${questionCount - answeredCount} vectors missing. Please ensure all 100 questions are populated.`);
      return; 
    }

    setLoading(true);
    try {
      // Precise mapping from source of truth (metadata) to ensure alignment
      const formatted = metadata.questions.map((q: any) => {
        const val = responses[q.id];
        if (val === undefined || val === null) {
            throw new Error(`Integrity Gap: Question ID ${q.id} has no value.`);
        }
        return {
          questionId: q.id,
          score: Number(val),
          note: notes[q.id] || "",
          evidenceName: evidenceNames[q.id] || "",
          answeredAt: answeredAt[q.id] || new Date().toISOString(),
        };
      });
      
      console.log(`[PIPELINE] Submitting ${formatted.length} vectors for Assessment ${assessmentId}`);
      
      const saveRes = await fetch("/api/responses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, responses: formatted })
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(`Data Integrity Error: ${err.message || saveRes.statusText}`);
      }

      console.log("[PIPELINE] Synchronizing Analytics...");
      await handleFetchCommandCenterData(assessmentId!, benchmarkType);
      setScreen("navigator");
    } catch (error: any) {
      console.error("Assessment Finalization Error:", error);
      alert(`PIPELINE FAILURE: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_55%,#eef7ff_100%)] min-h-screen text-slate-900 font-sans selection:bg-sky-200">
      <AnimatePresence mode="wait">
        {screen === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex items-center justify-center">
             <div className="w-full max-w-sm p-12 bg-white border border-sky-100 rounded-[32px] shadow-[0_24px_70px_rgba(37,99,235,0.12)]">
               <div className="text-center mb-16">
                 <ShieldCheck size={48} className="text-blue-600 mx-auto mb-6" />
                 <h1 className="text-3xl font-mono font-black tracking-[0.3em] text-slate-900">RISK X AI</h1>
                 <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-3 underline decoration-blue-400/50 underline-offset-8">ERM Maturity Assessment Demo</p>
               </div>
               <div className="space-y-6">
                 <div className="space-y-2">
                    <p className={STYLES.heading}>User Email</p>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full bg-sky-50 border border-sky-100 p-4 text-slate-900 font-mono text-[11px] outline-none focus:border-blue-500 rounded-2xl" 
                      placeholder="yourname@gmail.com" 
                    />
                    <p className="text-[10px] font-mono text-slate-500">Use any Gmail address.</p>
                 </div>
                 <div className="space-y-2">
                    <p className={STYLES.heading}>Password</p>
                    <input 
                      type="password" 
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full bg-sky-50 border border-sky-100 p-4 text-slate-900 font-mono text-[11px] outline-none focus:border-blue-500 rounded-2xl" 
                      placeholder="••••••••" 
                    />
                    <p className="text-[10px] font-mono text-slate-500">Any typed password will work for the demo.</p>
                 </div>
                 {loginError && <p className="text-rose-500 font-mono text-[10px] uppercase tracking-widest text-center">{loginError}</p>}
                 <button 
                   onClick={handleLogin} 
                   className="w-full py-4 bg-blue-600 text-white font-mono font-black uppercase tracking-widest text-[11px] hover:bg-blue-500 transition-all border border-blue-400/20 rounded-2xl"
                 >
                   Enter Platform
                 </button>
               </div>
             </div>
          </motion.div>
        )}

        {screen === "scope" && (
          <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 max-w-6xl mx-auto">
             <header className="mb-16">
               <div className="flex items-center gap-3 text-blue-600 mb-2">
                 <Database size={14} />
                 <p className={STYLES.heading}>Active Workspace: RISK X AI</p>
               </div>
               <h1 className="text-4xl font-black text-slate-900 tracking-widest">Business Unit Selection</h1>
               <p className="mt-3 text-sm text-slate-500">Select a business unit to start the assessment flow.</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {entities.map(bu => {
                  const Icon = getEntityIcon(bu.id);
                  return (
                    <Card key={bu.id} className="cursor-pointer hover:border-blue-400 group" onClick={() => handleEntitySelect(bu)}>
                       <div className="w-12 h-12 bg-sky-50 border border-sky-100 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-105 rounded-2xl">
                         <Icon size={20} />
                       </div>
                       <h3 className="text-xl font-bold font-mono text-slate-900 uppercase tracking-widest">{bu.name}</h3>
                       <p className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-[0.2em]">{bu.industry}</p>
                    </Card>
                  );
                })}
             </div>
          </motion.div>
        )}

        {screen === "assessment" && metadata.questions.length > 0 && (
          <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <VectorCapturePipeline bu={selectedBU} questions={metadata.questions} pillars={metadata.pillars} onBack={() => setScreen("scope")} onComplete={handleAssessmentComplete} />
          </motion.div>
        )}

        {screen === "navigator" && analysis && (
          <motion.div key="navigator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <RNOSCommandCenter 
               analysis={analysis} 
               bu={selectedBU} 
               allBUs={entities}
               benchmarkTypes={benchmarkTypes}
               benchmarkType={benchmarkType}
               onBenchmarkTypeChange={async (nextBenchmarkType: string) => {
                 setBenchmarkType(nextBenchmarkType);
                 if (assessmentId) {
                   await handleFetchCommandCenterData(assessmentId, nextBenchmarkType, true);
                 }
               }}
               onEntityChange={async (bu: any) => {
                 setLoading(true);
                 try {
                    const res = await fetch("/api/assessments/create", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ entityId: bu.id })
                    });
                    const data = await res.json();
                    setAssessmentId(data.id);
                    setSelectedBU(bu);
                    setScreen("assessment");
                 } finally {
                    setLoading(false);
                 }
               }}
               onBack={() => setScreen("scope")} 
             />
          </motion.div>
        )}
      </AnimatePresence>

      <NavigatorAssistant analysis={analysis} />

      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[200] flex items-center justify-center font-mono">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-t-2 border-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 animate-pulse">Syncing RISK X AI Engines...</p>
            </div>
        </div>
      )}

      <div className="fixed bottom-8 left-8 flex items-center gap-3 opacity-60 pointer-events-none">
         <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
         <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-sky-700">RISK X AI // RNOS CORE VERIFIED</span>
      </div>
    </div>
  );
}
