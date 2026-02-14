import './WorkoutBarChart.css';

export default function WorkoutBarChart({ exercises }) {
  function aggregateByMuscle(exercises) {
    const result = {};

    exercises.forEach(ex => {
      if (!ex.muscles || !ex.sets) return;

      const muscles = ex.muscles.split(",").map(m => m.trim());

      muscles.forEach(muscle => {
        result[muscle] = (result[muscle] || 0) + ex.sets;
      });
    });

    return Object.entries(result).map(([muscle, sets]) => ({
      muscle,
      sets,
    }));
  }

  const muscleData = aggregateByMuscle(exercises);

  const totalSets = muscleData.reduce((sum, m) => sum + m.sets, 0);

  function calcPercent(sets) {
    return totalSets ? (sets * 100) / totalSets : 0;
  }

  if(exercises.length === 0 || !totalSets){ return <p style={{justifyContent:'center', textAlign:'center'}}>No stats</p>}

  return (
    <div className="chart">
      <div className="chart-info">
        <p>Muscle</p>
        <p>Sets</p>
      </div>
      {muscleData.map(m => {
        const percent = calcPercent(m.sets);

        return (
          <div className="muscle-type" key={m.muscle}>
            <p className="muscle-name">{m.muscle}</p>

            <div className="bar">
              <div
                className="bar-stat"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="percent">{percent.toFixed(0)}%</p>
          </div>
        );
      })}
    </div>
  );
}
