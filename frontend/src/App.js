import React from 'react'
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route exact path="/" element={<Login/>} />
        <Route exact path="/signup" element={<Signup/>} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
