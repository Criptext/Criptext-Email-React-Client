import React, { Component } from 'react';
import CustomDomains from './CustomDomains';
import string from './../lang';
import { isDomainAvailable, getDomainMX, registerDomain } from '../utils/ipc';

const errors = {
  NOT_DOMAIN_AVAILABLE: string.address.add.step1.errors.usedDomain,
  UNKNOWN_DOMAIN_AVAILABLE: string.address.add.step1.errors.unknownError,
  FAILED_MX_RECORDS: string.address.add.step2_2.errors.notMXRecords,
  FAILED_REGISTER_DOMAIN: 'domain cant be registered',
  REGISTER_DOMAIN: 'Server error. Try again later ',
  CUSTOM_DOMAIN: 'Custom domain limit '
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
      />
    );
  }

  handleInputDomain = ev => {
    this.setState({
      domain: ev.target.value
    });
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
      case 200:
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
            errorMessage: errors.FAILED_REGISTER_DOMAIN
          });
        }

        break;
      case 400:
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
      case 200:
        const mxRecords = response.body.mx;
        this.setState({
          mxTable: mxRecords
        });
        break;
      case 400:
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
}

export default CustomDomainsWrapper;
