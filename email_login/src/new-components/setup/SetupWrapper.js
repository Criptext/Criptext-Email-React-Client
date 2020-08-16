import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarProfileWrapper from './AvatarProfileWrapper';
import ThemeWrapper from './ThemeWrapper';
import VerifyRecoveryEmailWrapper from './VerifyRecoveryEmailWrapper';
import BackupWrapper from './BackupWrapper';

export const STEP = {
  PROFILE: 'profile',
  THEME: 'theme',
  VERIFY: 'verify',
  BACKUP: 'backup'
};

const stepsFirstAccount = [
  STEP.PROFILE,
  STEP.THEME,
  STEP.RECOVERY,
  STEP.BACKUP
];
const stepsAlreadyAccount = [STEP.PROFILE, STEP.RECOVERY, STEP.BACKUP];

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      step: STEP.PROFILE
    };
  }

  render() {
    let Component;
    switch (this.state.step) {
      case STEP.PROFILE:
        Component = AvatarProfileWrapper;
        break;
      case STEP.THEME:
        Component = ThemeWrapper;
        break;
      case STEP.VERIFY:
        Component = VerifyRecoveryEmailWrapper;
        break;
      case STEP.BACKUP:
        Component = BackupWrapper;
        break;
      default:
        return <div>Not Implemented</div>;
    }
    return <Component
      {...this.props}
      onGoTo={this.handleGoTo}
      totalSteps={4}
      step={1}
    />
  }

  handleGoTo = step => {
    const queue = [...this.state.queue];
    queue.push(this.state.step);
    this.setState({
      queue,
      step
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];
    const step = queue.pop();
    this.setState({
      queue,
      step
    });
  };
}

PanelWrapper.propTypes = {
  step: PropTypes.string
};
export default PanelWrapper;
