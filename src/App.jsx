
import BottomNav from "./components/BottomNav"; 
import CalorieCard from "./components/CalorieCard";
import MealList from "./components/MealList";

function App() {
  return (
    <div>
      <h1 style={{ padding: "20px", textAlign: "center", color: "var(--accent-orange)" }}>
        Luqma 🍲🍝
      </h1>

       <CalorieCard />
      <MealList />
      <BottomNav />
    </div>
  );
}

export default App;