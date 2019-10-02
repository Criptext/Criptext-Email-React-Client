import React from 'react';
import PropTypes from 'prop-types';
import VCExportDatabaseWrapper from './VCExportDatabaseWrapper';
import VCNewPinWrapper from './VCNewPinWrapper';
import VCSigninWrapper from './VCSigninWrapper';
import VCSignupWrapper from './VCSignupWrapper';
import { mySettings } from '../utils/electronInterface';

const Panel = props => (
  <div className="wrapper" data-theme={mySettings.theme || 'light'}>
    {renderVC(props.type)}
  </div>
);

const renderVC = type => {
  switch (type) {
    case 'new':
      return <VCNewPinWrapper />;
    case 'signin':
      return <VCSigninWrapper />;
    case 'signup':
      return <VCSignupWrapper />;
    default:
      return <VCExportDatabaseWrapper />;
  }
};

Panel.propTypes = {
  type: PropTypes.string
};

export default Panel;
