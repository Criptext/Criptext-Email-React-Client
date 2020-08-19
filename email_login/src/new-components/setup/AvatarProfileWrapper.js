import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from './SetupCover';
import './avatarprofilewrapper.scss';
import { uploadAvatar } from '../../utils/ipc';
import { showOpenFileDialog } from '../../utils/electronInterface';
import string from '../../lang';

const { avatar } = string.setup;

class AvatarProfileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      showAvatar: true,
      timestamp: Date.now()
    };
  }

  render() {
    return (
      <SetupCover
        {...this.props}
        title={avatar.title}
        topButton={avatar.button}
        //bottomButton={string.setup.skip}
        onClickTopButton={this.handleNext}
        onGoBack={undefined}
      >
        <div className="setup-profile">
          <div>
            <div
              onClick={this.showUploadBrowser}
              className={
                'setup-avatar ' + (this.state.uploading ? ' busy' : '')
              }
            >
              {this.state.showAvatar && (
                <img
                  src={`https://stage.mail.criptext.com/user/avatar/jigl.com/${
                    this.props.account.username
                  }?date=${this.state.timestamp}`}
                  alt={avatar.img}
                  onError={this.onErrorAvatar}
                />
              )}
            </div>
            <div className="setup-avatar-name">
              <span>{this.props.account.fullname}</span>
            </div>
          </div>
        </div>
      </SetupCover>
    );
  }

  handleNext = () => {
    this.props.onGoTo('theme');
  };

  onErrorAvatar = () => {
    this.setState({
      showAvatar: false
    });
  };

  showUploadBrowser = async () => {
    if (this.state.uploading) return;
    const { filePaths } = await showOpenFileDialog();
    if (!filePaths || !filePaths[0]) {
      console.log('Not image selected');
      return;
    }
    this.setState(
      {
        uploading: true
      },
      () => {
        this.handleUploadAvatar(filePaths[0]);
      }
    );
  };

  handleUploadAvatar = async path => {
    const res = await uploadAvatar({
      recipientId: this.props.account.username,
      path
    });
    this.setState({
      uploading: false
    });
    if (!res || res.status !== 200) {
      return;
    }
    this.setState({
      uploading: false,
      showAvatar: true,
      timestamp: Date.now()
    });
  };
}

AvatarProfileWrapper.propTypes = {
  step: PropTypes.string
};
export default AvatarProfileWrapper;
