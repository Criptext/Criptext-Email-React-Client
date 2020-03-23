import React, { Component } from 'react';
import CustomDomains from './CustomDomains';
import string from './../lang';
import PropTypes from 'prop-types';
import {
  isDomainAvailable,
  getDomainMX,
  registerDomain,
  createCustomDomain
} from '../utils/ipc';

const errors = {
  NOT_DOMAIN_AVAILABLE: string.address.add.step1.errors.usedDomain,
  UNKNOWN_DOMAIN_AVAILABLE: string.address.add.step1.errors.unknownError,
  FAILED_MX_RECORDS: string.address.add.step2_2.errors.notMXRecords,
  UNKNOWN_ERROR: string.address.add.step1.errors.unknownError
};

const response_status = {
  DOMAIN_AVAILABLE_SUCCESSFULL: 200,
  DOMAIN_AVAILABLE_UNSUCCESSFULL: 400,
  GET_MX_RECORDS_SUCCESSFULL: 200,
  GET_MX_RECORDS_UNSUCCESSFULLL: 400
};

class CustomDomainsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      loadingDomain: false,
      existError: false,
      errorMessage: undefined,
      domain: undefined,
      mxTable: undefined
    };
  }

  render() {
    return (
      <CustomDomains
        currentStep={this.state.currentStep}
        mxTable={this.state.mxTable}
        domain={this.state.domain}
        isLoadingDomain={this.state.loadingDomain}
        existError={this.state.existError}
        errorMessage={this.state.errorMessage}
        onClickChangeStep={this.handleOnClickChangeStep}
        onChangeInputDomain={this.handleInputDomain}
        onClickIsDomainAvailable={this.handleDomainExistRequirement}
        saveDomain={this.handleSaveDomain}
        onClickHandleDone={this.handleDone}
      />
    );
  }

  handleInputDomain = ev => {
    this.setState({
      domain: ev.target.value
    });
  };

  handleDone = () => {
    this.props.onChangePanel('settings');
  };

  handleOnClickChangeStep = newStep => {
    this.setState({ currentStep: newStep });
  };

  handleOnClickMinusStep = () => {
    const actualState = this.state.currentStep;
    const previousState = actualState - 1;
    this.setState({ currentStep: previousState });
  };

  handleDomainExistRequirement = async () => {
    this.setState({ loadingDomain: true });
    const domain = this.state.domain;
    const response = await isDomainAvailable(domain);
    if (!response) {
      this.setState({
        loadingDomain: false,
        existError: true,
        errorMessage: errors.UNKNOWN_DOMAIN_AVAILABLE
      });
    }

    switch (response.status) {
      // eslint-disable-next-line no-case-declarations
      case response_status.DOMAIN_AVAILABLE_SUCCESSFULL:
        const registerDomain = await this.handleRegisterDomain(domain);
        if (registerDomain) {
          const newStep = this.state.currentStep + 1;
          this.setState({
            loadingDomain: false,
            currentStep: newStep,
            domain: domain
          });
          await this.handleGetMXTable(domain);
        } else {
          this.setState({
            loadingDomain: false,
            existError: true,
            errorMessage: errors.UNKNOWN_ERROR
          });
        }

        break;
      case response_status.DOMAIN_AVAILABLE_UNSUCCESSFULL:
        this.setState({
          loadingDomain: false,
          existError: true,
          errorMessage: errors.NOT_DOMAIN_AVAILABLE
        });
        break;
      default:
        this.setState({
          loadingDomain: false,
          existError: true,
          errorMessage: errors.UNKNOWN_DOMAIN_AVAILABLE
        });
    }
  };

  handleRegisterDomain = async domain => {
    const response = await registerDomain(domain);
    return response && response.status === 200;
  };

  handleGetMXTable = async domain => {
    const response = await getDomainMX(domain);

    if (!response) {
      this.setState({
        existError: true,
        errorMessage: errors.FAILED_MX_RECORDS
      });
    }

    switch (response.status) {
      // eslint-disable-next-line no-case-declarations
      case response_status.GET_MX_RECORDS_SUCCESSFULL:
        const mxRecords = response.body.mx;
        this.setState({
          mxTable: mxRecords
        });
        break;
      case response_status.GET_MX_RECORDS_UNSUCCESSFULLL:
        this.setState({
          existError: true,
          errorMessage: errors.FAILED_MX_RECORDS
        });
        break;
      default:
        this.setState({
          existError: true,
          errorMessage: errors.FAILED_MX_RECORDS
        });
    }
  };

  handleSaveDomain = async () => {
    const domain = this.state.domain;
    const params = {
      name: domain,
      validated: true
    };

    await createCustomDomain(params);

    this.props.onAddDomain(domain);
  };
}

CustomDomainsWrapper.propTypes = {
  onAddDomain: PropTypes.func,
  onChangePanel: PropTypes.func
};

export default CustomDomainsWrapper;
