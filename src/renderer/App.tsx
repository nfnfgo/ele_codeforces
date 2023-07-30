import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

// Fundamentals
import { useLayoutEffect } from 'react';

// Stores
import { ThemeData, useThemeStore, useThemeStoreStateConfig } from 'renderer/stores/themeStore';

// Pages
import { HomePage } from 'renderer/pages/home/page';




export default function App() {

  let curThemeData: ThemeData | undefined = useThemeStore(function (state) {
    return (state as useThemeStoreStateConfig).theme;
  });

  useLayoutEffect(function () {
    let darkMode: boolean = curThemeData.getDarkModeNow();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    else {
      document.documentElement.classList.remove('dark');
    }
  }, [curThemeData.darkMode]);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
