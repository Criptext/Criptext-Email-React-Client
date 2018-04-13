import React, { Component } from 'react';
import PropTypes from 'prop-types';
import anime from 'animejs';
import './activitypanelshortcut.css';

let componentAnime = null;

class ActivityPanelShortCut extends Component {
  render() {
    return (
      <div
        className="activity-panel-shortcut-container"
        onClick={() => this.animateOutComponent(this.props.onClick)}
      >
        <div className="activity-panel-shortcut-content">
          <i className="icon-bell" />
        </div>
      </div>
    );
  }

  componentDidMount() {
    return this.animateInComponent();
  }

  animateInComponent = () => {
    componentAnime = anime.timeline({
      direction: 'alternate',
      loop: false,
      autoplay: true
    });
    componentAnime
      .add({
        targets: '.activity-panel-shortcut-container',
        width: [0, 61],
        duration: 300,
        translateX: {
          value: [61, 0]
        },
        easing: 'linear'
      })
      .add({
        targets: '.activity-panel-shortcut-content',
        duration: 200,
        translateX: {
          value: [10, 0]
        },
        easing: 'linear'
      });
  };

  animateOutComponent = action => {
    componentAnime.pause();
    componentAnime = anime.timeline().add({
      targets: '.activity-panel-shortcut-container',
      translateX: {
        value: [0, 61]
      },
      duration: 300,
      elasticity: 0,
      easing: 'linear',
      width: 0,
      complete: () => {
        action();
      }
    });
  };
}

ActivityPanelShortCut.propTypes = {
  onClick: PropTypes.func
};

export default ActivityPanelShortCut;
