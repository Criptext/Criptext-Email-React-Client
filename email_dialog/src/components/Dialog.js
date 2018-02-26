import React from 'react';
import { remoteData, onResponseModal } from './../utils/electronInterface';
import './dialog.css';

const Dialog = () => (
  <div className="dialog-body">
    <div className="header" />
    <div className="content">
      <h2 className="title">{remoteData.title}</h2>
      {renderContent(remoteData.content)}
      {renderOptions(remoteData.options)}
    </div>
  </div>
);

const renderContent = content => {
  return (
    <div className="message">
      {content.map((paragraph, index) => {
        return (
          <p key={index}>
            {paragraph.paragraphContent.map((item, subindex) => {
              return item.type === 'strong' ? (
                <strong key={subindex}>{item.text}</strong>
              ) : (
                <span key={subindex}>{item.text}</span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

const renderOptions = options => {
  return (
    <div className="options">
      <button
        className={options.acceptLabel !== '' ? 'cancel' : 'hidden'}
        onClick={e => onResponseModal(e, options.cancelLabel)}
      >
        <span>{options.cancelLabel}</span>
      </button>
      <button
        className={options.acceptLabel !== '' ? 'confirm' : 'hidden'}
        onClick={e => onResponseModal(e, options.acceptLabel)}
      >
        <span>{options.acceptLabel}</span>
      </button>
    </div>
  );
};

export default Dialog;
