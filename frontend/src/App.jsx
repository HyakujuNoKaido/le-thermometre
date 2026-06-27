import React, { useState, useEffect, useRef } from 'react';
import { Flame, Snowflake, Skull, Play, Users, Plus, User, Thermometer, ArrowRight, Check, X, Beer, Trophy, RotateCcw, Crown, Frown, BarChart3, Info } from 'lucide-react';

// --- MOCKS (Questions de secours) ---
const FALLBACK_QUESTIONS = {
  Chill: ["À quel pourcentage {cible} est susceptible de s'endormir devant un film avant le générique ?", "À quel pourcentage {cible} a le pire sens de l'orientation ici ?"],
  Spicy: ["À quel pourcentage {cible} a probablement déjà fouillé dans le téléphone de son/sa partenaire ?", "À quel pourcentage {cible} survend ses exploits au lit ?"],
  Hardcore: ["Si on devait sacrifier l'un d'entre vous, à quel pourcentage choisirait-on {cible} ?", "À quel pourcentage {cible} rirait secrètement lors d'un enterrement ?"]
};

export default function App() {
  const [gameState, setGameState] = useState('LOBBY');
  const [mode, setMode] = useState('Chill');
  const [isHost, setIsHost] = useState(true);
  
  const [players, setPlayers] = useState(['Alex', 'Sam', 'Jordan']);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sliderValue, setSliderValue] = useState(50);
  
  const [groupAverage, setGroupAverage] = useState(0);
  const [sips, setSips] = useState(0);
  const [scores, setScores] = useState({});

  const [questionBuffer, setQuestionBuffer] = useState([]);
  const bufferRef = useRef(questionBuffer);
  bufferRef.current = questionBuffer;

  const themeConfig = {
    Chill: { 
      bg: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400', accentColor: 'from-cyan-300 to-blue-400',
      iconName: 'snowflake', title: 'text-blue-100', cardBg: 'bg-blue-950/60', emoji: '🥶'
    },
    Spicy: { 
      bg: 'bg-gradient-to-br from-orange-600 via-red-500 to-pink-500', accentColor: 'from-yellow-400 to-orange-500',
      iconName: 'flame', title: 'text-orange-100', cardBg: 'bg-red-950/60', emoji: '🥵'
    },
    Hardcore: { 
      bg: 'bg-gradient-to-br from-gray-900 via-purple-900 to-red-900', accentColor: 'from-red-600 to-purple-600',
      iconName: 'skull', title: 'text-red-100', cardBg: 'bg-black/80', emoji: '😈'
    }
  };
  const currentTheme = themeConfig[mode];

  const renderThemeIcon = (name, className = "w-8 h-8") => {
    if (name === 'snowflake') return <Snowflake className={className} />;
    if (name === 'flame') return <Flame className={className} />;
    return <Skull className={className} />;
  };

  const triggerVibration = (pattern) => {
    if (typeof window !== 'undefined' && navigator && navigator.vibrate) navigator.vibrate(pattern);
  };

  useEffect(() => {
    setQuestionBuffer([]);
    fillBuffer();
  }, [mode, players]);

  const fillBuffer = () => {
    if (bufferRef.current.length < 3 && players.length >= 2) {
      setTimeout(() => {
        const target = players[Math.floor(Math.random() * players.length)];
        const aiSimulatedQuestion = `(IA) À quel pourcentage ${target} est le/la plus cliché en mode ${mode} ?`;
        setQuestionBuffer(prev => [...prev, { cible: target, question: aiSimulatedQuestion }]);
        fillBuffer(); 
      }, 2000);
    }
  };

  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
      triggerVibration(10);
    }
  };

  const removePlayer = (nameToRemove) => {
    setPlayers(players.filter(name => name !== nameToRemove));
    triggerVibration(10);
  };

  const resetGame = () => {
    setScores({});
    setGameState('LOBBY');
  };

  const startRound = () => {
    triggerVibration(50);
    if (players.length < 2) return;
    let nextQuestion;
    if (questionBuffer.length > 0) {
      nextQuestion = questionBuffer[0];
      setQuestionBuffer(prev => prev.slice(1)); 
      fillBuffer(); 
    } else {
      const target = players[Math.floor(Math.random() * players.length)];
      const fallbackList = FALLBACK_QUESTIONS[mode];
      const fallbackQ = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      nextQuestion = { cible: target, question: fallbackQ.replace('{cible}', target) };
    }
    setCurrentQuestion(nextQuestion);
    setSliderValue(50);
    setGameState('PLAYING');
  };

  const handleValidate = () => {
    triggerVibration([30, 50, 30]);
    const simulatedAverage = Math.floor(Math.random() * 100);
    setGroupAverage(simulatedAverage);

    const diff = Math.abs(sliderValue - simulatedAverage);
    setScores(prev => ({
      ...prev,
      [currentQuestion.cible]: (prev[currentQuestion.cible] || 0) + diff
    }));

    let sipsCount = 1;
    if (diff > 20) sipsCount = 2;
    if (diff > 40) sipsCount = 4;
    if (mode === 'Hardcore') sipsCount += 1;
    
    setSips(sipsCount);
    setGameState('REVEAL');
  };

  const renderLobby = () => (
    <div className="flex flex-col space-y-6 w-full max-w-md mx-auto animate-slideUp">
      
      {isHost ? (
        <section className="space-y-3">
          <h2 className={`text-2xl font-display font-bold flex items-center gap-2 ${currentTheme.title} drop-shadow-md`}>
            <Thermometer className="w-6 h-6" /> Choisis l'ambiance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(themeConfig).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); triggerVibration(15); }}
                className={`relative overflow-hidden flex flex-col items-center justify-between p-4 rounded-2xl transition-all duration-300 transform ${
                  mode === m 
                    ? `bg-gradient-to-br ${themeConfig[m].accentColor} text-white shadow-xl scale-105 border-2 border-white/30` 
                    : `${currentTheme.cardBg} text-white/70 hover:bg-white/10 border border-white/10`
                }`}
              >
                <div className={`p-2 rounded-full bg-white/20 ${mode === m ? 'animate-bounce-slow' : ''}`}>
                  {renderThemeIcon(themeConfig[m].iconName)}
                </div>
                <span className="text-xs font-bold mt-3 uppercase tracking-wider font-display">{m}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border border-white/20 flex flex-col items-center shadow-lg`}>
             <p className="text-white font-display font-bold text-lg text-center">
               L'hôte a choisi le mode <span className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{mode}</span>
             </p>
        </div>
      )}

      <section className={`p-5 rounded-3xl backdrop-blur-xl border border-white/20 ${currentTheme.cardBg} shadow-lg`}>
        <h2 className={`text-xl font-display font-bold mb-4 flex items-center gap-2 ${currentTheme.title}`}>
          <Info className="w-6 h-6" /> Règles
        </h2>
        <div className="space-y-2 mb-4 text-white/80 text-sm">
          <p>Vote secrètement à chaque question.</p>
          <p>La personne visée par la question doit estimer la <span className="font-bold text-white">moyenne du groupe</span>. Si elle est trop loin, elle boit !</p>
        </div>
      </section>

      <section className={`p-5 rounded-3xl backdrop-blur-xl border border-white/20 ${currentTheme.cardBg} shadow-lg`}>
        <h2 className={`text-xl font-display font-bold mb-4 flex items-center gap-2 ${currentTheme.title}`}>
          <Users className="w-6 h-6" /> Les Joueurs ({players.length})
        </h2>
        
        {isHost && (
          <form onSubmit={addPlayer} className="flex gap-2 mb-4 relative">
            <input
              type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Ajouter un nom..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all font-medium"
            />
            <button type="submit" className={`bg-gradient-to-r ${currentTheme.accentColor} text-white p-3 rounded-2xl shadow-md active:scale-95`}>
              <Plus className="w-6 h-6" />
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {players.map(player => (
            <div key={player} className={`group flex items-center gap-2 pl-3 pr-2 py-2 rounded-full border border-white/10 bg-white/10 transition-all`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                {player.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-bold font-display">{player}</span>
              {isHost && (
                <button onClick={() => removePlayer(player)} className="text-white/50 hover:text-red-400 ml-1 p-1 bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {isHost ? (
        <button onClick={startRound} disabled={players.length < 2}
          className={`w-full py-5 rounded-3xl font-display font-black text-2xl text-white shadow-2xl flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group ${
            players.length >= 2 ? `bg-gradient-to-r ${currentTheme.accentColor} hover:scale-[1.02] active:scale-98 animate-pulse-slow` : 'bg-gray-800/50 cursor-not-allowed opacity-50'
          }`}
        >
          <Play className="w-8 h-8 fill-current" /> JOUER !
        </button>
      ) : (
        <div className="w-full py-5 rounded-3xl bg-black/40 border border-white/10 text-white flex justify-center shadow-inner">
           <p className="font-display font-bold text-lg opacity-80 animate-pulse">En attente de l'hôte...</p>
        </div>
      )}
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full animate-zoomIn pb-6">
      <div className="space-y-8 flex-1 flex flex-col justify-center">
        
        <div className="text-center space-y-1 animate-slideDown">
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 bg-black/30 ${currentTheme.title} shadow-sm`}>
            Mode {mode}
          </span>
        </div>

        <div className="relative group perspective">
          <div className={`absolute -inset-1 bg-gradient-to-r ${currentTheme.accentColor} rounded-[2.5rem] blur-xl opacity-70 animate-tilt`}></div>
          <div className={`relative ${currentTheme.cardBg} backdrop-blur-2xl rounded-[2rem] p-1 border-2 border-white/10 shadow-2xl`}>
            <div className="bg-black/20 rounded-[1.8rem] p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-4">
              <div className="text-white/60 uppercase text-sm font-bold tracking-wider">La cible est</div>
              <div className={`font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentColor} drop-shadow-sm`}>
                {currentQuestion.cible}
              </div>
              <p className="text-white text-2xl font-bold leading-snug mt-4 font-display">
                "{currentQuestion.question}"
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border-2 border-white/20 ${currentTheme.cardBg} backdrop-blur-xl shadow-lg mt-auto`}>
          <label className="flex justify-between items-end text-white font-display font-bold mb-4">
            <span className="text-lg">Ton avis :</span>
            <span className={`text-4xl ${currentTheme.title} drop-shadow-md flex items-center gap-2`}>
              {sliderValue}%
            </span>
          </label>
          <div className="relative h-6 rounded-full bg-black/50 p-1 shadow-inner border border-white/10">
             <div className="absolute top-0 left-0 bottom-0 rounded-full bg-gradient-to-r" style={{ width: `${sliderValue}%`, backgroundImage: `linear-gradient(to right, ${mode === 'Chill' ? '#3b82f6, #22d3ee' : mode === 'Spicy' ? '#ef4444, #f97316' : '#7f1d1d, #dc2626'})` }}></div>
            <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => {setSliderValue(e.target.value); triggerVibration(5);}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] flex items-center justify-center text-xl font-bold text-gray-800 border-2 border-white/50 pointer-events-none" style={{ left: `calc(${sliderValue}% - 20px)` }}>
              {players[0].charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleValidate}
        className={`mt-6 w-full py-5 rounded-3xl font-display font-black text-2xl shadow-xl flex items-center justify-center gap-3 transition-all bg-white text-gray-900 hover:scale-[1.02] active:scale-98`}
      >
        Valider (Secret) <Check className="w-8 h-8" />
      </button>
    </div>
  );

  const renderReveal = () => {
    const diff = Math.abs(sliderValue - groupAverage);
    const isClose = diff <= 15;
    
    return (
      <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full animate-zoomIn pb-6">
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-display font-black text-white drop-shadow-md">Le Verdict !</h2>
            
            {/* L'affichage géant de la moyenne */}
            <div className="py-6 animate-zoomIn">
              <span className={`text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentColor} drop-shadow-2xl`}>
                {groupAverage}%
              </span>
            </div>
            <p className="text-white/80 text-lg font-bold">
              C'est la moyenne pour <span className="text-white uppercase">{currentQuestion.cible}</span> 😏
            </p>
          </div>

          <div className={`p-8 rounded-[2rem] border-2 border-white/20 ${currentTheme.cardBg} backdrop-blur-2xl shadow-2xl relative overflow-hidden`}>
            {isClose ? <Trophy className="absolute -right-10 -bottom-10 w-48 h-48 text-yellow-500/20 rotate-12" /> : <Beer className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10 -rotate-12" />}

            <div className="pt-2 text-center space-y-4 relative z-10">
              <div className="inline-block p-4 rounded-full bg-black/40 border border-white/10 animate-bounce-slow">
                {isClose ? <Trophy className="w-10 h-10 text-yellow-400" /> : <Beer className="w-10 h-10 text-white" />}
              </div>
              <h3 className="text-2xl font-black text-white font-display leading-tight">
                {isClose ? "Pas mal évalué !" : "Aïe, complètement à côté de la plaque !"}
              </h3>
              <p className={`text-2xl font-black ${currentTheme.title} p-4 bg-black/30 rounded-2xl border border-white/5`}>
                {isClose ? "Les autres boivent 1 gorgée !" : `${currentQuestion.cible} boit ${sips} gorgées 🍻`}
              </p>
            </div>
          </div>
          
          {/* Suivi du score privé */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-4 flex justify-between items-center px-6">
             <div className="text-white/60 font-bold text-sm uppercase">Ton Suivi Privé</div>
             <div className="text-right">
               <div className="text-red-400 font-black">+{diff} pts (Écart)</div>
               <div className="text-white font-bold text-sm">Score Total : {scores[currentQuestion.cible] || diff}</div>
             </div>
          </div>

        </div>

        <div className="space-y-3 mt-6 flex flex-col gap-2">
          {isHost ? (
            <div className="flex gap-2">
              <button onClick={startRound} className={`flex-[3] py-5 rounded-3xl font-display font-black text-xl text-white shadow-xl flex items-center justify-center gap-3 transition-all bg-gradient-to-r ${currentTheme.accentColor} hover:scale-[1.02] active:scale-98`}>
                Suivant <ArrowRight className="w-6 h-6" />
              </button>
              <button onClick={() => { triggerVibration([20, 20]); setGameState('STATS'); }} className="flex-[1] py-5 rounded-3xl bg-black/40 border border-white/20 text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center transition-all">
                <BarChart3 className="w-7 h-7" />
              </button>
            </div>
          ) : (
            <div className="w-full py-5 rounded-3xl bg-black/40 border border-white/10 text-white flex justify-center shadow-inner">
               <p className="font-display font-bold text-lg opacity-80 animate-pulse">L'hôte décide de la suite...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const sortedPlayers = [...players].map(p => ({
      name: p,
      score: scores[p] || 0
    })).sort((a, b) => a.score - b.score);

    const winner = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];
    const finalDiff = loser.score - winner.score;
    const powerSips = Math.max(1, Math.floor(finalDiff / 15));

    return (
      <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full animate-zoomIn pb-6">
        <div className="space-y-6 flex-1 flex flex-col justify-start overflow-y-auto custom-scrollbar pr-2">
          
          <div className="text-center space-y-1 mb-2">
            <h2 className="text-4xl font-display font-black text-white drop-shadow-lg">Fin de Partie</h2>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-yellow-500 to-amber-600 p-1 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
            <div className="bg-black/80 backdrop-blur-sm rounded-[1.8rem] p-6 relative z-10 flex flex-col items-center text-center">
              <Crown className="w-10 h-10 text-yellow-400 mb-2" />
              <h3 className="text-yellow-400 font-bold tracking-widest uppercase text-xs">Visionnaire (1er)</h3>
              <p className="text-3xl font-display font-black text-white">{winner.name} <span className="text-xl text-white/50">({winner.score} pts)</span></p>
              
              <div className="mt-3 p-3 bg-yellow-900/40 border border-yellow-500/30 rounded-xl w-full">
                <p className="text-sm text-yellow-100 font-medium leading-tight">
                  Tu as <span className="text-xl font-black text-white mx-1">{powerSips} gorgées</span> à distribuer !
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 to-purple-900 p-1 shadow-xl transform hover:scale-105 transition-transform mt-2">
            <div className="bg-black/90 backdrop-blur-sm rounded-[1.8rem] p-6 relative z-10 flex flex-col items-center text-center">
              <Skull className="w-8 h-8 text-red-500 mb-2" />
              <h3 className="text-red-400 font-bold tracking-widest uppercase text-xs">Le Boulet (Dernier)</h3>
              <p className="text-3xl font-display font-black text-white">{loser.name} <span className="text-xl text-white/50">({loser.score} pts)</span></p>
              
              <div className="mt-4 p-4 bg-red-900/40 border border-red-500/30 rounded-xl w-full text-left">
                <p className="text-sm text-red-100/90 font-medium leading-relaxed italic">
                  "Écoute-moi bien {loser.name}... Finir avec {loser.score} points d'erreur, c'est pas juste être nul, c'est vivre dans un univers parallèle. Ton intuition sociale est aussi affûtée qu'une cuillère en plastique. Ne parle plus et bois tes gorgées." <br/><span className="text-red-400 font-bold mt-2 block">- L'IA</span>
                </p>
              </div>
            </div>
          </div>

          {sortedPlayers.length > 2 && (
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 mt-2">
              <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 text-center">Le Reste</h4>
              <div className="space-y-2">
                {sortedPlayers.slice(1, -1).map((player, idx) => (
                  <div key={player.name} className="flex justify-between items-center text-white/90 text-sm bg-white/5 p-2 rounded-lg">
                    <span className="font-medium">{idx + 2}. {player.name}</span>
                    <span className="text-white/50">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          {isHost ? (
            <button onClick={resetGame}
              className={`w-full py-5 rounded-3xl font-display font-black text-xl text-white shadow-xl flex items-center justify-center gap-3 transition-all bg-gradient-to-r from-gray-100 to-white text-gray-900 hover:scale-[1.02] active:scale-98`}
            >
              <RotateCcw className="w-6 h-6" /> Rejouer une Partie
            </button>
          ) : (
            <div className="w-full py-5 rounded-3xl bg-black/40 border border-white/10 text-white flex justify-center shadow-inner">
               <p className="font-display font-bold text-lg opacity-80">Fin de la partie</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-1000 p-4 md:p-8 font-sans flex flex-col overflow-hidden relative`}>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob opacity-50 pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000 opacity-50 pointer-events-none"></div>
      
      <header className="flex justify-between items-center w-full max-w-md mx-auto mb-6 z-10 relative">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme.accentColor} shadow-lg transform -rotate-6`}>
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-black text-white drop-shadow-lg italic">
            Le <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentColor}`}>Thermo</span>mètre
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setIsHost(!isHost)} className="flex items-center gap-1 bg-black/40 border border-white/20 px-3 py-1.5 rounded-full text-white text-xs font-bold">
            Vue: {isHost ? 'Hôte 👑' : 'Joueur 📱'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col z-10 relative">
        {gameState === 'LOBBY' && renderLobby()}
        {gameState === 'PLAYING' && renderPlaying()}
        {gameState === 'REVEAL' && renderReveal()}
        {gameState === 'STATS' && renderStats()}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&display=swap');
        :root { font-family: 'Baloo 2', cursive, sans-serif; }
        .font-display { font-family: 'Baloo 2', cursive, sans-serif; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }

        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }

        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }

        @keyframes tilt { 0%, 50%, 100% { transform: rotate(0deg); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }
        .animate-tilt { animation: tilt 5s infinite linear; }
        
        .perspective { perspective: 1000px; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); borderRadius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); borderRadius: 10px; }

        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 0; width: 0; }
        input[type=range]:focus { outline: none; }
      `}} />
    </div>
  );
}
