import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface';
import en from './en';
import es from './es';

const string = new LocalizedStrings({
  en,
  es
});

export const currentLanguage = mySettings.language;
string.setLanguage(currentLanguage || 'en');

export const languages = [
  { text: 'English', value: 'en' },
  { text: 'Español', value: 'es' }
];

export const setLang = lang => {
  string.setLanguage(lang);
  mySettings.update({ language: lang });
};

export default string;
