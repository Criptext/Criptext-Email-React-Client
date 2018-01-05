import React, { Component } from 'react';
import SelectHeader from './SelectHeader';

const headerWrapper = Header =>
  class HeaderWrapper extends Component {
    constructor() {
      super();
      this.state = {
        search: false
      };
    }

    render() {
      return (
        <Header />
      );
    }
  };

const Wrapper = headerWrapper(SelectHeader);

export default Wrapper;