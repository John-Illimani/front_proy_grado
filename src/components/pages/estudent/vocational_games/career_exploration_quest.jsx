import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CareerExplorationQuest = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [careerPoints, setCareerPoints] = useState({
    artistic: 0,
    investigative: 0,
    social: 0,
    enterprising: 0,
    realistic: 0,
    conventional: 0
  });

  // Juego de plataformas
  const PlatformGame = () => {
    const [position, setPosition] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState([
      { id: 1, type: 'artistic', position: 30 },
      { id: 2, type: 'investigative', position: 60 },
      { id: 3, type: 'social', position: 90 }
    ]);
    const gameRef = useRef(null);

    const handleJump = () => {
      if (!isJumping) {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 500);
      }
    };

    const moveRight = () => {
      setPosition(prev => Math.min(prev + 10, 90));
    };

    const moveLeft = () => {
      setPosition(prev => Math.max(prev - 10, 0));
    };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') moveRight();
        if (e.key === 'ArrowLeft') moveLeft();
        if (e.key === ' ') handleJump();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const checkCollision = (obstacle) => {
      if (Math.abs(position - obstacle.position) < 10 && !isJumping) {
        setCareerPoints(prev => ({
          ...prev,
          [obstacle.type]: prev[obstacle.type] + 1
        }));
        
        setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
      }
    };

    useEffect(() => {
      obstacles.forEach(obstacle => {
        checkCollision(obstacle);
      });
    }, [position, isJumping]);

    return (
      <div className="bg-blue-100 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Explorador de Carreras</h3>
        <p className="text-blue-600 mb-4">Usa las flechas para moverte y la barra espaciadora para saltar. ¡Recoge los ítems relacionados con diferentes carreras!</p>
        
        <div 
          ref={gameRef}
          className="relative h-64 bg-gradient-to-b from-blue-300 to-blue-400 rounded-lg overflow-hidden border-4 border-blue-500"
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width * 100;
            setPosition(clickX);
          }}
        >
          {/* Plataforma */}
          <div className="absolute bottom-0 w-full h-6 bg-green-600"></div>
          
          {/* Personaje */}
          <motion.div
            className={`absolute bottom-6 w-12 h-12 bg-red-500 rounded-t-full flex items-center justify-center ${isJumping ? 'shadow-lg' : ''}`}
            style={{ left: `${position}%` }}
            animate={{ y: isJumping ? -100 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <span className="text-white font-bold">👨‍💼</span>
          </motion.div>
          
          {/* Obstáculos/ítems */}
          {obstacles.map(obstacle => (
            <motion.div
              key={obstacle.id}
              className={`absolute bottom-6 w-10 h-10 rounded-full flex items-center justify-center ${
                obstacle.type === 'artistic' ? 'bg-purple-500' :
                obstacle.type === 'investigative' ? 'bg-yellow-500' :
                obstacle.type === 'social' ? 'bg-pink-500' : 'bg-gray-500'
              }`}
              style={{ left: `${obstacle.position}%` }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-white font-bold">
                {obstacle.type === 'artistic' ? '🎨' :
                 obstacle.type === 'investigative' ? '🔬' :
                 obstacle.type === 'social' ? '👥' : '💼'}
              </span>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={moveLeft}
          >
            ◀ Izquierda
          </button>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleJump}
          >
            Saltar ▲
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={moveRight}
          >
            Derecha ▶
          </button>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-blue-700">Puntos de Carrera:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {Object.entries(careerPoints).map(([career, points]) => (
              <div key={career} className="flex items-center bg-white p-2 rounded-lg shadow">
                <span className="w-8 h-8 flex items-center justify-center rounded-full mr-2
                  bg-blue-100 text-blue-800 font-bold">
                  {career === 'artistic' ? '🎨' :
                   career === 'investigative' ? '🔬' :
                   career === 'social' ? '👥' :
                   career === 'enterprising' ? '💼' :
                   career === 'realistic' ? '🔧' : '📊'}
                </span>
                <div>
                  <p className="capitalize font-medium text-sm">{career}</p>
                  <p className="text-xs text-gray-600">{points} puntos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Juego de preguntas con movimiento
  const QuizGame = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const questions = [
      {
        question: "¿Qué actividad te gusta más?",
        options: [
          { text: "Dibujar o crear arte", type: "artistic" },
          { text: "Resolver problemas matemáticos", type: "investigative" },
          { text: "Ayudar a otras personas", type: "social" },
          { text: "Liderar un proyecto", type: "enterprising" }
        ]
      },
      {
        question: "¿En qué entorno te gustaría trabajar?",
        options: [
          { text: "Al aire libre", type: "realistic" },
          { text: "Laboratorio de investigación", type: "investigative" },
          { text: "Oficina organizada", type: "conventional" },
          { text: "Estudio de diseño", type: "artistic" }
        ]
      },
      {
        question: "¿Qué te describe mejor?",
        options: [
          { text: "Soy creativo e imaginativo", type: "artistic" },
          { text: "Soy analítico y lógico", type: "investigative" },
          { text: "Soy sociable y empático", type: "social" },
          { text: "Soy ambicioso y energético", type: "enterprising" }
        ]
      }
    ];

    const handleAnswer = (optionType) => {
      setSelectedAnswer(optionType);
      setCareerPoints(prev => ({
        ...prev,
        [optionType]: prev[optionType] + 1
      }));
      
      setTimeout(() => {
        setSelectedAnswer(null);
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
          setCurrentQuestion(nextQuestion);
        } else {
          setShowScore(true);
        }
      }, 1000);
    };

    if (showScore) {
      return (
        <div className="bg-green-100 p-8 rounded-xl shadow-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-bold text-green-800 mb-4">¡Cuestionario Completado!</h3>
          <p className="text-green-700 mb-6">Has completado el cuestionario de orientación vocacional.</p>
          <button 
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => setActiveGame(null)}
          >
            Volver a Juegos
          </button>
        </div>
      );
    }

    return (
      <div className="bg-purple-100 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-purple-800 mb-4">Quiz de Carreras</h3>
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-purple-700">{questions[currentQuestion].question}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <motion.button
              key={index}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedAnswer === option.type 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-purple-800 hover:bg-purple-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(option.type)}
              disabled={selectedAnswer !== null}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">
                  {option.type === 'artistic' ? '🎨' :
                   option.type === 'investigative' ? '🔬' :
                   option.type === 'social' ? '👥' :
                   option.type === 'enterprising' ? '💼' :
                   option.type === 'realistic' ? '🔧' : '📊'}
                </span>
                {option.text}
              </div>
            </motion.button>
          ))}
        </div>
        
        <div className="mt-6 bg-white p-3 rounded-lg">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-purple-700 mt-2">
            Pregunta {currentQuestion + 1} de {questions.length}
          </p>
        </div>
      </div>
    );
  };

  // Juego de memoria
  const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
      const careerTypes = ['artistic', 'investigative', 'social', 'enterprising', 'realistic', 'conventional'];
      const items = [...careerTypes, ...careerTypes];
      const shuffled = items.sort(() => Math.random() - 0.5);
      
      setCards(shuffled.map((type, index) => ({ id: index, type })));
    }, []);

    const handleClick = (id) => {
      if (disabled || flipped.includes(id) || solved.includes(id)) return;
      
      const newFlipped = [...flipped, id];
      setFlipped(newFlipped);
      
      if (newFlipped.length === 2) {
        setDisabled(true);
        const [first, second] = newFlipped;
        
        if (cards[first].type === cards[second].type) {
          setSolved([...solved, first, second]);
          setCareerPoints(prev => ({
            ...prev,
            [cards[first].type]: prev[cards[first].type] + 1
          }));
          resetCards();
        } else {
          setTimeout(resetCards, 1000);
        }
      }
    };

    const resetCards = () => {
      setFlipped([]);
      setDisabled(false);
    };

    const getEmoji = (type) => {
      return type === 'artistic' ? '🎨' :
             type === 'investigative' ? '🔬' :
             type === 'social' ? '👥' :
             type === 'enterprising' ? '💼' :
             type === 'realistic' ? '🔧' : '📊';
    };

    return (
      <div className="bg-yellow-100 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-yellow-800 mb-4">Juego de Memoria Vocacional</h3>
        <p className="text-yellow-700 mb-6">Encuentra las parejas de carreras iguales para ganar puntos.</p>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map(card => (
            <motion.div
              key={card.id}
              className={`h-20 md:h-24 rounded-lg cursor-pointer flex items-center justify-center text-2xl ${
                flipped.includes(card.id) || solved.includes(card.id)
                  ? 'bg-white shadow-inner' 
                  : 'bg-yellow-400 hover:bg-yellow-500 shadow'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(card.id)}
            >
              {flipped.includes(card.id) || solved.includes(card.id) ? getEmoji(card.type) : '?'}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6">
          <button 
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            onClick={() => setCards([])}
          >
            Reiniciar Juego
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.header 
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Juegos de Orientación Vocacional</h1>
          <p className="text-indigo-200">Descubre tu vocación a través de juegos interactivos y divertidos</p>
        </motion.header>

        {activeGame ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <button 
              className="flex items-center text-indigo-200 hover:text-white mb-4"
              onClick={() => setActiveGame(null)}
            >
              <span className="mr-2">←</span> Volver a los juegos
            </button>
            
            {activeGame === 'platform' && <PlatformGame />}
            {activeGame === 'quiz' && <QuizGame />}
            {activeGame === 'memory' && <MemoryGame />}
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg cursor-pointer hover:bg-white/20 transition-colors"
                whileHover={{ y: -5 }}
                onClick={() => setActiveGame('platform')}
              >
                <div className="text-4xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-semibold mb-2">Explorador de Carreras</h3>
                <p className="text-indigo-200">Corre, salta y recoge ítems para descubrir diferentes profesiones</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg cursor-pointer hover:bg-white/20 transition-colors"
                whileHover={{ y: -5 }}
                onClick={() => setActiveGame('quiz')}
              >
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-xl font-semibold mb-2">Quiz de Carreras</h3>
                <p className="text-indigo-200">Responde preguntas divertidas sobre tus preferencias profesionales</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg cursor-pointer hover:bg-white/20 transition-colors"
                whileHover={{ y: -5 }}
                onClick={() => setActiveGame('memory')}
              >
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold mb-2">Juego de Memoria</h3>
                <p className="text-indigo-200">Encuentra parejas de carreras y descubre tus intereses</p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-semibold mb-4">Tu Progreso</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(careerPoints).map(([career, points]) => (
                  <div key={career} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">
                        {career === 'artistic' ? '🎨' :
                         career === 'investigative' ? '🔬' :
                         career === 'social' ? '👥' :
                         career === 'enterprising' ? '💼' :
                         career === 'realistic' ? '🔧' : '📊'}
                      </span>
                      <span className="capitalize font-medium">{career}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-400 h-2 rounded-full" 
                        style={{ width: `${points * 20}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-indigo-200 mt-1">{points} puntos</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

