import animationArmData from '../animations/arm.json';
import animationEmailData from '../animations/email.json';
import animationLockData from '../animations/lock.json';
import string from '../lang';

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
    title: string.welcome.step_1.title,
    description: string.welcome.step_1.description,
    speed: 1
  },
  2: {
    defaultOptions: defaultOptionsLock,
    title: string.welcome.step_2.title,
    description: string.welcome.step_2.description,
    speed: 2
  },
  3: {
    defaultOptions: defaultOptionsArm,
    title: string.welcome.step_3.title,
    description: string.welcome.step_3.description,
    speed: 1
  }
};
