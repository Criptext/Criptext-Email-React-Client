import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './popuphoc.scss';

const PopupHOC = InComponent =>
  class Popup extends Component {
    static defaultProps = {
      isClosable: true,
      popupPosition: { left: '50%', top: '50%' },
      theme: 'light'
    };

    static propTypes = {
      isClosable: PropTypes.bool,
      isHidden: PropTypes.bool,
      onTogglePopup: PropTypes.func,
      popupPosition: PropTypes.object,
      theme: PropTypes.string
    };

    render() {
      const { popupStyle, overlayStyle } = this.defineStyle();
      return (
        !this.props.isHidden && (
          <div className="popup-wrapper" style={popupStyle}>
            <div className="popup-container">
              <InComponent {...this.props} />
            </div>
            <div
              onClick={ev => this.handleTogglePopup(ev)}
              className="popup-overlay"
              style={overlayStyle}
            />
          </div>
        )
      );
    }

    defineStyle = () => {
      const { top, bottom, left, right } = this.props.popupPosition;
      const { theme } = this.props;
      const v = this.setVerticalPosition(top, bottom);
      const h = this.setHorizontalPosition(left, right);
      const c = this.defineOverlayColor(theme);
      return {
        popupStyle: { ...v, ...h },
        overlayStyle: { ...c }
      };
    };

    setVerticalPosition = (top, bottom) => {
      if (!top & !bottom) return { top: 0 };
      else if (top) return { top };
      return { bottom };
    };

    setHorizontalPosition = (left, right) => {
      if (!left & !right) return { left: 0 };
      else if (left) return { left };
      return { right };
    };

    defineOverlayColor = theme => {
      const backgroundColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'none';
      return { backgroundColor };
    };

    handleTogglePopup = ev => {
      ev.stopPropagation();
      if (this.props.onTogglePopup && this.props.isClosable) {
        this.props.onTogglePopup();
      }
    };
  };

export default PopupHOC;
