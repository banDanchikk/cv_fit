import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import { LuTimer } from "react-icons/lu";
import { MdSportsScore } from "react-icons/md";
import { FaCamera } from "react-icons/fa6";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";
import "./WorkoutProces.css"
import Modal from '../components/Modal'
import Confetti from 'react-confetti'

export default function WorkoutSession() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const { id: sessionId } = useParams();
    const [workoutId, setWorkoutId] = useState(null);
    const [workout, setWorkout] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)

    const [completedSets, setCompletedSets] = useState(() => {
        const saved = sessionStorage.getItem(`completedSets_${sessionId}`)
        return saved ? JSON.parse(saved) : {}
    })

    const [isResting, setIsResting] = useState(false)
    const [restTime, setRestTime] = useState(0)
    const [sessionTime, setSessionTime] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [socketData, setSocketData] = useState({ counter: 0, stage: "up", image: "" });
    const [isGlowing, setIsGlowing] = useState(false);
    const [currentWeight, setCurrentWeight] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [summaryOpen, setSummaryOpen] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [leaveModalOpen, setLeaveModalOpen] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState(null)
    const [videoLoading, setVideoLoading] = useState(false)
    const [finalTime, setFinalTime] = useState(null)
    const [prevStats, setPrevStats] = useState(null)
    const [extraSets, setExtraSets] = useState(() => {
        const saved = sessionStorage.getItem(`extraSets_${sessionId}`)
        return saved ? JSON.parse(saved) : {}
    })


    const currentExercise = workout?.exercises?.[currentExerciseIndex];

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !summaryOpen && currentLocation.pathname !== nextLocation.pathname
    )

    useEffect(() => {
        if (blocker.state === 'blocked') {
            setLeaveModalOpen(true)
        }
    }, [blocker.state])

    useEffect(() => {
        sessionStorage.setItem(`completedSets_${sessionId}`, JSON.stringify(completedSets))
    }, [completedSets, sessionId])

    useEffect(() => {
        sessionStorage.setItem(`extraSets_${sessionId}`, JSON.stringify(extraSets))
    }, [extraSets, sessionId])

    useEffect(() => {
        if (startTime) {
            sessionStorage.setItem(`startTime_${sessionId}`, startTime.toISOString())
        }
    }, [startTime, sessionId])

    useEffect(() => {
        let ws;

        if (isReady) {
            const exerciseKey = currentExercise.name.toLowerCase().replace(/\s+/g, '-');
            ws = new WebSocket(`ws://localhost:8000/video/workout/${exerciseKey}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setVideoLoading(false)
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
        const savedStart = sessionStorage.getItem(`startTime_${sessionId}`)
        const now = savedStart ? new Date(savedStart) : new Date()

        if (!savedStart) {
            sessionStorage.setItem(`startTime_${sessionId}`, now.toISOString())
        }

        setStartTime(now)

        const tick = () => setSessionTime(Math.floor((new Date() - now) / 1000))
        const interval = setInterval(tick, 1000)

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') tick()
        }

        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [sessionId])

    useEffect(() => {
        if (socketData.counter > 0) {
            setIsGlowing(true);
            const timer = setTimeout(() => setIsGlowing(false), 500);
            return () => clearTimeout(timer);
        }
    }, [socketData.counter]);

    useEffect(() => {
        const fetchSession = async () => {
            const res = await fetch(`http://127.0.0.1:8000/workout_sessions/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const session = await res.json();
            setWorkoutId(session.workout_id);

            const wRes = await fetch(`http://127.0.0.1:8000/workouts/${session.workout_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const wData = await wRes.json();
            setWorkout(wData);
        };

        fetchSession();
    }, [sessionId]);

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

    const getTotalSets = (exercise) => {
        return exercise.sets + (extraSets[exercise.id] || 0)
    }

    const handleAddSet = () => {
        const exId = currentExercise.id
        setExtraSets(prev => ({
            ...prev,
            [exId]: (prev[exId] || 0) + 1
        }))
    }

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
            const updated = [
                ...prevSets,
                {
                    reps: socketData.counter,
                    weight: currentWeight || 0
                }
            ];
            return { ...prev, [exId]: updated };
        });

        setSocketData({ counter: 0, stage: "up", image: "" });
        setIsResting(true);
        setRestTime(60);
        setIsReady(false);
    };

    const clearSession = () => {
        sessionStorage.removeItem(`completedSets_${sessionId}`)
        sessionStorage.removeItem(`startTime_${sessionId}`)
    }

    const handleFinish = async () => {
        setFinalTime(sessionTime)

        const sets = [];
        Object.entries(completedSets).forEach(([exerciseId, setsArr]) => {
            setsArr.forEach((set, index) => {
                sets.push({
                    exercise_id: Number(exerciseId),
                    set_number: index + 1,
                    reps: set.reps,
                    weight: Number(set.weight) || 0
                });
            });
        });

        await fetch(`http://127.0.0.1:8000/workout_sessions/${sessionId}/finish`, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ sets, ended_at: new Date().toISOString() })
        });

        const prevRes = await fetch(`http://127.0.0.1:8000/workout_sessions/${sessionId}/previous`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (prevRes.ok) {
            const prevData = await prevRes.json()
            setPrevStats(prevData)
        }

        setShowConfetti(true);
        setSummaryOpen(true);
    };

    const getDiff = (current, previous) => {
        if (!previous || previous === 0) return null
        const diff = ((current - previous) / previous * 100).toFixed(0)
        return Number(diff)
    }

    const handleCloseSummary = () => {
        clearSession()
        setShowConfetti(false)
        setSummaryOpen(false)
        navigate("/workouts")
    }

    const handleStartCamera = () => {
        setVideoLoading(true)
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

    const totalReps = Object.values(completedSets)
        .flat()
        .reduce((sum, s) => sum + Number(s.reps), 0)

    const totalVolume = Object.values(completedSets)
        .flat()
        .reduce((sum, s) => sum + (Number(s.reps) * Number(s.weight)), 0)

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
                <button className="main-btn" style={{ fontSize: '1.2em', padding: '0px 25px' }} onClick={handleFinish}><p>Finish</p> <MdSportsScore style={{ fontSize: '1.5em' }} /></button>
            </div>

            <div className="session-body">

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

                <div className="session-main">
                    {!isReady ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="video-area">
                                <div className="camera-icon" onClick={handleStartCamera}><FaCamera /></div>
                            </div>
                            <h2 style={{ color: 'white' }}>Ready to Start</h2>
                            <h2 style={{ color: 'gray' }}>Click on camera icon above to begin your workout</h2>
                        </div>
                    ) : videoLoading ? (
                        <div className="video-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1em' }}>
                            <div className="video-spinner" />
                            <h2 style={{ color: 'gray' }}>Starting camera...</h2>
                        </div>
                    ) : (
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

                <div className="session-sets">
                    {Array.from({ length: getTotalSets(currentExercise) }).map((_, i) => {
                        const savedSet = completedSets[currentExercise.id]?.[i];
                        const isDone = !!savedSet;

                        return (
                            <div key={i} className={`set-item ${isDone ? "done" : ""}`}>
                                <span className="set-number">{i + 1}.</span>

                                <span className="set-reps">
                                    {isDone ? savedSet.reps : currentExercise.reps}
                                </span>

                                <span className="set-divider">X</span>

                                <div className="set-action-area">
                                    {isDone ? (
                                        <div className="set-result">
                                            <strong>{savedSet.weight}</strong> kg
                                        </div>
                                    ) : (
                                        i === (completedSets[currentExercise.id]?.length || 0) && (
                                            <div className="weight-input-wrapper">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={currentWeight}
                                                    onChange={(e) => setCurrentWeight(e.target.value)}
                                                    className="weight-input"
                                                />
                                                <span>kg</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <button
                        className="primary-btn"
                        onClick={handleCompleteSet}
                        disabled={isResting || !currentWeight}
                    >
                        Complete Set
                    </button>

                    <button
                        className="add-set-btn"
                        onClick={handleAddSet}
                        disabled={isResting}
                    >
                        + Add Set
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

            {showConfetti && (
                <Confetti
                    recycle={false}
                    numberOfPieces={400}
                    onConfettiComplete={() => setShowConfetti(false)}
                />
            )}
            <Modal
                isOpen={leaveModalOpen}
                onClose={() => {
                    setLeaveModalOpen(false);
                    blocker.reset?.();
                }}
                title="Leave workout? 🏃"
            >
                <div style={{ textAlign: 'center', padding: '1em' }}>
                    <p style={{ color: 'var(--text)', marginBottom: '1.5em' }}>
                        Your workout progress will be lost if you leave now.
                    </p>
                    <div style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}>
                        <button
                            className="main-btn"
                            style={{ padding: '0.6em 1.5em', fontSize: '1em' }}
                            onClick={() => {
                                setLeaveModalOpen(false);
                                blocker.reset?.();
                            }}
                        >
                            Keep Training
                        </button>
                        <button
                            className="danger-btn"
                            style={{ padding: '0.6em 1.5em', fontSize: '1em', marginTop: '8px' }}
                            onClick={async () => {
                                await fetch(`http://127.0.0.1:8000/workout_sessions/${sessionId}`, {
                                    method: "DELETE",
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                clearSession()
                                setLeaveModalOpen(false)
                                blocker.proceed?.()
                            }}
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={summaryOpen} onClose={handleCloseSummary} title="Workout complete">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { label: 'Duration', value: formatTime(finalTime ?? sessionTime), raw: finalTime, prevRaw: prevStats?.duration, prevDisplay: prevStats?.duration ? formatTime(prevStats.duration) : null },
                        { label: 'Sets done', value: totalSetsCompleted, raw: totalSetsCompleted, prevRaw: prevStats?.total_sets, prevDisplay: prevStats?.total_sets },
                        { label: 'Total reps', value: totalReps, raw: totalReps, prevRaw: prevStats?.total_reps, prevDisplay: prevStats?.total_reps },
                        { label: 'Volume', value: `${totalVolume} kg`, raw: totalVolume, prevRaw: prevStats?.total_volume, prevDisplay: prevStats?.total_volume ? `${Math.round(prevStats.total_volume)} kg` : null },
                    ].map(({ label, value, raw, prevRaw, prevDisplay }) => {
                        const diff = getDiff(raw, prevRaw)
                        return (
                            <div key={label} style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{label}</span>
                                <span style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</span>
                                {diff !== null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 7px',
                                            borderRadius: '20px',
                                            background: diff > 0 ? '#dcfce7' : '#fee2e2',
                                            color: diff > 0 ? '#166534' : '#991b1b'
                                        }}>
                                            {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}%
                                        </span>
                                        {prevDisplay && <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>prev: {prevDisplay}</span>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {Object.values(completedSets).some(s => s.length > 0) && (
                    <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '14px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 10px' }}>Exercises</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                            {workout.exercises.map(ex => {
                                const sets = completedSets[ex.id] || []
                                if (sets.length === 0) return null
                                return (
                                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', flex: 1 }}>{ex.name}</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', flex: 2 }}>
                                            {sets.map((s, i) => (
                                                <span key={i} style={{ fontSize: '11px', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '20px', border: '0.5px solid var(--color-border-tertiary)' }}>
                                                    {s.reps} × {s.weight}kg
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <button className="main-btn" style={{ width: '100%' }} onClick={handleCloseSummary}>
                    Done
                </button>
            </Modal>
        </div>
    )
}