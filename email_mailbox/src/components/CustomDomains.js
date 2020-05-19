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
            {string.address.add.title.first}
            {stepNumber(props)}
            {string.address.add.title.second}
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
  if (props.currentStep < 2) return props.currentStep + 1;
  return props.currentStep;
};

const stepsRenderer = props => {
  const actualStep = props.currentStep;
  switch (actualStep) {
    case 0:
      return <Step1 {...props} />;
    case 1:
      return <Step2 {...props} />;
    case 2:
      return <Step2Two {...props} />;
    case 3:
      return <Step3 {...props} />;
    case 4:
      return <Step4 {...props} />;
    default:
      return '';
  }
};

const Step1 = props => {
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
};

const Step2 = props => {
  const actualStep = props.currentStep;
  const newStep = actualStep + 1;
  return (
    <div className="custom-domains-steps-second">
      <div className="custom-domains-steps-title">
        {string.address.add.step2.title}{' '}
      </div>
      <div className="custom-domains-steps-text custom-domains-steps-second-text">
        <b>1. </b>
        {string.address.add.step2.text1.first}
        <a
          href="http://www.godaddy.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          {string.address.add.step2.text1.go_daddy}
        </a>
        {string.address.add.step2.text1.second}
        <b>{string.address.add.step2.text1.blackened}</b>
        {string.address.add.step2.text1.third}
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
};

const Step2Two = props => {
  const actualStep = props.currentStep;
  const newStep = actualStep + 1;
  const backStep = actualStep - 1;
  return (
    <div className="custom-domains-steps-second-2">
      <div className="custom-domains-steps-title">
        {string.address.add.step2_2.title}
      </div>
      <div className="custom-domains-steps-text custom-domains-steps-second-text">
        {string.address.add.step2_2.text}{' '}
        <a
          href="https://www.criptext.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          {' '}
          {string.address.add.need_help}
        </a>
      </div>

      <div className="custom-domains-steps-table-second-2">
        {mxTable(props)}
      </div>
      <br />
      <br />
      <div className="custom-domains-steps-second-note">
        <b>{string.address.add.step2_2.note.blackened}</b>{' '}
        {string.address.add.step2_2.note.text}
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
};

const Step3 = props => {
  return (
    <div className="custom-domains-steps-third">
      <MxLoadingWrapper
        domain={props.domain}
        currentStep={props.currentStep}
        onClickChangeStep={props.onClickChangeStep}
        saveDomain={props.saveDomain}
      />
    </div>
  );
};

const Step4 = props => {
  return (
    <div className="custom-domains-steps-fourth">
      <div className="custom-domains-steps-title">
        {string.address.add.step4.title}
      </div>
      <div className="custom-domains-steps-text">
        {string.address.add.step4.text} {props.domain}
      </div>
      <div className="custom-domains-steps-button-container">
        <button
          className="custom-domains-steps-button"
          onClick={() => props.onClickHandleDone()}
        >
          {string.address.add.step4.mxButton}
        </button>
      </div>
    </div>
  );
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
      disabled={!props.domain}
    >
      {string.address.add.nextButtonLabel}
    </button>
  );
};

const mxTable = props => {
  if (!props.mxTable) {
    return (
      <div>
        <div className="loading-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }
  const mxTable = props.mxTable;
  const tableContent = mxTable.map((record, index) => {
    const { host, pointsTo, priority, type } = record;
    return (
      <tr key={index}>
        <td>{type}</td>
        <td>{priority}</td>
        <td>{host}</td>
        <td>{cutString(pointsTo, 15)}</td>
        <td>
          <button
            className="custom-domain-steps-second-table-copy"
            onClick={() => {
              navigator.clipboard.writeText(pointsTo);
            }}
          >
            {string.address.add.step2_2.table.copy}
          </button>
        </td>
      </tr>
    );
  });
  return (
    <table>
      <thead>
        <tr>
          <th>{string.address.add.step2_2.table.type}</th>
          <th>{string.address.add.step2_2.table.priority}</th>
          <th>{string.address.add.step2_2.table.name}</th>
          <th>{string.address.add.step2_2.table.value}</th>
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
  onClickIsDomainAvailable: PropTypes.func,
  saveDomain: PropTypes.func
};

Step1.propTypes = {
  onChangeInputDomain: PropTypes.func,
  existError: PropTypes.bool
};

Step2.propTypes = {
  currentStep: PropTypes.number,
  onClickChangeStep: PropTypes.func
};

Step2Two.propTypes = {
  currentStep: PropTypes.number,
  onClickChangeStep: PropTypes.func
};

Step3.propTypes = {
  domain: PropTypes.string,
  currentStep: PropTypes.number,
  onClickChangeStep: PropTypes.func,
  saveDomain: PropTypes.func
};

Step4.propTypes = {
  domain: PropTypes.string,
  currentStep: PropTypes.number,
  onClickHandleDone: PropTypes.func
};

renderIsDomainButton.propTypes = {
  domain: PropTypes.string,
  isLoadingDomain: PropTypes.bool,
  onClickIsDomainAvailable: PropTypes.func
};

mxTable.propTypes = {
  mxTable: PropTypes.array
};

export default CustomDomains;
