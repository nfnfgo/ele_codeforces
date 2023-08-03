import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

// Fundamentals
import { useLayoutEffect } from 'react';

// Stores
import { ThemeData, useThemeStore, useThemeStoreStateConfig } from 'renderer/stores/themeStore';


// Pages 
import { HomePage } from 'renderer/pages/home/page';
import { ProblemDetailedPanel } from 'renderer/pages/home/problem_detail_panel';
import { updateDarkModeUIFromStorage } from './tools/darkmode';

export default function App() {
  useLayoutEffect(function () {
    console.log('useLayoutEffect from App has been called');
    updateDarkModeUIFromStorage();
  }, []);

  let routes = (<Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/contest" element={<>
      <ProblemDetailedPanel contestId={1854} problemId='A1' />
    </>} />
  </Routes>);

  return (
    <>
      {
        function () {
          if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            return (<BrowserRouter>
              {routes}
            </BrowserRouter>);
          }
          return (<HashRouter>{routes}</HashRouter>);
        }()}
    </>
  );
}
