import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LabelEdit from './../containers/LabelEdit';
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
      <aside className="navigation-app">
        <header>
          <div className="header-icon" />
        </header>
        <div className="navigation-partial-mail">
          <div className="nav-item-free">
            <button className="button button-compose">
              <i className="icon-edit" />
              <span>Compose</span>
            </button>
          </div>
          <nav>
            <ul>
              <li className="nav-item nav-item-selected">
                <div className="nav-item-icon">
                  <i className="icon-mailbox" />
                </div>
                <Link to="/inbox">Inbox</Link>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-sent" />
                </div>
                <Link to="/">Sent</Link>
                <div className="nav-item-notif">
                  <span>+99</span>
                </div>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-doc" />
                </div>
                <Link to="/">Draft</Link>
                <div className="nav-item-notif">
                  <span>10</span>
                </div>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-start" />
                </div>
                <Link to="/">Starred</Link>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-not" />
                </div>
                <Link to="/">Spam</Link>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-trash" />
                </div>
                <Link to="/">Trash</Link>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-calendar" />
                </div>
                <Link to="/">Send Later</Link>
              </li>
              <li className="nav-item">
                <div className="nav-item-icon">
                  <i className="icon-bell-inclined" />
                </div>
                <Link to="/">Reminders</Link>
                <div className="nav-item-notif">
                  <span>3</span>
                </div>
              </li>
              <li className="nav-item nav-item-more">
                <div className="line-separator" />
                <div className="nav-item-container">
                  <div className="nav-item-icon">
                    <i className="icon-tag" />
                  </div>
                  <Link to="/">Labels</Link>
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
                {this.state.showLabels ? (
                  <ul>
                    {' '}
                    {this.props.labels.valueSeq().map((label, key) => {
                      return (
                        <li key={key} className="nav-item-label">
                          <div />
                          <span>{label.get('text')}</span>
                        </li>
                      );
                    })}{' '}
                  </ul>
                ) : null}
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
}

SideBar.propTypes = {
  labels: PropTypes.object
};

export default SideBar;
