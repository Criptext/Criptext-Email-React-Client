import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { myAccount, requiredMinLength } from './../utils/electronInterface';
import SettingGeneral from './SettingGeneral';

const requiredNameMinLength = requiredMinLength.fullname;

const styles = {
  inline: {
    margin: '0px',
    padding: '0px',
    width: '100px'
  },
  button: {
    innerCircle: {
      r: 4,
      fill: '#0091ff'
    },
    outerCircle: {
      r: 7,
      stroke: '#0091ff',
      strokeWidth: 1
    },
    label: {
      color: '#6c7280',
      fontSize: 14,
      fontFamily: 'NunitoSans',
      bottom: 4
    }
  },
  container: {
    paddingTop: 0,
    cursor: 'pointer',
    height: '50%'
  }
};
/* eslint-disable-next-line react/no-deprecated */
class SettingGeneralWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureEnabled: undefined,
      signature: '',
      name: ''
    };
  }

  componentWillMount() {
    this.setState({
      name: myAccount.name,
      signature: myAccount.signature,
      signatureEnabled: !!myAccount.signatureEnabled
    });
  }

  render() {
    return (
      <SettingGeneral
        name={this.state.name}
        signatureEnabled={this.state.signatureEnabled}
        signature={this.state.signature}
        styles={styles}
        onChangeInputName={this.handleChangeInputName}
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
      />
    );
  }

  handleChangeInputName = async ev => {
    if (ev.target.value <= requiredNameMinLength) {
      ev.preventDefault();
    } else {
      this.setState({ name: ev.target.value });
      await this.props.onUpdateAccount({ name: ev.target.value });
    }
  };

  handleChangeTextareaSignature = async ev => {
    this.setState({ signature: ev.target.value });
    await this.props.onUpdateAccount({ signature: ev.target.value });
  };

  handleChangeRadioButtonSignature = async value => {
    await this.props.onUpdateAccount({ signatureEnabled: value });
    this.setState({ signatureEnabled: value });
  };
}

SettingGeneralWrapper.propTypes = {
  onUpdateAccount: PropTypes.func
};

export default SettingGeneralWrapper;
