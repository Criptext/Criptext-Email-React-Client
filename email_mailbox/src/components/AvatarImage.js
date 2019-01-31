import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import './avatarimage.scss';

class AvatarImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAvatar: false
    };
  }

  render() {
    const provName = this.props.name
      ? getTwoCapitalLetters(this.props.name)
      : '';
    return (
      <div key={this.props.avatarUrl} className="avatar-letters">
        {(this.state.isLoading || this.state.showAvatar) && (
          <img
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
}

AvatarImage.propTypes = {
  avatarUrl: PropTypes.string,
  letters: PropTypes.string,
  name: PropTypes.string
};

export default AvatarImage;
