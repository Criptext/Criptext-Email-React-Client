import React from 'react';
import './customDomains.scss';
import MxLoadingWrapper from './MxLoadingWrapper';
import string from './../lang';
import PropTypes from 'prop-types';

const CustomDomains = props => {
  return (
    <div className="settings-content">
      <div className="settings-content-scroll cptx-scrollbar">
        <div className="custom-domains-steps-container">
          <div className="custom-domains-steps">
            Step {stepNumber(props)} of 3
          </div>
        </div>
        <div className="custom-domains-main-container">
          {stepsRenderer(props)}
        </div>
      </div>
    </div>
  );
};

const stepNumber = props => {
  if (props.currentStep === 2 || props.currentStep === 3) return 2;
  else if (props.currentStep > 3) return props.currentStep - 1;
  return props.currentStep;
};

const stepsRenderer = props => {
  const actualStep = props.currentStep;
  const newStep = actualStep + 1;
  const backStep = actualStep - 1;
  if (actualStep === 0) {
    return (
      <div className="custom-domains-steps-first">
        <div className="custom-domains-steps-title">
          {string.address.add.step1.title}
        </div>
        <div className="custom-domains-steps-text custom-domains-steps-first-text">
          {string.address.add.step1.text}
        </div>
        <div className="custom-domains-steps-first-input">
          <input
            type="text"
            onChange={e => props.onChangeInputDomain(e)}
            className={props.existError ? 'input-error' : ''}
          />
          {inputError(props)}
        </div>

        <div className="custom-domains-steps-button-container">
          {renderIsDomainButton(props)}
        </div>
      </div>
    );
  } else if (actualStep === 1) {
    return (
      <div className="custom-domains-steps-second">
        <div className="custom-domains-steps-title">
          {string.address.add.step2.title}{' '}
        </div>
        <div className="custom-domains-steps-text custom-domains-steps-second-text">
          <b>1. </b> {string.address.add.step2.text1}
          <br />
          <br />
          <b>2. </b> {string.address.add.step2.text2}
        </div>

        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            {string.address.add.nextButtonLabel}
          </button>
        </div>
      </div>
    );
  } else if (actualStep === 2) {
    return (
      <div className="custom-domains-steps-second-2">
        <div className="custom-domains-steps-title">
          {string.address.add.step2_2.title}
        </div>
        <div className="custom-domains-steps-text custom-domains-steps-second-text">
          {string.address.add.step2_2.text}{' '}
          <a href="#"> {string.address.add.need_help}</a>
        </div>

        <div className="custom-domains-steps-table-second-2">
          {mxTable(props)}
        </div>
        <br />
        <br />
        <div className="custom-domains-steps-second-note">
          {string.address.add.step2_2.note}
          <br />
          <br />
        </div>
        <div className="custom-domains-steps-button-container">
          <button
            className="custom-domains-steps-button-back"
            onClick={() => props.onClickChangeStep(backStep)}
          >
            {string.address.add.backButtonLabel}
          </button>
          <button
            className="custom-domains-steps-button"
            onClick={() => props.onClickChangeStep(newStep)}
          >
            {string.address.add.nextButtonLabel}
          </button>
        </div>
      </div>
    );
  } else if (actualStep === 3) {
    return (
      <div className="custom-domains-steps-third">
        <MxLoadingWrapper
          domain={props.domain}
          currentStep={props.currentStep}
          onClickChangeStep={props.onClickChangeStep}
        />
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

const renderIsDomainButton = props => {
  if (props.isLoadingDomain) {
    return (
      <button className="loading-button" disabled>
        <div className="loading-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
      </button>
    );
  }
  return (
    <button
      className="custom-domains-steps-button"
      onClick={() => props.onClickIsDomainAvailable()}
    >
      {string.address.add.nextButtonLabel}
    </button>
  );
};

const mxTable = props => {
  if (!props.mxTable) {
    return (
      <div>
        <p>Not Mx Records</p>
      </div>
    );
  }
  const mxTable = props.mxTable;
  const tableContent = mxTable.map(record => {
    const { host, pointsTo, priority, type } = record;
    return (
      <tr>
        <td>{type}</td>
        <td>{priority}</td>
        <td>{host}</td>
        <td>{cutString(pointsTo, 15)}</td>
        <td>
          <a
            href="#"
            className="custom-domain-steps-second-table-copy"
            onClick={() => {
              navigator.clipboard.writeText(pointsTo);
            }}
          >
            Copy
          </a>
        </td>
      </tr>
    );
  });
  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Priority</th>
          <th>Name/Host/Alias</th>
          <th>Value/Destination</th>
          <th />
        </tr>
      </thead>
      <tbody>{tableContent}</tbody>
    </table>
  );
};

const cutString = (theString, size) => theString.substring(0, size) + '...';

const inputError = props => {
  if (props.existError) {
    return (
      <div className="custom-domain-input-text-error">{props.errorMessage}</div>
    );
  }
};

CustomDomains.propTypes = {
  isLoadingDomain: PropTypes.bool,
  currentStep: PropTypes.number,
  mxTable: PropTypes.array,
  domain: PropTypes.string,
  existError: PropTypes.bool,
  errorMessage: PropTypes.string,
  onClickChangeStep: PropTypes.func,
  onChangeInputDomain: PropTypes.func,
  onClickIsDomainAvailable: PropTypes.func
};

export default CustomDomains;
