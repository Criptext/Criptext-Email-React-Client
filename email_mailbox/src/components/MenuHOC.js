import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './menuhoc.scss';

const MenuHOC = InComponent =>
  class Menu extends Component {
    static defaultProps = {
      menuPosition: { top: 0, left: 0 }
    };

    static propTypes = {
      arrowPosition: PropTypes.string,
      menuPosition: PropTypes.object,
      isHidden: PropTypes.bool,
      onToggleMenu: PropTypes.func
    };

    render() {
      const style = this.defineStyle();
      return this.props.isHidden ? null : (
        <div className="menu-wrapper">
          <div
            className={`menu-container menu-arrow arrow-${this.props
              .arrowPosition || MenuType.TOP_LEFT}`}
            style={style}
          >
            <InComponent {...this.props} />
          </div>
          <div
            onClick={ev => this.handleToggleMenu(ev)}
            className="menu-overlay"
          />
        </div>
      );
    }

    handleToggleMenu = ev => {
      ev.stopPropagation();
      if (this.props.onToggleMenu) {
        this.props.onToggleMenu();
      }
    };

    defineStyle = () => {
      const { top, bottom, left, right } = this.props.menuPosition;
      const v = this.setVerticalPosition(top, bottom);
      const h = this.setHorizontalPosition(left, right);
      return { ...v, ...h };
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
  };

export const MenuType = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

export default MenuHOC;
