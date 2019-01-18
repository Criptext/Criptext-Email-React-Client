import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const ReplyTo = props => (
  <div id="settings-general-reply-to" className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.reply_to_email}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-recovery-email">
        <div className="reply-to-email">
          {props.replyToIsLoading ? (
            <Loader />
          ) : (
            <div>
              <span className="address">
                {props.replyToEmail || string.settings.reply_to_not_set}
              </span>
              {!props.replyToEmail && (
                <button
                  className="button-b"
                  onClick={() => props.onClickSetReplyTo()}
                >
                  <span>{string.settings.set_email}</span>
                </button>
              )}
              {props.replyToEmail && (
                <div>
                  <button
                    className="button-b"
                    onClick={() => props.onClickSetReplyTo()}
                  >
                    <span>{string.settings.change}</span>
                  </button>
                  <button
                    className="button-b"
                    onClick={() => props.onRemoveReplyTo()}
                  >
                    <span>{string.settings.remove}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Loader = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

ReplyTo.propTypes = {
  replyToIsLoading: PropTypes.bool,
  replyToEmail: PropTypes.string,
  onClickSetReplyTo: PropTypes.func,
  onRemoveReplyTo: PropTypes.func
};

export default ReplyTo;
