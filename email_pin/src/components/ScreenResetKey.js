import React from 'react';
import Encrypt from './Encrypt';
import string from './../lang';

const { page_encrypt } = string;

const ScreenResetKey = () => {
  return (
    <Encrypt title={page_encrypt.steps[3]} paragraph={page_encrypt.paragraph} />
  );
};

export default ScreenResetKey;
