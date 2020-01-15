import React from 'react';
import PropTypes from 'prop-types';
import VCExportDatabaseWrapper from './VCExportDatabaseWrapper';
import VCNewPinWrapper from './VCNewPinWrapper';
import VCSigninWrapper from './VCSigninWrapper';
import VCSignupWrapper from './VCSignupWrapper';
import VCResetKeyWrapper from './VCResetKeyWrapper';

const Panel = props => <div className="wrapper">{renderVC(props.type)}</div>;

const renderVC = type => {
  switch (type) {
    case 'new':
      return <VCNewPinWrapper />;
    case 'signin':
      return <VCSigninWrapper />;
    case 'signup':
      return <VCSignupWrapper />;
    case 'reset':
      return <VCResetKeyWrapper />;
    default:
      return <VCExportDatabaseWrapper />;
  }
};

Panel.propTypes = {
  type: PropTypes.string
};

export default Panel;
