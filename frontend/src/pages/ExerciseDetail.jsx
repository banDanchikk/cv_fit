import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './ExerciseDetail.css'
import { useState, useEffect } from 'react';
import { FaDumbbell, FaBullseye } from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { GiWeightLiftingUp } from "react-icons/gi";
import { CiCalendar } from "react-icons/ci";
import { IoBody } from "react-icons/io5";

import ExerciseStatsCharts from '../components/ExerciseStatsCharts'
import Modal from '../components/Modal';

export default function ExerciseDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [exercise, setExercise] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("instructions");
    const [instructions, setInstructions] = useState(null)
    const [stats, setStats] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [progres, setProgres] = useState({})
    const [period, setPeriod] = useState('3m')

    // разовий максимум = вага + (1+повтори/30)
    // інша формула = вага/(1.0278-(0.0278*повтори))

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/exercises/${id}`)
                if (!response.ok) {
                    throw new Error('Exercise not found')
                }
                const data = await response.json()
                setExercise(data)
                setInstructions(data.instructions.split('.'))
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchExercise()
    }, [id])

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/exercises/${id}/stats`)
            .then(res => res.json())
            .then(data => setStats(
                [...data.stats].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                )
            ))
    }, [id])

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/exercises/stats/${id}`)
            .then(res => res.json())
            .then(data => setProgres(data))
    }, [id])

    function formatDate(iso) {
        if (!iso) return '—'

        return new Date(iso).toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const openModal = () => {
        setModalOpen(true)
    }

    const filterStatsByPeriod = (stats, period) => {
        if (!stats) return []

        const now = new Date()

        return stats.filter(item => {
            const itemDate = new Date(item.date)

            if (period === '3m') {
                const threeMonthsAgo = new Date()
                threeMonthsAgo.setMonth(now.getMonth() - 3)
                return itemDate >= threeMonthsAgo
            }

            if (period === 'year') {
                return itemDate.getFullYear() === now.getFullYear()
            }

            return true
        })
    }

    const renderValue = (value, suffix = '') =>
        value !== null && value !== undefined
            ? `${value}${suffix}`
            : 'No data yet'

    if (loading) {
        return (
            <>
                <Navbar />
                <p style={{ textAlign: 'center', marginTop: '3em' }}>Loading exercise...</p>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <p style={{ textAlign: 'center', marginTop: '3em' }}>{error}</p>
            </>
        )
    }

    return (
        <div>
            <Navbar />

            <div className="exercise-detail-container">
                <div className="exercise-crd">

                    <div className="exercise-header">
                        <h1>{exercise.name}</h1>
                        <span className={`level ${exercise.level}`}>
                            {exercise.level}
                        </span>
                    </div>

                    <div className="exercise-data">
                        <img
                            src={exercise.gif_url}
                            alt={exercise.name}
                        />
                        <div className="exercise-info">
                            <div className="exercise-meta">
                                <div className="meta-item">
                                    <FaBullseye />
                                    <div>
                                        <span>Target muscles</span>
                                        <p>{exercise.muscles}</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <FaDumbbell />
                                    <div>
                                        <span>Equipment</span>
                                        <p>{exercise.equipments}</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <MdFitnessCenter />
                                    <div>
                                        <span>Total Reps</span>
                                        <p>{renderValue(progres?.total_reps)}</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <GiWeightLiftingUp />
                                    <div>
                                        <span>One rep max</span>
                                        <p>{renderValue(progres?.one_rep_max, 'kg')}</p>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <CiCalendar />
                                    <div>
                                        <span>Last Trained</span>
                                        <p>{renderValue(formatDate(progres?.last_trained_at))}</p>
                                    </div>
                                </div>

                            </div>
                            <div className="exercise-meta" style={{ marginTop: '2em' }}>
                                <div className="meta-item">
                                    <button className='practice' onClick={openModal}>
                                        <IoBody /> Practice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tabs">
                        <button
                            className={activeTab === "instructions" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("instructions")}
                        >
                            Instructions
                        </button>

                        <button
                            className={activeTab === "stats" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("stats")}
                        >
                            Statistics
                        </button>
                    </div>

                    {activeTab === "instructions" && (
                        <>
                            <h2 className="section-title">
                                <HiOutlineClipboardList /> Instructions
                            </h2>

                            <div className="instructions">
                                {instructions.slice(0, instructions.length - 1).map((i, idx) => (
                                    <div key={idx} className="instruction-step">
                                        <span className="step-number">{idx + 1}</span>
                                        <p>{i}.</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'stats' && (
                        <div className="wk-form__field" style={{ paddingTop: '1.5em' }}>
                            <select style={{ fontSize: '1.25rem', padding: '12px 16px', borderRadius: '0.75rem;' }}>
                                <option value="3m">3 Months</option>
                                <option value="year">This Year</option>
                                <option value="all">All Times</option>
                            </select>
                            <ExerciseStatsCharts data={filterStatsByPeriod(stats, period)} />
                        </div>
                    )}

                </div>
            </div>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${exercise.name} test`}>
                <img src={`http://localhost:8000/video/${exercise.name.toLowerCase().split(' ').join('-')}`} alt="test_video" style={{ width: "700px", height: 'auto' }} />
            </Modal>
        </div>
    )
}
