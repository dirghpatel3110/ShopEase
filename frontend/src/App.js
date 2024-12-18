import React from 'react'
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Product from './Pages/Product';

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route exact path="/" element={<Login/>} />
      <Route exact path="/signup" element={<Signup/>} />
      <Route exact path="/product" element={<Product/>} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
