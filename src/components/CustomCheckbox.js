import React from 'react';
import './customCheckbox.css';

const CustomCheckbox = props => (<div 
  className="checkmark-container" 
  onClick={ ev => onClick(ev, props) }>
  <span className={"checkmark " + getClass(props.status)} />
  <div>{props.label}</div>
</div>)

function getClass(status){
  if(typeof status === 'boolean'){
    if(status){
      return 'checkmark-checked'
    }
    return ''
  }
  if(status === 'all'){
    return 'checkmark-checked'
  }else if(status === 'partial'){
    return 'checkmark-partial'
  }
  return ''
}

function onClick(ev, props){
  ev.stopPropagation();
  ev.preventDefault();
  if(typeof props.status === 'boolean'){
    if(props.status){
      return props.onCheck(false)
    }
    return props.onCheck(true)
  }

  if(props.status === 'all'){
    return props.onCheck(false)
  }else if(props.status === 'partial'){
    return props.onCheck(true)
  }
  return props.onCheck(true)
}

export default CustomCheckbox;