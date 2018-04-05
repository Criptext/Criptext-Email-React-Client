import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideBarItem from './../components/SideBarItem';
import SideBarLabelItem from './../containers/SideBarLabelItem';
import LabelEdit from './../containers/LabelEdit';
import { SideBarItems } from './../utils/const';
import { openComposerWindow } from '../utils/electronInterface';
import './sidebar.css';

class SideBar extends Component {
  constructor() {
    super();
    this.state = {
      showLabels: false
    };
  }

  render() {
    return (
      <aside
        className={
          'navigation-app' +
          (!this.props.isOpenSideBar
            ? ' navigation-app-collapse'
            : ' navigation-app-expand')
        }
      >
        <header onClick={() => this.props.onToggleSideBar()}>
          <div className="header-icon" />
          <i className="icon-criptext" />
        </header>
        <div className="navigation-partial-mail">
          <div className="nav-item-free">
            <button
              className="button button-a button-compose"
              onClick={openComposerWindow}
            >
              <i className="icon-edit" />
              <span>Compose</span>
            </button>
          </div>
          <nav>
            <ul>
              {SideBarItems.map((item, key) => {
                const selected = item.id === this.props.mailboxSelected;
                return (
                  <SideBarItem
                    onClick={() => {
                      this.props.onClickMailboxSelected(item.id);
                    }}
                    key={key}
                    item={item}
                    selected={selected}
                  />
                );
              })}
              <li
                className={
                  'nav-item nav-item-more ' +
                  (this.state.showLabels ? 'nav-item-more-selected' : '')
                }
              >
                <div className="line-separator" />
                <div className="nav-item-container">
                  <div className="nav-item-icon">
                    <i className="icon-tag" />
                  </div>
                  <span>Labels</span>
                  <div
                    className="nav-item-option"
                    onClick={e => this.handleToggleShowLabelButtonClick(e)}
                  >
                    <i
                      className={
                        this.state.showLabels
                          ? 'icon-toogle-up'
                          : 'icon-toogle-down'
                      }
                    />
                  </div>
                </div>
                {this.renderLabels()}
              </li>
            </ul>
          </nav>
          <LabelEdit />
        </div>
      </aside>
    );
  }

  componentDidMount() {
    this.props.onLoadLabels();
  }

  handleToggleShowLabelButtonClick = () => {
    this.setState({ showLabels: !this.state.showLabels });
  };

  renderLabels = () => {
    return (
      <ul>
        {this.state.showLabels
          ? this.props.labels.map((label, key) => {
              return <SideBarLabelItem key={key} label={label} />;
            })
          : null}
      </ul>
    );
  };
}

SideBar.propTypes = {
  isOpenSideBar: PropTypes.bool,
  labels: PropTypes.object,
  mailboxSelected: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  onLoadLabels: PropTypes.func,
  optionSelected: PropTypes.string
};

export default SideBar;
