import React from 'react';
import Home from './components/home/Home';
import Questionary from './components/questionary/Questionary';
import Corelation from './components/corelation/Corelation';
import Auth from './components/auth/Auth';
import Charts from './components/charts';
import { BrowserRouter as Router} from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';


function App() {
 
  return (
    <Router basename='/performance-monitoring-v2'>
      <div>
        <section>                              
            <Routes>                                                                        
                <Route path="/" element={<Home/>}/>
                <Route path="auth" element={<Auth/>}/>
                <Route path="charts" element={<Charts/>}/>
                <Route path="questionary" element={<Questionary/>}></Route>
                <Route path="corelation" element={<Corelation/>}></Route>
            </Routes>                    
        </section>
      </div>
    </Router>
  );
}
 
export default App;
