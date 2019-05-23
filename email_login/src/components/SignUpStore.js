import { toBeConfirmed, optionallyEmpty } from './SignUpSymbols';
import string from './../lang';
import { appDomain } from './../utils/const';

const { form, errorMessages } = string.signUp;
const { placeholders } = form;

export const formItems = [
  {
    name: 'username',
    placeholder: placeholders.username,
    type: 'text',
    label: {
      text: `@${appDomain}`,
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: errorMessages.USERNAME_EXISTS,
    value: '',
    optional: false
  },
  {
    name: 'fullname',
    placeholder: placeholders.fullName,
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: errorMessages.FULLNAME_INVALID,
    value: '',
    optional: false
  },
  {
    name: 'password',
    placeholder: placeholders.password,
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: errorMessages.PASSWORD_INVALID,
    value: '',
    optional: false
  },
  {
    name: 'confirmpassword',
    placeholder: placeholders.confirmPassword,
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: errorMessages.PASSWORD_NOMATCH,
    value: '',
    optional: false
  },
  {
    name: 'recoveryemail',
    placeholder: placeholders.recoveryEmail,
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: errorMessages.EMAIL_INVALID,
    value: '',
    optional: true
  },
  {
    name: 'acceptterms',
    placeholder: '',
    type: 'checkbox',
    label: {
      text: placeholders.checkbox.prefix,
      strong: placeholders.checkbox.suffix
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
    obj[item[field]] = item.optional ? optionallyEmpty : toBeConfirmed;
    return obj;
  }, {});

export const createStore = () => ({
  values: onInitState(formItems, 'name'),
  errors: onInitErrors(formItems, 'name'),
  isShowingPassword: false
});
