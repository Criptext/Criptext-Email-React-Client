import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface.js';
import en from './en.json';
import es from './es.json';
import de from './de.json';
import fr from './fr.json';
import ru from './ru.json';

const string = new LocalizedStrings({
  en,
  es,
  de,
  fr,
  ru
});

string.setLanguage(mySettings ? mySettings.language : 'en');

export const setLang = lang => {
  string.setLanguage(lang);
};

export const getLang = mySettings ? mySettings.language : 'en';

export default string;
