import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lottie from 'lottie-web';

class Lottie extends Component {
  render() {
    const { width, height } = this.props;

    const lottieStyles = {
      width: this.getSize(width),
      height: this.getSize(height),
      overflow: 'hidden',
      margin: '0 auto'
    };

    return (
      <div
        ref={c => {
          this.el = c;
        }}
        style={lottieStyles}
      />
    );
  }

  componentDidMount() {
    const { options: { loop, autoplay, animationData } } = this.props;

    this.options = {
      container: this.el,
      renderer: 'svg',
      loop: loop !== false,
      autoplay: autoplay !== false,
      animationData
    };
    this.anim = lottie.loadAnimation(this.options);
  }

  componentDidUpdate() {
    this.setSpeed();
    this.goToAndStop();
  }

  setSpeed() {
    this.anim.setSpeed(this.props.speed);
  }

  goToAndStop() {
    this.anim.goToAndStop(this.props.frame, true);
  }

  getSize = initial => {
    let size;

    if (typeof initial === 'number') {
      size = `${initial}px`;
    } else {
      size = initial || '100%';
    }

    return size;
  };
}

Lottie.propTypes = {
  frame: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.object,
  speed: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Lottie.defaultProps = {
  speed: 1,
  frame: 0
};

export default Lottie;
