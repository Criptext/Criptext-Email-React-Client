import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface';
import { updateSettings } from '../utils/ipc';
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

export const currentLanguage = mySettings.language;
string.setLanguage(currentLanguage || 'en');

export const languages = [
  { text: 'English', value: 'en' },
  { text: 'Español', value: 'es' },
  { text: 'Français', value: 'fr' },
  { text: 'Deutsch', value: 'de' },
  { text: 'Русский', value: 'ru' }
];

export const setLang = async lang => {
  string.setLanguage(lang);
  await updateSettings({ language: lang });
};

export default string;
