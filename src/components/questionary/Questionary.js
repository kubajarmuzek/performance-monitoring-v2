import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import './questionary.css'

const Questionary = () => {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const hoverStyles = {
        marginLeft: '300px',
        //backgroundColor: "rgba(0,0,0,0.4)",
    };
    const defaultStyle = {
        marginLeft: 0,
    }
    const handleClick = () => {
        setShowSidebar(showSidebar => !showSidebar);
    }

    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            navigate("/auth");
            console.log("Signed out successfully")
        }).catch((error) => {
            // An error happened.
        });
    }


    return (
        <div classname="home--body" style={showSidebar ? hoverStyles : defaultStyle}>
            <div className='home--top'>
                <span className="menu--bars" onClick={handleClick}><i class="fa-solid fa-bars fa"></i></span>
                <div className='home--logout'>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            {showSidebar && <Sidebar handleClick={handleClick} className="menu--sideNav" />}
            <div >
                <h1>
                    Readiness Questionary
                </h1>
                <div id="main" class="main">
    <div class="container">
      <div id="questionare-container">
        <div id="question">Mood State</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.14">1.Highly annoyed/irritable/down</button>
          <button class="btn" data-value="2" data-weight="0.14">2.Snappiness at teammates, family and coworkers</button>
          <button class="btn" data-value="3" data-weight="0.14">3.Less interested in others/activities than
            usual</button>
          <button class="btn" data-value="4" data-weight="0.14">4.Good mood</button>
          <button class="btn" data-value="5" data-weight="0.14">5.Very positive mood</button>
        </div>
      </div>
      <div id="questionare-container">
        <div id="question">Sleep quality</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.19">1.Hardly slept at all</button>
          <button class="btn" data-value="2" data-weight="0.19">2.Tossed and turned</button>
          <button class="btn" data-value="3" data-weight="0.19">3.Reasonable/Just OK</button>
          <button class="btn" data-value="4" data-weight="0.19">4.Good night's sleep; Feeling refreshed</button>
          <button class="btn" data-value="5" data-weight="0.19">5.Had a great sleep. Feeling very refreshed</button>
        </div>
      </div>
      <div id="questionare-container">
        <div id="question">Energy levels</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.20">1.Very lethargic - no energy at all</button>
          <button class="btn" data-value="2" data-weight="0.20">2.Very low energy levels</button>
          <button class="btn" data-value="3" data-weight="0.20">3.Reasonable energy levels</button>
          <button class="btn" data-value="4" data-weight="0.20">4.Good energy levels</button>
          <button class="btn" data-value="5" data-weight="0.20">5.Full of energy</button>
        </div>
      </div>
      <div id="questionare-container">
        <div id="question">Muscle Soreness</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.19">1.Extremely sore</button>
          <button class="btn" data-value="2" data-weight="0.19">2.Very sore</button>
          <button class="btn" data-value="3" data-weight="0.19">3.Quite sore</button>
          <button class="btn" data-value="4" data-weight="0.19">4.Mild soreness</button>
          <button class="btn" data-value="5" data-weight="0.19">5.Not sore at all</button>
        </div>
      </div>
      <div id="questionare-container">
        <div id="question">Diet yesterday</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.14">1.All meals high sugar/processed food, no
            fruit/veg</button>
          <button class="btn" data-value="2" data-weight="0.14">2.Some meals high sugar/processed food, no fruit &
            veg</button>
          <button class="btn" data-value="3" data-weight="0.14">3.Ate reasonably, some sugar/processed food intake, at
            least 1 serving of veg</button>
          <button class="btn" data-value="4" data-weight="0.14">4.Ate well, low sugar/processed food intake, 2 or more
            servings of veg & fruit</button>
          <button class="btn" data-value="5" data-weight="0.14">5.Ate really well, no sugar/processed foods and lots of
            veg and some fruit</button>
        </div>
      </div>
      <div id="questionare-container">
        <div id="question">Stress</div>
        <div id="answer-buttons" class="btn-grid">
          <button class="btn" data-value="1" data-weight="0.14">1.Highly stressed</button>
          <button class="btn" data-value="2" data-weight="0.14">2.Feeling stressed</button>
          <button class="btn" data-value="3" data-weight="0.14">3.Reasonable/just OK</button>
          <button class="btn" data-value="4" data-weight="0.14">4.Relaxed</button>
          <button class="btn" data-value="5" data-weight="0.14">5.Very relaxed</button>
        </div>
      </div>
      <div class="controls">
        <button id="submit" class="submit btn">Submit</button>
      </div>
    </div>
  </div>
            </div>
        </div>
    );
}
export default Questionary;