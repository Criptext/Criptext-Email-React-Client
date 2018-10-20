import { toBeConfirmed } from './SignUpSymbols';
export const formItems = [
  {
    name: 'username',
    placeholder: 'Username',
    type: 'text',
    label: {
      text: '@criptext.com',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Username not available',
    value: '',
    optional: false
  },
  {
    name: 'fullname',
    placeholder: 'Full name',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'password',
    placeholder: 'Password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'confirmpassword',
    placeholder: 'Confirm password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: 'Passwords do not match',
    value: '',
    optional: false
  },
  {
    name: 'recoveryemail',
    placeholder: 'Recovery email address (optional)',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Email invalid',
    value: '',
    optional: true
  },
  {
    name: 'acceptterms',
    placeholder: '',
    type: 'checkbox',
    label: {
      text: 'I have read and agree with the ',
      strong: 'Terms and Conditions'
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: false,
    optional: false
  }
];

const onInitState = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = item.value;
    return obj;
  }, {});

const onInitErrors = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = item.optional ? undefined : toBeConfirmed;
    return obj;
  }, {});

export const createStore = () => ({
  values: onInitState(formItems, 'name'),
  errors: onInitErrors(formItems, 'name'),
  isShowingPassword: false
});
