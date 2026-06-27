import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Flame, Snowflake, Skull, Play, Users, Plus, User, Thermometer, ArrowRight, Check, Trophy, Beer, Info, RotateCcw } from 'lucide-react';

// Connexion au Backend (Remplace par l'URL Render en production)
const socket = io('http://localhost:3001');

const FALLBACK_QUESTIONS = {
  Chill: ["À quel pourcentage {cible} est susceptible de s'endormir devant un film ?", "À quel pourcentage {cible} a le pire sens de l'orientation ?"],
  Spicy: ["À quel pourcentage {cible} fouillerait dans le téléphone de son partenaire ?", "À quel pourcentage {cible} survend ses exploits au lit ?"],
  Hardcore: ["Si on devait sacrifier l'un d'entre vous, à quel pourcentage choisirait-on {cible} ?", "À quel pourcentage {cible} rirait secrètement lors d'un enterrement ?"]
};

export default function App() {
  const [gameState, setGameState] = useState('LOBBY');
  const [mode, setMode] = useState('Chill');
  const [players, setPlayers] = useState(['Alex', 'Sam']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sliderValue, setSliderValue] = useState(50);
  
  const [groupAverage, setGroupAverage] = useState(0);
  const [scores, setScores] = useState({}); 

  const [questionBuffer, setQuestionBuffer] = useState([]);
  const bufferRef = useRef(questionBuffer);
  bufferRef.current = questionBuffer;

  const themeConfig = {
    Chill: { bg: 'bg-blue-900', accent: 'from-cyan-300 to-blue-500', icon: <Snowflake className="w-6 h-6"/>, title: 'text-blue-100', cardBg: 'bg-blue-950/60' },
    Spicy: { bg: 'bg-orange-900', accent: 'from-orange-400 to-red-500', icon: <Flame className="w-6 h-6"/>, title: 'text-orange-100', cardBg: 'bg-red-950/60' },
    Hardcore: { bg: 'bg-zinc-950', accent: 'from-red-600 to-purple-600', icon: <Skull className="w-6 h-6"/>, title: 'text-red-100', cardBg: 'bg-black/80' }
  };
  const theme = themeConfig[mode];

  // Gestion des WebSockets
  useEffect(() => {
    socket.emit('join_room', { roomId: 'room123' });

    socket.on('ai_questions_ready', (questions) => {
      setQuestionBuffer(prev => [...prev, ...questions]);
    });

    socket.on('ai_error', () => {
      console.log("Utilisation des questions de secours (Fallback)");
    });

    return () => {
      socket.off('ai_questions_ready');
      socket.off('ai_error');
    };
  }, []);

  // Remplissage automatique du Buffer IA
  useEffect(() => {
    if (players.length >= 2 && questionBuffer.length < 3) {
      socket.emit('request_ai_questions', { roomId: 'room123', mode, players });
    }
  }, [mode, players, questionBuffer.length]);

  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const startRound = () => {
    if (players.length < 2) return;
    let nextQ;
    if (questionBuffer.length > 0) {
      nextQ = questionBuffer[0];
      setQuestionBuffer(prev => prev.slice(1)); 
    } else {
      const target = players[Math.floor(Math.random() * players.length)];
      const list = FALLBACK_QUESTIONS[mode];
      nextQ = { cible: target, question: list[Math.floor(Math.random() * list.length)].replace('{cible}', target) };
    }
    setCurrentQuestion(nextQ);
    setSliderValue(50);
    setGameState('PLAYING');
  };

  const handleValidate = () => {
    // Calcul de l'écart avec une moyenne fictive pour le groupe
    const simulatedAverage = Math.floor(Math.random() * 100);
    setGroupAverage(simulatedAverage);
    const diff = Math.abs(sliderValue - simulatedAverage);
    setScores(prev => ({ ...prev, [currentQuestion.cible]: (prev[currentQuestion.cible] || 0) + diff }));
    setGameState('REVEAL');
  };

  const renderLobby = () => (
    <div className="flex flex-col space-y-6 max-w-md mx-auto w-full">
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(themeConfig).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`p-3 rounded-xl flex flex-col items-center ${mode === m ? `bg-gradient-to-br ${themeConfig[m].accent} text-white font-bold` : 'bg-black/40 text-gray-400'}`}>
            {themeConfig[m].icon}
            <span className="text-xs mt-1 uppercase">{m}</span>
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-2xl border border-white/20 ${theme.cardBg}`}>
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Info className="w-5 h-5"/> Règles et Pouvoirs</h2>
        <p className="text-white/80 text-sm mb-2">Votez tous secrètement. Si la cible a mal évalué ce que le groupe pense d'elle, elle boit !</p>
        <p className="text-sm font-bold text-yellow-400 mt-2">👑 Pouvoir du Vainqueur : En fin de partie, le meilleur aura un bonus pour faire boire les autres.</p>
      </div>

      <div className={`p-4 rounded-2xl border border-white/20 ${theme.cardBg}`}>
        <h2 className="text-white font-bold mb-3">Joueurs ({players.length})</h2>
        <form onSubmit={addPlayer} className="flex gap-2 mb-3">
          <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Prénom..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-white" />
          <button type="submit" className={`bg-gradient-to-r ${theme.accent} p-3 rounded-xl text-white`}><Plus/></button>
        </form>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <div key={p} className="bg-white/10 px-3 py-1.5 rounded-full text-white text-sm flex items-center gap-2">
              <span className="font-bold">{p[0].toUpperCase()}</span> {p}
            </div>
          ))}
        </div>
      </div>

      <button onClick={startRound} disabled={players.length < 2} className={`w-full py-4 rounded-2xl font-bold text-xl text-white shadow-xl flex justify-center gap-3 ${players.length >= 2 ? `bg-gradient-to-r ${theme.accent}` : 'bg-gray-800 opacity-50'}`}>
        <Play /> JOUER !
      </button>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full">
      <div className="space-y-6">
        <div className={`relative ${theme.cardBg} rounded-[2rem] p-8 text-center border border-white/10 shadow-2xl mt-8`}>
          <div className="text-white/60 uppercase text-sm font-bold tracking-wider mb-2">La cible est</div>
          <div className={`font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r ${theme.accent}`}>{currentQuestion.cible}</div>
          <p className="text-white text-2xl font-bold mt-6">"{currentQuestion.question}"</p>
        </div>

        <div className={`p-6 rounded-3xl border border-white/20 ${theme.cardBg} mt-8`}>
          <label className="flex justify-between text-white font-bold mb-4">
            <span>Ton avis :</span> <span className="text-2xl">{sliderValue}%</span>
          </label>
          <div className="relative h-4 rounded-full bg-black/50 p-1 border border-white/10">
            <div className="absolute top-0 left-0 bottom-0 rounded-full bg-gradient-to-r from-white/20 to-white/80" style={{ width: `${sliderValue}%` }}></div>
            <input type="range" min="0" max="100" value={sliderValue} onChange={e => setSliderValue(e.target.value)} className="absolute inset-0 w-full h-full opacity-0" />
            <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-black pointer-events-none" style={{ left: `calc(${sliderValue}% - 16px)` }}></div>
          </div>
        </div>
      </div>
      <button onClick={handleValidate} className="mt-6 w-full py-4 rounded-2xl font-black text-xl text-black bg-white flex justify-center gap-3">
        Valider (Secret) <Check />
      </button>
    </div>
  );

  const renderReveal = () => {
    const diff = Math.abs(sliderValue - groupAverage);
    const sips = diff > 40 ? 4 : diff > 20 ? 2 : 1;
    
    return (
      <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full">
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-white/80 text-lg uppercase tracking-widest font-bold">Moyenne du groupe</h2>
            <div className={`text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b ${theme.accent} drop-shadow-lg`}>
              {groupAverage}%
            </div>
            <p className="text-white mt-2 font-bold text-xl">C'est ce qu'on pense de {currentQuestion.cible} 😏</p>
          </div>

          <div className={`p-6 rounded-[2rem] border border-white/20 ${theme.cardBg} text-center space-y-4`}>
            <h3 className="text-xl font-bold text-white">
              {diff <= 15 ? "Pas mal évalué !" : "Aïe, complètement à côté de la plaque !"}
            </h3>
            <div className="bg-black/50 p-4 rounded-xl border border-white/10">
              <span className="block text-white/70 mb-1">{currentQuestion.cible} a répondu {sliderValue}%</span>
              <span className="text-2xl font-black text-white">
                {diff <= 15 ? "Les autres boivent 1 gorgée !" : `${currentQuestion.cible} boit ${sips} gorgées 🍻`}
              </span>
            </div>
            <div className="text-xs text-white/50 uppercase tracking-widest pt-2">
              Ton Écart: {diff} pts (Score: {scores[currentQuestion.cible]} pts)
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <button onClick={startRound} className={`w-full py-4 rounded-2xl font-black text-xl text-white flex justify-center gap-3 bg-gradient-to-r ${theme.accent}`}>
            Suivant <ArrowRight />
          </button>
          <button onClick={() => setGameState('STATS')} className="w-full py-4 rounded-2xl font-bold text-white/70 bg-white/5 hover:bg-white/10">
            Terminer la partie et voir le Bilan
          </button>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const sorted = [...players].map(p => ({ name: p, score: scores[p] || 0 })).sort((a, b) => a.score - b.score);
    const winner = sorted[0];
    const loser = sorted[sorted.length - 1];
    const power = Math.max(1, Math.floor((loser.score - winner.score) / 15));

    return (
      <div className="flex flex-col h-full max-w-md mx-auto w-full">
        <h2 className="text-3xl font-black text-white text-center mb-8">Bilan de la Soirée</h2>
        
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[2rem] p-6 text-center mb-4 shadow-xl">
          <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
          <p className="text-yellow-100 uppercase text-sm font-bold">Le Roi de la soirée</p>
          <p className="text-3xl font-black text-white">{winner.name}</p>
          <p className="text-white mt-2 font-medium">Pouvoir : Distribue {power} gorgées à qui tu veux !</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-900 rounded-[2rem] p-6 text-center shadow-xl">
          <Beer className="w-12 h-12 text-white/50 mx-auto mb-2" />
          <p className="text-red-200 uppercase text-sm font-bold">Le Gros Boulet</p>
          <p className="text-3xl font-black text-white">{loser.name}</p>
          <div className="bg-black/50 p-4 rounded-xl mt-3 text-white italic text-sm">
            "Franchement {loser.name}, tu ne te connais pas du tout et les autres ne te respectent pas. Finis ton verre en cul-sec pour te faire pardonner." - L'IA
          </div>
        </div>

        <button onClick={() => { setScores({}); setGameState('LOBBY'); }} className="mt-auto py-5 rounded-2xl font-black text-xl text-black bg-white flex justify-center gap-3">
          <RotateCcw /> Rejouer une Partie
        </button>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-display p-4 flex flex-col`}>
      <header className="flex justify-between items-center mb-6 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <Thermometer className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-black text-white">Le Thermomètre</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {gameState === 'LOBBY' && renderLobby()}
        {gameState === 'PLAYING' && renderPlaying()}
        {gameState === 'REVEAL' && renderReveal()}
        {gameState === 'STATS' && renderStats()}
      </main>
    </div>
  );
}
