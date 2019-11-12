import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface';
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

string.setLanguage(mySettings.language);

export const setLang = lang => {
  string.setLanguage(lang);
};

export default string;
