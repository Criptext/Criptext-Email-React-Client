import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PopupHOC from './PopupHOC';
import LogoutPopup from './LogoutPopup';
import Message from '../containers/Message';
import './settings.scss';

const Logoutpopup = PopupHOC(LogoutPopup);

const renderPathSection = (titles, goBackToSettings) => {
  return titles.reduce((result, title, index) => {
    const isLast = index === titles.length - 1;
    const titleComponent = (
      <h1
        key={index}
        className={`settings-title-${isLast ? 'active' : 'inactive'}`}
        onClick={isLast ? null : goBackToSettings}
      >
        {title}
      </h1>
    );
    if (!result.length) {
      return [...result, titleComponent];
    }
    return [
      ...result,
      <i key={`i-${index}`} className="icon-arrow-right" />,
      titleComponent
    ];
  }, []);
};

const SettingsHOC = InComponent =>
  class Popup extends Component {
    static propTypes = {
      titlePath: PropTypes.array,
      isHiddenSettingsPopup: PropTypes.bool,
      onChangePanel: PropTypes.func,
      onClosePopup: PropTypes.func,
      onConfirmLogout: PropTypes.func
    };

    render() {
      return (
        <div className="settings-container">
          <Message onClickSection={() => {}} />
          <div className="settings-title">
            {renderPathSection(this.props.titlePath, this.goBackToSettings)}
          </div>
          <InComponent {...this.props} />
          <Logoutpopup
            isHidden={this.props.isHiddenSettingsPopup}
            onConfirmLogout={this.props.onConfirmLogout}
            onTogglePopup={this.props.onClosePopup}
            popupPosition={{ left: '45%', top: '45%' }}
            theme={'dark'}
          />
        </div>
      );
    }

    goBackToSettings = () => {
      this.props.onChangePanel('settings');
    };
  };

export default SettingsHOC;
