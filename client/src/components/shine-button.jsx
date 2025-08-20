import React from 'react';
import "../styles/shine-button.css"
const ShineButton = (props) => {
    return (
        <button className='shine-button' onClick={props.onClick} style={props.style}>{props.name} </button>
    );
}

export default ShineButton;
