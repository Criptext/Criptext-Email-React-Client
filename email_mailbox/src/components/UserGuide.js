import React, { Component } from 'react';
import Joyride from 'react-joyride';
import { EVENTS } from 'react-joyride/es/constants';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';
import { setUserGuideStepStatus } from '../utils/storage';
import string from './../lang';

const { userGuide } = string;

const styles = {
  buttonClose: {
    display: 'none'
  },
  spotlightLegacy: { borderRadius: 15 },
  tooltip: {
    width: 280,
    borderRadius: 6
  },
  tooltipContainer: {
    textAlign: 'left'
  },
  tooltipContent: {
    padding: 0,
    paddingLeft: 12
  },
  tooltipFooter: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: 8
  },
  buttonNext: {
    backgroundColor: '#0091ff',
    borderRadius: 100,
    color: '#fff',
    height: 31,
    width: 75
  }
};

const USER_GUIDE_STEPS = {
  BUTTON_COMPOSE: 'userGuideStepButtonCompose',
  EMAIL_READ: 'userGuideStepEmailRead',
  ACTIVITY_FEED: 'userGuideStepActivityFeed'
};

const USER_GUIDE_STEPS_INFO = {
  [USER_GUIDE_STEPS.BUTTON_COMPOSE]: {
    name: USER_GUIDE_STEPS.BUTTON_COMPOSE,
    target: '.button-compose',
    content: userGuide.buttonCompose.text,
    placement: 'right',
    disableBeacon: true,
    spotlightClicks: false,
    locale: { close: userGuide.buttonCompose.buttonLabel }
  },
  [USER_GUIDE_STEPS.EMAIL_READ]: {
    name: USER_GUIDE_STEPS.EMAIL_READ,
    target: '.email-status.icon-double-checked.status-opened ',
    content: userGuide.emailRead.text,
    placement: 'right',
    disableBeacon: true,
    spotlightClicks: false,
    locale: { close: userGuide.emailRead.buttonLabel }
  },
  [USER_GUIDE_STEPS.ACTIVITY_FEED]: {
    name: USER_GUIDE_STEPS.ACTIVITY_FEED,
    target: '.icon-bell',
    content: userGuide.activityFeed.text,
    placement: 'left',
    disableBeacon: true,
    spotlightClicks: false,
    locale: { close: userGuide.activityFeed.buttonLabel }
  }
};

class UserGuide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      run: false,
      stepIndex: -1,
      steps: []
    };
  }

  render() {
    const { run, steps, stepIndex } = this.state;
    return (
      <Joyride
        continuous={false}
        run={run}
        steps={steps}
        stepIndex={stepIndex}
        disableCloseOnEsc={true}
        disableOverlayClose={false}
        hideBackButton={true}
        showProgress={false}
        showSkipButton={false}
        spotlightClicks={false}
        spotlightPadding={5}
        callback={this.handleCallback}
        styles={styles}
      />
    );
  }

  componentDidMount() {
    this.initUserGuideEventsHandler();
  }

  handleCallback = data => {
    const { index, type } = data;
    if (type === EVENTS.TOUR_END && this.state.run) {
      this.setState({ run: false });
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      this.setState({ run: false });
    } else if (type === EVENTS.STEP_AFTER) {
      const currentStep = this.state.steps[index].name;
      setUserGuideStepStatus(currentStep);
      this.setState({ stepIndex: index + 1 });
    }
  };

  componentWillUnmount() {
    removeEvent(Event.SHOW_USER_GUIDE_STEP, this.handleUserGuideEvent);
  }

  initUserGuideEventsHandler = () => {
    addEvent(Event.SHOW_USER_GUIDE_STEP, this.handleUserGuideEvent);
  };

  handleUserGuideEvent = stepsNames => {
    const steps = stepsNames.map(stepName => USER_GUIDE_STEPS_INFO[stepName]);
    if (!this.state.run) {
      this.setState({
        run: true,
        stepIndex: 0,
        steps
      });
    }
  };
}

export { UserGuide as default, USER_GUIDE_STEPS };
