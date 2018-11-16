import animationArmData from '../animations/arm.json';
import animationEmailData from '../animations/email.json';
import animationLockData from '../animations/lock.json';

const defaultOptionsArm = {
  loop: false,
  autoplay: true,
  animationData: animationArmData
};

const defaultOptionsEmail = {
  loop: false,
  autoplay: true,
  animationData: animationEmailData
};

const defaultOptionsLock = {
  loop: false,
  autoplay: true,
  animationData: animationLockData
};

export default {
  1: {
    defaultOptions: defaultOptionsEmail,
    title: 'Welcome!',
    description:
      'Your secure email experience starts now. Be ready for privacy without compromise.',
    speed: 1
  },
  2: {
    defaultOptions: defaultOptionsLock,
    title: 'Strong Privacy',
    description:
      'Criptext doesn`t collect email data. Your emails are only stored on your device.',
    speed: 2
  },
  3: {
    defaultOptions: defaultOptionsArm,
    title: 'The power is yours',
    description:
      'You create information, we believe you have a right to own it.',
    speed: 1
  }
};
