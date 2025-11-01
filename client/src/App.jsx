import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
import Login from './pages/Login';
// import Register from './pages/Register';
// import Browse from './pages/Browse';

function App() {
  return (
    <Router>
      <Routes>
        {/*
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} /> */}
          <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
 
export default App;