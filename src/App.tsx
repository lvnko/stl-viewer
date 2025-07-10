import { Link, Outlet } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <header className="p-4 flex justify-between items-center border-b">
        <Link to="/"><h1 className="text-xl font-bold">STL Viewer</h1></Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-500 text-black dark:text-white"
          >
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'zh_TW')}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
          >
            <option value="en">English</option>
            <option value="zh_TW">繁體中文</option>
          </select>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
