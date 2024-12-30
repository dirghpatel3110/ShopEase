import React from 'react'
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Product from './Pages/Product';
import ProductList from './Pages/ProductList';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Transaction from './Pages/Transaction';
import Order from './Pages/Order';
import ProductInventory from './Pages/ProductInventory';
import ProductsOnSale from './Pages/ProductsOnSale';
import ProductsWithRebates from './Pages/ProductsWithRebates';
import ProductInventoryBarChart from './Pages/ProductInventoryBarChart';

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
      <Route exact path="/transaction" element={<Transaction/>}/>
      <Route exact path="/order" element={<Order/>}/>
      <Route path="/inventory/available" element={<ProductInventory/>} />
      <Route path="/inventory/on-sale" element={<ProductsOnSale/>} />
      <Route path="/inventory/rebates" element={<ProductsWithRebates/>}/>
      <Route path='/inventory/bar-chart' element={<ProductInventoryBarChart/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
