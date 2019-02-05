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
    const color = !this.state.showAvatar ? this.props.color : null;
    return (
      <div className="avatar-letters" style={{ background: color }}>
        {(this.state.isLoading || this.state.showAvatar) && (
          <img
            src={this.props.avatarUrl}
            style={{ visibility: this.state.isLoading ? 'hidden' : 'visible' }}
            onLoad={this.onLoadAvatar}
            onError={this.onErrorAvatar}
          />
        )}
        {(this.state.isLoading || !this.state.showAvatar) && (
          <span>{this.props.letters || provName}</span>
        )}
      </div>
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
  color: PropTypes.string,
  letters: PropTypes.string,
  name: PropTypes.string
};

export default AvatarImage;
