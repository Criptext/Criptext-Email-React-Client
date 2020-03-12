import React from 'react';
import './customDomains.scss';
import MxLoadingWrapper from './MxLoadingWrapper';

const CustomDomains = props => {
  return (
    <div className="settings-content">
      <div className="settings-content-scroll cptx-scrollbar">
        <div className="custom-domains-steps-container">
          <div className="custom-domains-steps">Step 1 of 3</div>
        </div>
        <div className="custom-domains-main-container">
          {stepsRenderer(props)}
        </div>
      </div>
    </div>
  );
};

const stepsRenderer = props => {
  const actualStep = props.currentStep;
  const newStep = actualStep + 1;
  if (actualStep === 0) {
    return (
      <div className="custom-domains-steps-first">
        <div className="custom-domains-steps-title">
          Let's set up your domain
        </div>
        <div className="custom-domains-steps-text custom-domains-steps-first-text">
          Enter the custom domain you wish to add.
        </div>
        <div className="custom-domains-steps-first-input">
          <input />
        </div>
        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            Next
          </button>
        </div>
      </div>
    );
  } else if (actualStep === 1) {
    return (
      <div className="custom-domains-steps-second">
        <div className="custom-domains-steps-title">Visit your DNS manager</div>
        <div className="custom-domains-steps-text custom-domains-steps-second-text">
          <b>1.</b>Go to Go Daddy or whomever your domain provider <br /> is and
          access the <b>DNS Manager</b> where you can add MX <br />and Text
          records.
          <br />
          <br />
          <b>2.</b>Delete any existing MX records before proceeding.
        </div>

        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            Next
          </button>
        </div>
      </div>
    );
  } else if (actualStep === 2) {
    return (
      <div className="custom-domains-steps-second-2">
        <div className="custom-domains-steps-title">
          Add records for Criptext
        </div>
        <div className="custom-domains-steps-text custom-domains-steps-second-text">
          Add the following records in your DNS Manager. This will verify your
          domain ownership <br /> and configure Criptext email settings. Need
          help?
        </div>

        <div className="custom-domains-steps-table-second-2">
          {mxTable(props)}
        </div>
        <br />
        <br />
        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button-back"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            Back
          </button>
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            Next
          </button>
        </div>
      </div>
    );
  } else if (actualStep === 3) {
    return (
      <div className="custom-domains-steps-third">
        <MxLoadingWrapper onClickMinusStep={props.onClickMinusStep} />
      </div>
    );
  } else if (actualStep === 4) {
    return (
      <div className="custom-domains-steps-fourth">
        <div className="custom-domains-steps-title">Domain Setup Complete!</div>
        <div className="custom-domains-steps-text">
          You can now add an alias with @liknaru.com
        </div>
        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            Create Alias
          </button>
        </div>
      </div>
    );
  }
};

const mxTable = props => {
  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Priority</th>
          <th>Name/Host/Alias</th>
          <th>Value/Destination</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>MX</td>
          <td>100</td>
          <td>@</td>
          <td>smtp.criptext.com</td>
        </tr>
        <tr>
          <td>TXT</td>
          <td>-</td>
          <td>@</td>
          <td>smt.criptext.com</td>
        </tr>
      </tbody>
    </table>
  );
};

export default CustomDomains;
