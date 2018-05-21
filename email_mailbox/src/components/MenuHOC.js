import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './menuhoc.css';

const MenuHOC = InComponent =>
  class Menu extends Component {
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
            onClick={() => this.props.onToggleMenu()}
            className="menu-overlay"
          />
        </div>
      );
    }

    defineStyle = () => {
      const { top, bottom, left, right } = this.props.menuPosition;
      const result = {};
      if (!top & !bottom) result.top = 0;
      else if (top) result.top = top;
      else result.bottom = bottom;

      if (!left & !right) result.left = 0;
      else if (left) result.left = left;
      else result.right = right;

      return result;
    };
  };

export const MenuType = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

export default MenuHOC;
