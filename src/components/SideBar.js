import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideBarItem from './../components/SideBarItem';
import LabelEdit from './../containers/LabelEdit';
import { MailItems } from './../utils/const';
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
              {
                MailItems.map((item, key) => {
                  return <SideBarItem key={key} item={item}/>
                })
              }
              <li className="nav-item nav-item-more">
                <div className="line-separator" />
                <div className="nav-item-container">
                  <div className="nav-item-icon">
                    <i className="icon-tag" />
                  </div>
                  <a>Labels</a>
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
      {this.state.showLabels ? 
          this.props.labels.valueSeq().map((label, key) => {
            return (
              <li key={key} className="nav-item-label">
                <div />
                <span>{label.get('text')}</span>
              </li>
            );
          })
       : null}
      </ul>
    )
  }
}

SideBar.propTypes = {
  labels: PropTypes.object
};

export default SideBar;
