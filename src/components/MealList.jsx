 import { useState, useEffect } from 'react';
import './MealList.css';

function MealList() {
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('luqma_meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);

  // حالة الـ Modal اليدوي
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // حالة إدخال الوجبة بالذكاء الاصطناعي
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('luqma_meals', JSON.stringify(meals));
    window.dispatchEvent(new Event('storage_updated'));
  }, [meals]);

  const categories = [
    { key: 'Breakfast', label: 'Breakfast', icon: '☀️' },
    { key: 'Lunch', label: 'Lunch', icon: '🍴' },
    { key: 'Dinner', label: 'Dinner', icon: '🌙' },
    { key: 'Snacks', label: 'Snacks', icon: '🍎' }
  ];

  // دالة الذكاء الاصطناعي مع معالجة حماية الـ JSON
const handleAiSmartLog = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAnalyzing(true);

    // استخدام مفتاح الـ API الخاص بك من ملف .env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      alert("لم يتم العثور على مفتاح API في ملف .env!");
      setIsAnalyzing(false);
      return;
    }

    const prompt = `You are an expert nutritionist. Analyze this meal description: "${aiInput}".
    Estimate the total calories, protein (g), carbs (g), and fat (g).
    Categorize it strictly into one of: "Breakfast", "Lunch", "Dinner", or "Snacks".
    Return ONLY a valid JSON object without any extra text, markdown, or formatting:
    {"name": "Short meal name in English or Arabic", "category": "Lunch", "calories": 400, "protein": 30, "carbs": 45, "fat": 12}`;

    // رابط الـ API المباشر لجوجل
    const targetUrl =` https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // استخدام بروكسي مجاني لتجاوز حظر الـ CORS والـ IP الجغرافي
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ استجابة السيرفر: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        // استخراج كائن الـ JSON من النص المرجع
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("تعذر قراءة تحليلات الذكاء الاصطناعي");

        const parsed = JSON.parse(jsonMatch[0]);

        const newMeal = {
          id: Date.now(),
          category: parsed.category || 'Lunch',
          name: parsed.name || aiInput,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          calories: Number(parsed.calories) || 0,
          protein: Number(parsed.protein) || 0,
          carbs: Number(parsed.carbs) || 0,
          fat: Number(parsed.fat) || 0,
          icon: parsed.category === 'Snacks' ? '🍎' : '🍽️'
        };

        setMeals(prev => [...prev, newMeal]);
        setAiInput('');
      } else {
        alert("لم يستطع الذكاء الاصطناعي تحليل الوجبة، يرجى المحاولة بعبارة أخرى.");
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert( `فشل الاتصال بالذكاء الاصطناعي: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenAdd = (categoryKey) => {
    setActiveCategory(categoryKey);
    setEditingMealId(null);
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const handleOpenEdit = (meal) => {
    setActiveCategory(meal.category);
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setCalories(meal.calories);
    setProtein(meal.protein);
    setCarbs(meal.carbs);
    setFat(meal.fat);
  };

  const handleDeleteMeal = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mealName.trim()) return;
   if (editingMealId) {
      setMeals(meals.map(m => m.id === editingMealId ? {
        ...m,
        name: mealName,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      } : m));
    } else {
      const newMeal = {
        id: Date.now(),
        category: activeCategory,
        name: mealName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        icon: activeCategory === 'Snacks' ? '🍎' : '🍽️'
      };
      setMeals([...meals, newMeal]);
    }

    closeModal();
  };

  const closeModal = () => {
    setActiveCategory(null);
    setEditingMealId(null);
  };

  return (
    <div className="meal-list-section">
      
      {/* كارت التسجيل الذكي مع الألوان المعدلة والصندوق المريح */}
      <div className="ai-smart-card">
        <div className="ai-card-header">
          <span className="ai-badge">✨ AI Logger</span>
          <h4>سجلي وجبتك بالذكاء الاصطناعي</h4>
        </div>
        <form onSubmit={handleAiSmartLog} className="ai-input-form">
          <textarea 
            rows="2"
            placeholder="مثال: صحن كبسة مع قطعة دجاج وصحن شوربة عدس..." 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            disabled={isAnalyzing}
          />
          <button type="submit" className="ai-submit-btn" disabled={isAnalyzing || !aiInput.trim()}>
            {isAnalyzing ? 'جاري التحليل والحساب... ⏳' : 'تحليل وإضافة الوجبة ✨'}
          </button>
        </form>
      </div>

      <h3 className="section-title">Today's meals</h3>

      {categories.map((cat) => {
        const categoryMeals = meals.filter(m => m.category === cat.key);
        const categoryTotal = categoryMeals.reduce((sum, m) => sum + m.calories, 0);

        return (
          <div key={cat.key} className="meal-category">
            <div className="category-header">
              <span className="cat-label">{cat.icon} {cat.label}</span>
              <div className="header-right">
                <span className="category-total">{categoryTotal} kcal</span>
                <button 
                  type="button" 
                  className="add-meal-btn" 
                  onClick={() => handleOpenAdd(cat.key)}
                  title="Manual Entry"
                >
                  +
                </button>
              </div>
            </div>

            {categoryMeals.length > 0 ? (
              categoryMeals.map((meal) => (
                <div key={meal.id} className="meal-card">
                  <div className="meal-info-left">
                    <div className="meal-img-box">{meal.icon}</div>
                    <div className="meal-details">
                      <div className="meal-name">
                        {meal.name} <span className="meal-time">{meal.time}</span>
                      </div>
                      <div className="meal-macros">
                        <span><span className="macro-dot dot-protein"></span>P {meal.protein}g</span>
                        <span><span className="macro-dot dot-carbs"></span>C {meal.carbs}g</span>
                        <span><span className="macro-dot dot-fat"></span>F {meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="meal-right-side">
                    <div className="meal-calories">
                      <span className="cal-num">{meal.calories}</span>
                      <span className="cal-unit">kcal</span>
                    </div>
                    <div className="meal-actions">
                      <button type="button" className="action-btn edit-btn" onClick={() => handleOpenEdit(meal)} title="Edit">✏</button>
                      <button type="button" className="action-btn delete-btn" onClick={() => handleDeleteMeal(meal.id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-category-card" onClick={() => handleOpenAdd(cat.key)}>
                <span>No meals logged yet. Tap + to add manually.</span>
              </div>
            )}
          </div>
        );
      })}

      {activeCategory && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingMealId ? 'Edit Meal' :` Log manually to ${activeCategory}`}</h3>
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Meal Name" 
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
                autoFocus
              />
              <input 
                type="number" 
                placeholder="Calories (kcal)" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
              <div className="macro-inputs">
                <input 
                  type="number" 
                  placeholder="Protein (g)" 
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Carbs (g)" 
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Fat (g)" 
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">{editingMealId ? 'Update' : 'Add Meal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealList;