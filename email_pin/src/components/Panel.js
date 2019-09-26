import React from 'react';
import PropTypes from 'prop-types';
import VCExportDatabaseWrapper from './VCExportDatabaseWrapper';
import { mySettings } from '../utils/electronInterface';

const Panel = props => (
  <div className="wrapper" data-theme={mySettings.theme || 'light'}>
    {renderVC(props.type)}
  </div>
);

const renderVC = type => {
  switch (type) {
    default:
      return <VCExportDatabaseWrapper />;
  }
};

Panel.propTypes = {
  type: PropTypes.string
};

export default Panel;
