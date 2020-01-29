import React from 'react';
import PropTypes from 'prop-types';
import './encrypt.scss';

const Encrypt = props => (
  <section>
    <div className="encrypt-content">
      <div className="encrypt-icon" />
      <h1>{props.title}</h1>
      <div className="encrypt-loading">
        <div className="bar">
          <div
            className={`content ${props.animationState}`}
            style={{ width: props.percent || 100 + '%' }}
          />
        </div>
        {!!props.percent && (
          <div className="percent">
            <div className="content">
              <span className="number">{props.percent}%</span>
            </div>
          </div>
        )}
      </div>
      <span>{props.paragraph}</span>
    </div>
  </section>
);

Encrypt.propTypes = {
  animationState: PropTypes.string,
  paragraph: PropTypes.string,
  percent: PropTypes.number,
  title: PropTypes.string
};

export default Encrypt;
