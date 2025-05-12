import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import Profile from './Pages/Profile';
// import ShopContextProvider from './Context/ShopContext'; // Uncomment if you need ShopContext
import { AuthProvider } from './Context/AuthContext';
import ForgotPassword from './Pages/ForgotPassword';
import NewPassword from './Pages/NewPassword';
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import OrderHistory from './Pages/OrderHistory';

function App() {
  return (
    <div>
      <BrowserRouter>
        {/* <ShopContextProvider> */} {/* Uncomment this if ShopContext is needed */}
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path='/' element={<Shop />} />
              <Route path='/mens' element={<ShopCategory banner={men_banner} category='men' />} />
              <Route path='/womens' element={<ShopCategory banner={women_banner} category='women' />} />
              <Route path='/kids' element={<ShopCategory banner={kid_banner} category='kids' />} />
              
              {/* Product Routes with dynamic productId */}
              <Route path='/product/:productId' element={<Product />} />
              
              <Route path='/cart' element={<Cart />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password/:token' element={<NewPassword />} />
              <Route path='/about-us' element={<AboutUs />} />
              <Route path='/contact' element={<ContactUs />} />
              <Route path='/order-history' element={<OrderHistory />} />
            </Routes>
            <Footer />
          </AuthProvider>
        {/* </ShopContextProvider> */} {/* Uncomment this if ShopContext is needed */}
      </BrowserRouter>
    </div>
  );
}

export default App;
