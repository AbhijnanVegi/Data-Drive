import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* Add more routes for other pages or components */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
