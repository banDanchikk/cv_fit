import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import { LuTimer } from "react-icons/lu";
import { MdSportsScore } from "react-icons/md";
import { FaCamera } from "react-icons/fa6";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";
import "./WorkoutProces.css"

export default function WorkoutSession() {
    const navigate = useNavigate()
    const { id } = useParams();

    const [workout, setWorkout] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [completedSets, setCompletedSets] = useState({})
    const [isResting, setIsResting] = useState(false)
    const [restTime, setRestTime] = useState(0)
    const [sessionTime, setSessionTime] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [socketData, setSocketData] = useState({ counter: 0, stage: "up", image: "" });
    const [isGlowing, setIsGlowing] = useState(false);

    const currentExercise = workout?.exercises?.[currentExerciseIndex];

    useEffect(() => {
        let ws;

        if (isReady) {
            const exerciseKey = currentExercise.name.toLowerCase().replace(/\s+/g, '-');
            ws = new WebSocket(`ws://localhost:8000/video/workout/${exerciseKey}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setSocketData({
                    image: `data:image/jpeg;base64,${data.image}`,
                    counter: data.counter,
                    stage: data.stage
                });
            };

            ws.onclose = () => console.log("WebSocket Closed");
        }

        return () => {
            if (ws) ws.close();
        };
    }, [isReady, currentExercise]);

    useEffect(() => {
        if (socketData.counter > 0) {
            setIsGlowing(true);
            const timer = setTimeout(() => setIsGlowing(false), 500); // Ефект триває 500мс
            return () => clearTimeout(timer);
        }
    }, [socketData.counter]);

    useEffect(() => {
        const fetchWorkout = async () => {
            const res = await fetch(`http://127.0.0.1:8000/workouts/${id}`);
            const data = await res.json();
            setWorkout(data);
        };

        fetchWorkout();
    }, [id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSessionTime(prev => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!isResting || restTime <= 0) return

        const interval = setInterval(() => {
            setRestTime(prev => prev - 1)
        }, 1000)

        if (restTime === 1) {
            setIsResting(false)
        }

        return () => clearInterval(interval)
    }, [isResting, restTime])

    const addRestTime = (seconds) => {
        setRestTime(prev => prev + seconds);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const handleCompleteSet = () => {
        const exId = currentExercise.id;
        setCompletedSets(prev => {
            const prevSets = prev[exId] || [];
            const updated = [...prevSets, { reps: socketData.counter }];
            return { ...prev, [exId]: updated };
        });
        setIsResting(true);
        setRestTime(60);
        setIsReady(false);
    };

    const handleStartCamera = () => {
        setIsReady(true);
    };

    const handleNextExercise = () => {
        setCurrentExerciseIndex(prev =>
            prev === workout.exercises.length - 1 ? 0 : prev + 1
        );
        setIsReady(false);
    };

    const handlePrewExercise = () => {
        setCurrentExerciseIndex(prev =>
            prev === 0 ? workout.exercises.length - 1 : prev - 1
        );
        setIsReady(false);
    };

    if (!workout) return <p>Loading...</p>;
    if (!workout.exercises || workout.exercises.length === 0)
        return <p>No exercises found</p>;

    const totalSetsCompleted = Object.values(completedSets)
        .reduce((sum, arr) => sum + arr.length, 0);

    const totalSets = workout.exercises
        .reduce((sum, ex) => sum + ex.sets, 0);

    const progressPercent = totalSets === 0
        ? 0
        : Math.floor((totalSetsCompleted / totalSets) * 100);

    return (
        <div className="session">

            <div className="session-header">
                <h2>{workout.name}</h2>
                <div className="session-meta">
                    <span><LuTimer /> {formatTime(sessionTime)}</span>
                    <span>Progress: {progressPercent}%</span>
                </div>
                <button className="main-btn" style={{ fontSize: '1.2em', padding: '0px 25px' }}><p>Finish</p> <MdSportsScore style={{ fontSize: '1.5em' }} /></button>
            </div>

            <div className="session-body">

                {/* Exercise List */}
                <div className="session-sidebar">
                    {workout.exercises.map((ex, index) => (
                        <div
                            key={ex.id}
                            className={`exercise-item ${index === currentExerciseIndex ? "active" : ""}`}
                            onClick={() => {
                                setCurrentExerciseIndex(index)
                                setIsReady(false);
                            }}
                        >
                            <span className="exercise-number">{index + 1}</span>

                            <img
                                className="list-img"
                                src={ex.gif_url}
                                alt={ex.name}
                            />

                            <div className="exercise-text">
                                <p className="exercise-name">{ex.name}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Area */}
                <div className="session-main">
                    {!isReady ?
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="video-area">
                                <div className="camera-icon" onClick={handleStartCamera}><FaCamera /></div>
                            </div>
                            <h2 style={{ color: 'white' }}>Ready to Start</h2>
                            <h2 style={{ color: 'gray' }}>Click on camera icon above to begin your workout</h2>
                            <div className="exercise-info">

                            </div>
                        </div> : (
                            <div className={`video-stream-container ${isGlowing ? "glow-green" : ""}`}>
                                <img
                                    src={socketData.image || ""}
                                    alt={currentExercise.name}
                                    className="video-stream-image"
                                />
                                <div className="counter-badge">{socketData.counter}</div>
                            </div>
                        )}
                    <div className="ex-selector" style={{ backgroundColor: 'white' }}>
                        <div className="ex-selector-content">
                            <button className="main-btn" style={{ fontSize: '1.5em' }} onClick={handlePrewExercise}><GrFormPrevious /></button>
                            <h2>{currentExercise.name}</h2>
                            <button className="main-btn" style={{ fontSize: '1.5em' }} onClick={handleNextExercise}><GrFormNext /></button>
                        </div>
                    </div>
                </div>

                {/* Sets */}
                <div className="session-sets">
                    {Array.from({ length: currentExercise.sets }).map((_, i) => {
                        const done = completedSets[currentExercise.id]?.[i]
                        return (
                            <div
                                key={i}
                                className={`set-item ${done ? "done" : ""}`}
                            >
                                Set {i + 1} – {currentExercise.reps} reps
                            </div>
                        )
                    })}

                    <button
                        className="primary-btn"
                        onClick={handleCompleteSet}
                        disabled={isResting}
                    >
                        Complete Set
                    </button>
                </div>

            </div>

            {isResting && (
                <div className="rest-overlay">
                    <div className="rest-card">
                        <span className="rest-label">Rest</span>
                        <div className="rest-timer">{restTime}<span> sec</span></div>

                        <div className="add-time-group">
                            <button className="sec-btn" onClick={() => addRestTime(30)}>+30 sec</button>
                            <button className="sec-btn" onClick={() => addRestTime(60)}>+1 min</button>
                            <button className="sec-btn" onClick={() => addRestTime(120)}>+2 min</button>
                        </div>

                        <button className="skip-btn" onClick={() => setIsResting(false)}>
                            Skip
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}