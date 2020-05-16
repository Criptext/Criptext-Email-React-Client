import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import './avatarimage.scss';

class AvatarImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingBorder: true,
      showAvatar: false,
      showBorder: true
    };
  }

  render() {
    const provName = this.props.name
      ? getTwoCapitalLetters(this.props.name)
      : '';
    const color = !this.state.showAvatar ? this.props.color : null;
    return (
      <div style={{ background: color }} className="avatar-letters">
        {(this.state.isLoadingBorder || this.state.showBorder) && (
          <img
            className="cptx-avatar-border"
            src={this.props.borderUrl}
            style={{
              visibility: this.state.isLoadingBorder ? 'hidden' : 'visible'
            }}
            onLoad={this.onLoadBorder}
            onError={this.onErrorBorder}
            alt="user avatar"
          />
        )}
        {(this.state.isLoading || this.state.showAvatar) && (
          <img
            className="cptx-avatar-img"
            src={this.props.avatarUrl}
            style={{ visibility: this.state.isLoading ? 'hidden' : 'visible' }}
            onLoad={this.onLoadAvatar}
            onError={this.onErrorAvatar}
            alt="user avatar"
          />
        )}
        {(this.state.isLoading || !this.state.showAvatar) && (
          <span>{this.props.letters || provName}</span>
        )}
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.avatarUrl !== this.props.avatarUrl ||
      nextProps.letters !== this.props.letters ||
      nextState.isLoading !== this.state.isLoading ||
      nextState.showAvatar !== this.state.showAvatar
    );
  }

  onErrorAvatar = () => {
    this.setState({
      showAvatar: false,
      isLoading: false
    });
  };

  onLoadAvatar = () => {
    this.setState({
      showAvatar: true,
      isLoading: false
    });
  };

  onErrorBorder = () => {
    this.setState({
      showBorder: false,
      isLoadingBorder: false
    });
  };

  onLoadBorder = () => {
    this.setState({
      showBorder: true,
      isLoadingBorder: false
    });
  };
}

AvatarImage.propTypes = {
  avatarUrl: PropTypes.string,
  borderUrl: PropTypes.string,
  color: PropTypes.string,
  letters: PropTypes.string,
  name: PropTypes.string,
  showBorder: PropTypes.bool
};

export default AvatarImage;
