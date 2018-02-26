import React from 'react';
import ClientAPI from '@criptext/email-http-client';
import {
  closeCreatingKeys,
  openMailbox,
  remoteData
} from './../utils/electronInterface';
import { createStore, generatePreKeyBundle } from './../libs/signal-criptext';
import { API_URL } from './../utils/const';
import './loading.css';

const animation = async () => {
  const client = new ClientAPI(API_URL);
  const store = await createStore();
  const bundle = await generatePreKeyBundle(store, 1, 1);
  const credentials = {
    username: remoteData.username,
    password: remoteData.password,
    deviceId: 1
  };
  const loginResponse = await client.login(credentials);
  if (loginResponse.status === 200) {
    const serverResponse = await client.postKeyBundle(bundle);
    if (serverResponse.status === 200) {
      openMailbox();
      closeCreatingKeys();
    }
  }
};

const Loading = () => (
  <div className="loading-body">
    <div className="content">
      <div className="logo">
        <div className="icon" />
      </div>

      <div className="bar">
        <div className="content" />
      </div>

      <div className="percent">
        <div className="content">
          <span className="number">60%</span>
        </div>
      </div>

      <div className="message">
        <span>Creating Keys</span>
      </div>
    </div>
  </div>
);

animation();

export default Loading;
