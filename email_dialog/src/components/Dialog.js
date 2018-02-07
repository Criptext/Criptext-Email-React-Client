import React from 'react';
import { onResponseModal } from './../utils/electronInterface';
import './dialog.css';


const Dialog = (props) => renderDialog(props);


const renderDialog = (props) => (
  <div className="dialog-body">
  	<h2 className="title">Warning!</h2>
  	<div className="message">
  		<p>
  			You did not set a Recovery Email so account recovery is impossible if you forget your password.
        <br />
  			Proceed without recovery email?
  		</p>
  	</div>
  	<div className="options">
	  	<button onClick={(e) => onResponseModal(e, "Cancel")}>
	  		Cancel
	  	</button>
	  	<button onClick={(e) => onResponseModal(e, "Confirm")}>
	  		Confirm
	  	</button>
  	</div>
  </div>
)


export default Dialog;
