import React, { Component } from 'react';
import string from './../lang';
import './encrypt.scss';

const { page_encrypt } = string;

class Encrypt extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.textArea = undefined;
  }

  render() {
    return (
      <section>
        <div className="encrypt-content">
          <div className="encrypt-icon" />
          <h1>{page_encrypt.title}</h1>
          <div className="encrypt-loading">
            <div className="bar">
              <div
                className={`content running-animation`}
                style={{ width: 100 + '%' }}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Encrypt;
