import React from 'react';
import { NavLink} from 'react-router-dom';
import './home/home.css'

const Sidebar = (props) => {
    return (
        <ul className='sidebar'>
            <li className='sidebar--element' onClick={props.handleClick}>&times;</li>
            <li className='sidebar--element' onClick={props.handleClick}><NavLink to="/">Home</NavLink></li>
            <li className='sidebar--element' onClick={props.handleClick}><NavLink to="/charts">Performance charts</NavLink></li>
            <li className='sidebar--element' onClick={props.handleClick}><NavLink to="/questionary">Readiness</NavLink></li>
            <li className='sidebar--element' onClick={props.handleClick}><NavLink to="/corelation">Corelation</NavLink></li>
        </ul>
    );
}

export default Sidebar;