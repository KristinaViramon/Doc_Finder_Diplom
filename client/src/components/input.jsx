import React from 'react';

const Input = (props) => {
    return (
        <input placeholder= {props.name} className="input-field"  type={props.type} value={props.value} onChange={props.onChange} id={props.id} required={props.required} onFocus={props.onFocus} onBlur={props.onBlur} style={props.style}/>
        
    );
}

export default Input;
