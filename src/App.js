import React from 'react';
import Home from './page/Home';
import Questionary from './page/Questionary';
import Corelation from './page/Corelation';
import Auth from './page/Auth';
import Charts from './page/charts';
import { BrowserRouter as Router} from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';


function App() {
 
  return (
    <Router>
      <div>
        <section>                              
            <Routes>                                                                        
                <Route path="/" element={<Home/>}/>
                <Route path="/auth" element={<Auth/>}/>
                <Route path="/charts" element={<Charts/>}/>
                <Route path="/questionary" element={<Questionary/>}></Route>
                <Route path="/corelation" element={<Corelation/>}></Route>
            </Routes>                    
        </section>
      </div>
    </Router>
  );
}
 
export default App;
