
import './BottomNav.css'; // استدعاء ملف الـ CSS الخاص بالمكون

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <button className="nav-btn active">
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Today</span>
      </button>

      <button className="nav-btn">
        <span className="nav-icon">📈</span>
        <span className="nav-label">Progress</span>
      </button>

      <button className="camera-btn">
        📷
      </button>

      <button className="nav-btn">
        <span className="nav-icon">📖</span>
        <span className="nav-label">Recipes</span>
      </button>

      <button className="nav-btn">
        <span className="nav-icon">👤</span>
        <span className="nav-label">Settings</span>
      </button>
    </nav>
  );
}

export default BottomNav;