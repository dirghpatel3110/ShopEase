import React from 'react'
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Product from './Pages/Product';
import ProductList from './Pages/ProductList';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route exact path="/" element={<Login/>} />
      <Route exact path="/signup" element={<Signup/>} />
      <Route exact path="/product" element={<Product/>} />
      <Route exact path="/product/:id" element={<ProductDetails/>} />
      <Route exact path="/product-list" element={<ProductList/>} />
      <Route exact path="/cart" element={<Cart/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
