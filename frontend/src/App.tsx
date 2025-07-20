import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  RotateCcw,
  BookText,
  Play,
  Volume2,
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Sun,
  Moon,
  Settings,
  User,
  BarChart3,
  Lightbulb,
  Shield,
  Pause,
  Home,
  ChevronLeft,
  Star,
  Clock,
  Target,
  Smile,
  Frown,
  Meh,
  Users,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Gift
} from 'lucide-react';

type ViewType = 'home' | 'recording' | 'response' | 'feedback' | 'wisdom' | 'journal' | 'insights' | 'profile' | 'breathing' | 'goals';

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  transcript: string;
  response: string;
  sentiment: 'happy' | 'stressed' | 'neutral';
  mood: number; // 1-5 scale
  feedback?: {
    emoji: string;
    rating: number;
    helpfulness: number;
  };
}

interface MoodData {
  date: string;
  mood: number;
  sentiment: 'happy' | 'stressed' | 'neutral';
}

interface FeedbackData {
  id: string;
  emoji: string;
  rating: number;
  helpfulness: number;
  date: string;
  sentiment: 'happy' | 'stressed' | 'neutral';
}

interface WisdomCard {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'mindfulness' | 'gratitude' | 'resilience' | 'self-care' | 'growth';
  mood: 'happy' | 'stressed' | 'neutral' | 'all';
  likes: number;
}

const communityWisdom: WisdomCard[] = [
  {
    id: '1',
    title: 'The Power of Small Moments',
    content: 'I\'ve learned that happiness isn\'t about big achievements. It\'s about noticing the small things - the first sip of coffee, a friend\'s laugh, or the way sunlight streams through my window.',
    author: 'Maya K.',
    category: 'mindfulness',
    mood: 'happy',
    likes: 247
  },
  {
    id: '2',
    title: 'Breathing Through the Storm',
    content: 'When anxiety feels overwhelming, I remind myself: this feeling is temporary. I take three deep breaths and ask myself - what\'s one small thing I can do right now?',
    author: 'Alex R.',
    category: 'resilience',
    mood: 'stressed',
    likes: 189
  },
  {
    id: '3',
    title: 'Permission to Rest',
    content: 'I used to think rest was lazy. Now I know it\'s revolutionary. Your worth isn\'t measured by your productivity. You deserve rest, just because you exist.',
    author: 'Jordan L.',
    category: 'self-care',
    mood: 'all',
    likes: 312
  },
];

const emojiOptions = [
  { emoji: '😊', label: 'Happy', value: 5 },
  { emoji: '😌', label: 'Peaceful', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😔', label: 'Sad', value: 2 },
  { emoji: '😰', label: 'Stressed', value: 1 }
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [speechText, setSpeechText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For loading state
  const [isPlaying, setIsPlaying] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackData[]>([]);
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [userName, setUserName] = useState('Friend');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState('Take 5 minutes for mindfulness');
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{emoji: string; rating: number; helpfulness: number} | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showBurst, setShowBurst] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [currentWisdom, setCurrentWisdom] = useState<WisdomCard[]>([]);

  const recognitionRef = useRef<any>(null);
  const lastResponseRef = useRef('');
  const currentSentimentRef = useRef<'happy' | 'stressed' | 'neutral'>('neutral');
  const currentEntryRef = useRef<string>('');

  useEffect(() => {
    const savedEntries = localStorage.getItem('asha-journal');
    const savedMoodHistory = localStorage.getItem('asha-mood-history');

    if (savedEntries) setJournalEntries(JSON.parse(savedEntries));
    if (savedMoodHistory) setMoodHistory(JSON.parse(savedMoodHistory));
  }, []);

  useEffect(() => {
    const currentMoodType = currentMood >= 4 ? 'happy' : currentMood <= 2 ? 'stressed' : 'neutral';
    const relevantWisdom = communityWisdom.filter(w => w.mood === currentMoodType || w.mood === 'all');
    setCurrentWisdom(relevantWisdom.slice(0, 3));
  }, [currentMood]);


  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
            isFinal = true;
          } else {
            transcript += event.results[i][0].transcript;
          }
        }

        if (isFinal) {
          setSpeechText(transcript);
          setTimeout(() => processSpeechResult(transcript), 500);
        } else {
          setSpeechText(transcript + '...');
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setSpeechText("Sorry, I couldn't hear that. Please try again.");
        setTimeout(() => setCurrentView('home'), 2000);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [userName]);

  const startRecognition = () => {
    if (recognitionRef.current) {
      setCurrentView('recording');
      setSpeechText("Speak now...");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

const processSpeechResult = async (text: string) => {
    console.log('Sending to backend:', text);
    setSpeechText(text); // Show the final transcript
    setIsProcessing(true); // Start loading
    setCurrentView('recording'); // Stay on a view that indicates loading

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/get-response`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: text }),
        });

        if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
        }

        const aiData = await response.json();
        console.log('Received from backend:', aiData);

        lastResponseRef.current = aiData.response;
        currentSentimentRef.current = aiData.sentiment;

        setResponseText(aiData.response);
        setCurrentMood(aiData.mood);
        setCurrentView('response');
        playResponse(aiData.response);

        currentEntryRef.current = Date.now().toString();

        const today = new Date().toISOString().split('T')[0];
        const newMoodData: MoodData = {
        date: today,
        mood: aiData.mood,
        sentiment: aiData.sentiment,
        };

        const updatedMoodHistory = [...moodHistory.filter(m => m.date !== today), newMoodData];
        setMoodHistory(updatedMoodHistory);
        localStorage.setItem('asha-mood-history', JSON.stringify(updatedMoodHistory));

    } catch (error) {
        console.error("Failed to get AI response:", error);
        setResponseText("Sorry, I'm having trouble connecting. Please try again later.");
        setCurrentView('response');
    } finally {
        setIsProcessing(false); // Stop loading
    }
};


const playResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setTimeout(() => {
          setCurrentView('feedback');
        }, 1000);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEmojiSliderChange = (position: number) => {
    setSliderPosition(position);
    setIsSliding(true);
    

    const emojiIndex = Math.floor((position / 100) * emojiOptions.length);
    const clampedIndex = Math.min(emojiIndex, emojiOptions.length - 1);
    setSelectedEmoji(emojiOptions[clampedIndex].emoji);
  };

  const handleEmojiSelection = () => {
    if (selectedEmoji) {
      setShowBurst(true);
      setIsSliding(false);
      
      const selectedOption = emojiOptions.find(option => option.emoji === selectedEmoji);
      if (selectedOption) {
        setCurrentFeedback({
          emoji: selectedEmoji,
          rating: selectedOption.value,
          helpfulness: Math.floor(Math.random() * 5) + 1 // Random helpfulness for demo
        });
      }
      

      setTimeout(() => {
        setShowBurst(false);
        setCurrentView('wisdom');
      }, 2000);
    }
  };

  const saveFeedbackToJournal = () => {
    if (currentFeedback) {
      const newEntry: JournalEntry = {
        id: currentEntryRef.current,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        transcript: speechText,
        response: responseText,
        sentiment: currentSentimentRef.current,
        mood: currentMood,
        feedback: currentFeedback
      };
      
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      localStorage.setItem('asha-journal', JSON.stringify(updatedEntries));
      

      const feedbackData: FeedbackData = {
        id: Date.now().toString(),
        emoji: currentFeedback.emoji,
        rating: currentFeedback.rating,
        helpfulness: currentFeedback.helpfulness,
        date: new Date().toISOString(),
        sentiment: currentSentimentRef.current
      };
      
      const updatedFeedback = [...feedbackHistory, feedbackData];
      setFeedbackHistory(updatedFeedback);
      localStorage.setItem('asha-feedback-history', JSON.stringify(updatedFeedback));
      

      setCurrentFeedback(null);
      setSelectedEmoji('');
      setSliderPosition(50);
    }
  };

  const saveToJournal = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      transcript: speechText,
      response: responseText,
      sentiment: currentSentimentRef.current,
      mood: currentMood
    };
    
    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);
    localStorage.setItem('asha-journal', JSON.stringify(updatedEntries));
    
    alert("Your thoughts have been saved to your journal! 📝");
  };

  const startBreathingExercise = () => {
    setCurrentView('breathing');
    setIsBreathing(true);
    setBreathingCount(0);
  };

  const completeGoal = () => {
    setGoalCompleted(true);
    localStorage.setItem('asha-goal-completed', JSON.stringify(true));
    alert("Congratulations! You've completed your daily goal! 🎉");
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood <= 2) return <Frown className="w-6 h-6 text-red-500" />;
    return <Meh className="w-6 h-6 text-yellow-500" />;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName}! ☀️`;
    if (hour < 17) return `Good afternoon, ${userName}! 🌤️`;
    return `Good evening, ${userName}! 🌙`;
  };

  const renderBurstAnimation = () => {
    if (!showBurst) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="relative">
          {/* Central emoji */}
          <div className="text-6xl animate-bounce">
            {selectedEmoji}
          </div>
          
          {/* Burst particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-40px)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
          
          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-yellow-400 animate-pulse"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
                animationDelay: `${i * 0.15}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ASHA-Sphere
              </h1>
              <p className="text-gray-500 font-medium">Your Digital Confidante</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
              <p className="text-lg font-medium text-gray-700">{getGreeting()}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Today's Goal:</span>
                <button 
                  onClick={completeGoal}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    goalCompleted 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {goalCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{dailyGoal}</p>
            </div>

            <div className="text-center py-6">
              <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
                How are you feeling today?
              </p>
              
              <div className="flex justify-center mb-8">
                <button
                  onClick={startRecognition}
                  className="relative w-36 h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 hover:from-orange-500 hover:via-orange-600 hover:to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center group overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <Mic className="w-14 h-14 text-white group-hover:scale-110 transition-transform duration-200 relative z-10" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl px-6 py-4 shadow-inner mb-6">
                <p className="text-orange-800 font-semibold">Tap and Speak</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={startBreathingExercise}
                  className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 font-medium py-3 px-3 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">Breathe</span>
                </button>
                <button
                  onClick={() => setCurrentView('wisdom')}
                  className="bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-orange-700 font-medium py-3 px-3 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Wisdom</span>
                </button>
                <button
                  onClick={() => setCurrentView('insights')}
                  className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 font-medium py-3 px-3 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Insights</span>
                </button>
              </div>
            </div>

            
            <div className="flex justify-around bg-white/50 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-3 rounded-xl bg-purple-100 text-purple-600"
              >
                <Home className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentView('journal')}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-600"
              >
                <BookText className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentView('insights')}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-600"
              >
                <BarChart3 className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentView('profile')}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-600"
              >
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ASHA-Sphere
              </h1>
              <p className="text-gray-500 font-medium">Your Digital Confidante</p>
            </div>

            <div className="text-center py-6">
              <p className="text-xl text-gray-700 font-medium mb-8">
                Listening patiently...
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-36 h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center">
                    <Mic className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-30 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute inset-0 rounded-full bg-red-300 opacity-20 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-1 mb-8">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-orange-500 to-red-400 rounded-full animate-pulse"
                    style={{
                      width: '3px',
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.8 + Math.random() * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-6 py-4 shadow-inner min-h-[60px] flex items-center justify-center">
                <p className="text-purple-800 font-medium italic">
                  {speechText}
                </p>
              </div>
            </div>
          </div>
        );

      case 'response':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ASHA-Sphere
              </h1>
              <p className="text-gray-500 font-medium">Your Digital Confidante</p>
            </div>

            <div className="py-4">
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-inner border border-purple-100">
                <p className="text-lg text-gray-800 font-medium leading-relaxed mb-4">
                  {responseText}
                </p>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-center space-x-3">
                  <button 
                    onClick={() => playResponse(lastResponseRef.current)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isPlaying 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  
                  <div className="flex items-center space-x-1 flex-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all duration-200 ${
                          isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-purple-200'
                        }`}
                        style={{
                          width: '2px',
                          height: `${Math.random() * 16 + 4}px`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 shadow-inner border border-blue-100">
                <h3 className="text-lg font-bold text-indigo-800 mb-2 flex items-center">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full mr-2 flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-indigo-600" />
                  </div>
                  Daily Tip
                </h3>
                <p className="text-indigo-700 text-sm font-medium">
                  {currentSentimentRef.current === 'stressed' 
                    ? "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8."
                    : currentSentimentRef.current === 'happy'
                    ? "Gratitude amplifies joy! Write down 3 things you're grateful for today."
                    : "Mindful moments matter. Take 5 deep breaths and notice your surroundings."
                  }
                </p>
              </div>

              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => playResponse(lastResponseRef.current)}
                  className="flex-1 bg-gradient-to-r from-purple-200 to-indigo-200 hover:from-purple-300 hover:to-indigo-300 text-purple-800 font-semibold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Listen Again</span>
                </button>
                
                <button
                  onClick={saveToJournal}
                  className="flex-1 bg-gradient-to-r from-pink-200 to-red-200 hover:from-pink-300 hover:to-red-300 text-red-700 font-semibold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <BookText className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>

              <button
                onClick={() => setCurrentView('home')}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Mic className="w-5 h-5" />
                <span>Speak Again</span>
              </button>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                How was that?
              </h1>
              <p className="text-gray-500 font-medium">Your feedback helps me understand you better</p>
            </div>

            <div className="py-6">
              <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 mb-6 shadow-inner border border-yellow-100">
                <h3 className="text-lg font-bold text-orange-800 mb-4 text-center">
                  How are you feeling right now?
                </h3>
                
                {/* Emoji Slider */}
                <div className="relative mb-6">
                  <div className="w-full h-16 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-blue-200 rounded-full p-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => handleEmojiSliderChange(parseInt(e.target.value))}
                      className="w-full h-full bg-transparent appearance-none cursor-pointer"
                      style={{
                        background: 'transparent',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    />
                    <div 
                      className="absolute top-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl transform -translate-y-1/2 transition-all duration-300"
                      style={{ left: `calc(${sliderPosition}% - 24px)` }}
                    >
                      {selectedEmoji || '😊'}
                    </div>
                  </div>
                  
                  
                  <div className="flex justify-between mt-4 px-2">
                    {emojiOptions.map((option, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xl mb-1">{option.emoji}</div>
                        <div className="text-xs text-gray-600">{option.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleEmojiSelection}
                    disabled={!selectedEmoji}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedEmoji 
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {selectedEmoji ? `I'm feeling ${selectedEmoji}` : 'Slide to select your mood'}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-gray-500 hover:text-gray-700 font-medium underline"
                >
                  Skip feedback
                </button>
              </div>
            </div>
          </div>
        );

      case 'wisdom':
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Community Wisdom
              </h1>
              <p className="text-gray-500 font-medium">Shared insights from our caring community</p>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
              {currentWisdom.map((wisdom) => (
                <div key={wisdom.id} className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{wisdom.title}</h3>
                        <p className="text-xs text-gray-500">by {wisdom.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-pink-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{wisdom.likes}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{wisdom.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                      {wisdom.category}
                    </span>
                    <button className="text-pink-500 hover:text-pink-600 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  saveFeedbackToJournal();
                  setCurrentView('home');
                }}
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Done</span>
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Mic className="w-5 h-5" />
                <span>Speak Again</span>
              </button>
            </div>
          </div>
        );

      case 'journal':
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">My Journal</h2>
              <div className="w-10"></div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {journalEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No journal entries yet</p>
                  <p className="text-sm text-gray-400">Start by sharing your thoughts!</p>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div key={entry.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMoodIcon(entry.mood)}
                        <span className="text-sm font-medium text-gray-600">{entry.date}</span>
                        {entry.feedback && (
                          <span className="text-lg">{entry.feedback.emoji}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{entry.time}</span>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm">{entry.transcript}</p>
                    <div className="bg-purple-50 rounded-lg p-3 mb-2">
                      <p className="text-purple-700 text-sm italic">{entry.response}</p>
                    </div>
                    {entry.feedback && (
                      <div className="bg-orange-50 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-xs text-orange-600">Feedback:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{entry.feedback.emoji}</span>
                          <span className="text-xs text-orange-600">Rating: {entry.feedback.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Insights</h2>
              <div className="w-10"></div>
            </div>

            <div className="space-y-6">
              {/* Mood Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Heart className="w-6 h-6 text-red-500 mr-2" />
                  Mood Overview
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {moodHistory.filter(m => m.sentiment === 'happy').length}
                    </div>
                    <div className="text-sm text-gray-600">Happy Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {moodHistory.filter(m => m.sentiment === 'neutral').length}
                    </div>
                    <div className="text-sm text-gray-600">Neutral Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {moodHistory.filter(m => m.sentiment === 'stressed').length}
                    </div>
                    <div className="text-sm text-gray-600">Tough Days</div>
                  </div>
                </div>
              </div>

              {/* Feedback Analytics */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <MessageCircle className="w-6 h-6 text-orange-500 mr-2" />
                  Feedback Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Feedback</span>
                    <span className="font-bold text-orange-600">{feedbackHistory.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Rating</span>
                    <span className="font-bold text-orange-600">
                      {feedbackHistory.length > 0 
                        ? (feedbackHistory.reduce((acc, f) => acc + f.rating, 0) / feedbackHistory.length).toFixed(1)
                        : 'N/A'
                      }/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Most Used Emoji</span>
                    <span className="font-bold text-orange-600">
                      {feedbackHistory.length > 0 
                        ? feedbackHistory.reduce((acc, f) => {
                            acc[f.emoji] = (acc[f.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>).entries ? 
                          Object.entries(feedbackHistory.reduce((acc, f) => {
                            acc[f.emoji] = (acc[f.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                          : 'N/A'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                  This Week
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Journal Entries</span>
                    <span className="font-bold text-green-600">{journalEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversations</span>
                    <span className="font-bold text-green-600">{journalEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Goals Completed</span>
                    <span className="font-bold text-green-600">{goalCompleted ? 1 : 0}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="w-6 h-6 text-orange-500 mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-gray-700 text-sm">Try morning meditation for better mood stability</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-gray-700 text-sm">Regular check-ins help track emotional patterns</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-gray-700 text-sm">Consider breathing exercises during stressful moments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'breathing':
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Breathing Exercise</h2>
              <div className="w-10"></div>
            </div>

            <div className="text-center py-8">
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center transition-all duration-4000 ${
                  isBreathing ? 'scale-110' : 'scale-100'
                }`}>
                  <Brain className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-blue-300 opacity-30 animate-ping"></div>
              </div>

              <p className="text-xl text-gray-700 mb-4">
                {isBreathing ? 'Breathe slowly and deeply...' : 'Ready to start breathing exercise?'}
              </p>
              
              <p className="text-lg text-gray-600 mb-8">
                Count: {breathingCount}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsBreathing(!isBreathing);
                    if (!isBreathing) {
                      const interval = setInterval(() => {
                        setBreathingCount(prev => {
                          if (prev >= 10) {
                            clearInterval(interval);
                            setIsBreathing(false);
                            alert("Great job! You've completed the breathing exercise! 🧘‍♀️");
                            return 0;
                          }
                          return prev + 1;
                        });
                      }, 4000);
                    }
                  }}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isBreathing 
                      ? 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600' 
                      : 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600'
                  }`}
                >
                  {isBreathing ? 'Stop Exercise' : 'Start Breathing'}
                </button>

                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Instructions:</strong> Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds. Repeat 10 times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
              <div className="w-10"></div>
            </div>

            <div className="space-y-6">
              {/* Profile Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{userName}</h3>
                <p className="text-gray-600">Mental Wellness Journey</p>
              </div>

              {/* Settings */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Settings className="w-6 h-6 text-gray-600 mr-2" />
                  Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        localStorage.setItem('asha-username', e.target.value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Daily Goal</label>
                    <input
                      type="text"
                      value={dailyGoal}
                      onChange={(e) => {
                        setDailyGoal(e.target.value);
                        localStorage.setItem('asha-daily-goal', e.target.value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Set your daily wellness goal"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Your Progress
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{journalEntries.length}</div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((moodHistory.filter(m => m.sentiment === 'happy').length / Math.max(moodHistory.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Happy Days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      
      <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-300 via-pink-300 via-rose-300 to-orange-300"></div>
      
      
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-32 right-16 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-violet-400/40 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-orange-300/25 to-pink-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-indigo-400/35 to-purple-400/35 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-4 w-20 h-20 bg-gradient-to-br from-rose-400/30 to-orange-400/30 rounded-full blur-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/4 right-8 w-36 h-36 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2.5s' }}></div>
      
      
      <div className="absolute top-20 left-1/2 w-16 h-16 bg-gradient-to-br from-cyan-400/25 to-blue-400/25 rounded-full blur-md animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-40 left-1/3 w-12 h-12 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-sm animate-float" style={{ animationDelay: '1.8s' }}></div>
      
      
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 via-transparent to-orange-500/5"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/5 via-transparent to-blue-500/5"></div>
      
      {/* Animated Light Rays */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-shimmer"></div>
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-200/30 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-purple-200/25 to-transparent animate-shimmer" style={{ animationDelay: '2s' }}></div>

      
      {renderBurstAnimation()}

      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-all duration-700 ease-out min-h-[600px]">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App;