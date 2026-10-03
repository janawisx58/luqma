import { useState, useEffect } from 'react';
import './CalorieCard.css';

function CalorieCard() {
  const [goal, setGoal] = useState(() => {
    const savedGoal = localStorage.getItem('luqma_goal');
    return savedGoal ? Number(savedGoal) : 0;
  });

  const [totalFoodCalories, setTotalFoodCalories] = useState(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  const calculateFoodCalories = () => {
    const savedMeals = localStorage.getItem('luqma_meals');
    if (savedMeals) {
      const meals = JSON.parse(savedMeals);
      const total = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
      setTotalFoodCalories(total);
    } else {
      setTotalFoodCalories(0);
    }
  };

  useEffect(() => {
    calculateFoodCalories();
    const handleStorageUpdate = () => calculateFoodCalories();
    window.addEventListener('storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('storage_updated', handleStorageUpdate);
  }, []);

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const newGoal = Number(tempGoal) || 0;
    setGoal(newGoal);
    localStorage.setItem('luqma_goal', newGoal);
    setIsEditingGoal(false);
  };

  const caloriesLeft = goal > 0 ? Math.max(0, goal - totalFoodCalories) : 0;
  
  // حساب نسبة تعبئة الدائرة
  const percentage = goal > 0 ? Math.min(100, (totalFoodCalories / goal) * 100) : 0;

  return (
    <div className="calorie-card">
      <div className="card-header">
        <span>Calories Remaining</span>
      </div>

      {/* الدائرة بتنحسب نسبتها المئوية حركياً بـ CSS Gradient */}
      <div className="progress-circle-container">
        <div 
          className="progress-circle" 
          style={{
            background: goal > 0 
              ? `conic-gradient(#ff9f1c ${percentage}%, #2a2a2a ${percentage}% 100%)`
              : '#2a2a2a'
          }}
        >
          <div className="circle-inner">
            <span className="calories-number">{caloriesLeft.toLocaleString()}</span>
            <span className="calories-unit">kcal left</span>
          </div>
        </div>
      </div>

      <div className="card-stats">
        <div 
          className="stat-item clickable" 
          onClick={() => { setTempGoal(goal); setIsEditingGoal(true); }}
        >
          <span className="stat-value">{goal}</span>
          <span className="stat-label">Goal ✏️</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalFoodCalories}</span>
          <span className="stat-label">Food</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">0</span>
          <span className="stat-label">Exercise</span>
        </div>
      </div>

      {/* نافذة تعديل الـ Goal الحقيقية */}
      {isEditingGoal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Set Daily Calorie Goal</h3>
            <form onSubmit={handleSaveGoal}>
              <input 
                type="number" 
                placeholder="Enter goal (e.g. 2000)" 
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                autoFocus
                required
              />
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setIsEditingGoal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalorieCard;