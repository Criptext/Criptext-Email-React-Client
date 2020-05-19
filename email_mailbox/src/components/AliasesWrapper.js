import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Aliases from './Aliases';
import { setAddress, createAlias, getCustomDomainByParams } from '../utils/ipc';
import { appDomain } from '../utils/const';
import { usernameRegex } from '../utils/RegexUtils';
import string from '../lang';

const { errors } = string.alias.add;

class AliasesWrapper extends Component {
  constructor(props) {
    super(props);
    const domains = [appDomain];
    this.state = {
      selectedDomain: domains[0],
      domains: [appDomain],
      input: '',
      loading: false,
      success: false,
      errorMessage: undefined
    };
  }

  render() {
    return (
      <Aliases
        selectedDomain={this.state.selectedDomain}
        domains={this.state.domains}
        input={this.state.input}
        onChangeInput={this.handleChangeInput}
        onChangeDomain={this.handleChangeDomain}
        onCancel={this.handleCancel}
        onSave={this.handleSave}
        loading={this.state.loading}
        success={this.state.success}
        errorMessage={this.state.errorMessage}
      />
    );
  }

  async componentDidMount() {
    const domainsRaw = await getCustomDomainByParams({});
    const domains = domainsRaw.map(domain => domain.dataValues.name);
    this.setState({
      domains: [appDomain, ...domains]
    });
  }

  handleCancel = () => {
    this.props.onChangePanel('settings');
  };

  handleChangeDomain = ev => {
    const value = ev.target.value;
    this.setState({ selectedDomain: value });
  };

  handleChangeInput = ev => {
    const value = ev.target.value.toLowerCase();
    const error =
      value.length > 3 && !usernameRegex.test(value)
        ? errors.invalid
        : undefined;
    this.setState({
      input: value,
      errorMessage: error
    });
  };

  handleSave = () => {
    const username = this.state.input;
    const domain = this.state.selectedDomain;
    this.setState(
      {
        loading: true
      },
      () => {
        this.sendSetAddressRequest(username, domain);
      }
    );
  };

  sendSetAddressRequest = async (username, domain) => {
    const response = await setAddress({ username, domain });
    if (!response) {
      this.setState({
        loading: false,
        errorMessage: errors.timeout
      });
      return;
    }
    switch (response.status) {
      case 200: {
        const addressId = response.body.addressId;
        const alias = {
          rowId: addressId,
          name: username,
          domain: domain === appDomain ? null : domain,
          active: true
        };
        await createAlias(alias);
        this.props.onAddAlias(alias);
        this.setState({
          loading: false,
          success: true
        });
        break;
      }
      case 400:
        this.setState({
          loading: false,
          errorMessage: errors.exists
        });
        break;
      case 439:
        this.setState({
          loading: false,
          errorMessage: errors.limit
        });
        break;
      default:
        this.setState({
          loading: false,
          errorMessage: string.formatString(errors.unknown, response.status)
        });
    }
  };
}

AliasesWrapper.propTypes = {
  onAddAlias: PropTypes.func,
  onChangePanel: PropTypes.func,
  onCheckForUpdates: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default AliasesWrapper;
