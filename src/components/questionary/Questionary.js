import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { database, getCurrentUserUID } from '../../firebase';
import { ref, get, set, child } from 'firebase/database';
import Sidebar from '../Sidebar';
import './questionary.css'

const questionData = [
  {
    question: 'Mood State',
    answers: [
      { text: 'Highly annoyed/irritable/down', weight: 0.14 },
      { text: 'Snappiness at teammates, family and coworkers', weight: 0.14 },
      { text: 'Less interested in others/activities than usual', weight: 0.14 },
      { text: 'Good mood', weight: 0.14 },
      { text: 'Very positive mood', weight: 0.14 },
    ],
  },
  {
    question: 'Sleep quality',
    answers: [
      { text: 'Hardly slept at all', weight: 0.19 },
      { text: 'Tossed and turned', weight: 0.19 },
      { text: 'Reasonable/Just OK', weight: 0.19 },
      { text: 'Good night\'s sleep; Feeling refreshed', weight: 0.19 },
      { text: 'Had a great sleep. Feeling very refreshed', weight: 0.19 },
    ],
  },
  {
    question: 'Energy levels',
    answers: [
      { text: 'Very lethargic - no energy at all', weight: 0.20 },
      { text: 'Very low energy levels', weight: 0.20 },
      { text: 'Reasonable energy levels', weight: 0.20 },
      { text: 'Good energy levels', weight: 0.20 },
      { text: 'Full of energy', weight: 0.20 },
    ],
  },
  {
    question: 'Muscle Soreness',
    answers: [
      { text: 'Extremely sore', weight: 0.19 },
      { text: 'Very sore', weight: 0.19 },
      { text: 'Quite sore', weight: 0.19 },
      { text: 'Mild soreness', weight: 0.19 },
      { text: 'Not sore at all', weight: 0.19 },
    ],
  },
  {
    question: 'Diet yesterday',
    answers: [
      { text: 'All meals high sugar/processed food, no fruit/veg', weight: 0.14 },
      { text: 'Some meals high sugar/processed food, no fruit & veg', weight: 0.14 },
      { text: 'Ate reasonably, some sugar/processed food intake, at least 1 serving of veg', weight: 0.14 },
      { text: 'Ate well, low sugar/processed food intake, 2 or more servings of veg & fruit', weight: 0.14 },
      { text: 'Ate really well, no sugar/processed foods and lots of veg and some fruit', weight: 0.14 },
    ],
  },
  {
    question: 'Stress',
    answers: [
      { text: 'Highly stressed', weight: 0.14 },
      { text: 'Feeling stressed', weight: 0.14 },
      { text: 'Reasonable/just OK', weight: 0.14 },
      { text: 'Relaxed', weight: 0.14 },
      { text: 'Very relaxed', weight: 0.14 },
    ],
  },
];

const Question = ({ questionId, question, answers, handleAnswerSelect, selectedAnswerId }) => {
  return (
    <div id="questionare-container">
      <div id="question">{question}</div>
      <div id="answer-buttons" className="btn-grid">
        {answers.map((answer, index) => (
          <button
            key={index}
            className={`btn ${selectedAnswerId === index + 1 ? 'selected' : ''}`}
            data-value={index + 1}
            data-weight={answer.weight}
            onClick={() => handleAnswerSelect(questionId, (index + 1) / 5 * answer.weight, index + 1)}
          >
            <p>{answer.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};


const Questionary = () => {
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answerIds, setAnswerIds] = useState([0, 0, 0, 0, 0, 0]);
  const [totalScore, setTotalScore] = useState(0); // Define totalScore state

  const hoverStyles = {
    marginLeft: '300px',
    // backgroundColor: "rgba(0,0,0,0.4)",
  };
  const defaultStyle = {
    marginLeft: 0,
  };

  const handleClick = () => {
    setShowSidebar((showSidebar) => !showSidebar);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate('/auth');
        console.log('Signed out successfully');
      })
      .catch((error) => {
        // An error happened.
      });
  };


  const checkAndUpdateData = (databaseRef, customNodeName, rowData) => {
    const dataRef = child(databaseRef, customNodeName);
    get(dataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Data already exists, update the existing record
          set(dataRef, rowData);
        } else {
          // Data doesn't exist, create a new record
          set(dataRef, rowData);
        }
      })
      .catch((error) => {
        // Handle error
      });
  };


  const handleAnswerSelect = (questionId, weight, answerId) => {
    setSelectedAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: weight }));
    setAnswerIds((prevAnswerIds) => {
      const newAnswerIds = [...prevAnswerIds];
      newAnswerIds[questionId] = answerId;
      return newAnswerIds;
    });
  };


  const calculateScore = () => {
    console.log(selectedAnswers)
    const totalScore = (Object.values(selectedAnswers).reduce((sum, weight) => sum + weight, 0) * 10).toFixed(2);
    setTotalScore(totalScore); 
    console.log('Total Score:', totalScore);

    const userUID = getCurrentUserUID();
    if (userUID) {
        const rowData = {};
        const currentDate = new Date();
        const customNodeName = currentDate.toLocaleDateString('en-GB')+"readiness"; // Format date to DD/MM/YYYY

        rowData["label"] = "readiness";
        rowData["date"] = customNodeName;
        rowData["readiness"] = totalScore;

        const databaseRef = ref(database, `users/${userUID}`);
        checkAndUpdateData(databaseRef, customNodeName.replace(/[.#$/[\]]/g, "_"), rowData);
    }

    setPopupVisible(true);
};



  const closePopup = () => {
    setPopupVisible(false); 
  };

  return (
    <div className="home--body" style={showSidebar ? hoverStyles : defaultStyle}>
      <div className="home--top">
        <span className="menu--bars" onClick={handleClick}>
          <i className="fa-solid fa-bars fa"></i>
        </span>
        <div className="home--logout">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {showSidebar && <Sidebar handleClick={handleClick} className="menu--sideNav" />}
      <div>
        <div className={`popup ${isPopupVisible ? 'visible' : ''}`}>
          <div className="popup-content">
            <p>Your Score: {totalScore}
              <br/>
              on a scale of 0-10
            </p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
        <h1>Readiness Questionary</h1>
        <div className='intro'>
          Your are about to take a readiness questionary, answer accordingly to your present state of well-being and performance
        </div>
        <div id="main" className="main">
          <div className="container">
            {questionData.map((question, index) => (
              <Question
                questionId={index}
                question={question.question}
                answers={question.answers}
                handleAnswerSelect={handleAnswerSelect}
                selectedAnswerId={answerIds[index]}
              />
            ))}
            <div className="controls">
              <button id="submit" className="submit btn" onClick={calculateScore}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionary;