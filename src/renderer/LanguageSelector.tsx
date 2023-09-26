import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from '../locales/de.json';
import en from '../locales/en.json';
import it from '../locales/it.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import zh from '../locales/zh.json';
import pt from '../locales/pt.json';
import jp from '../locales/jp.json';
import tr from '../locales/tr.json';
import hu from '../locales/hu.json';
import cs from '../locales/cs.json';
import pl from '../locales/pl.json';
import ru from '../locales/ru.json';
import ko from '../locales/ko.json';
import hi from '../locales/hi.json';

const { store } = window.api;

const options = {
    resources: {
    	de: { translation: de },
			en: { translation: en },
			it: { translation: it },
			es: { translation: es },
			fr: { translation: fr },
			zh: { translation: zh },
			pt: { translation: pt },
			jp: { translation: jp },
			tr: { translation: tr },
			hu: { translation: hu },
			cs: { translation: cs },
			pl: { translation: pl },
			ru: { translation: ru },
			ko: { translation: ko },
			hi: { translation: hi }
    },
    lng: store.get('language') || navigator.language,
    fallbackLng: 'en',
    supportedLngs: ['de', 'en', 'it', 'es', 'fr', 'zh', 'pt', 'jp', 'tr', 'hu', 'cs', 'pl', 'ru', 'ko', 'hi'],
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
}

i18n
  .use(initReactI18next)
  .init(options);

i18n.on('missingKey', (language, ns, key, res) => {
	console.warn(`Missing translation key: ${key}`);
});

const friendlyLanguageName = {
	de: 'Deutsch',
	en: 'English',
	it: 'Italiano',
	es: 'Español',
	fr: 'Français',
	zh: '简体中文',
	pt: 'Português do Brasil',
	jp: '日本語',
	tr: 'Türkçe',
	hu: 'Magyar',
	cs: 'Čeština',
	pl: 'Polski',
	ru: 'Русский',
	ko: '한국어',
	hi: 'हिन्दी'
}

const LanguageSelector = () => {
	const [selectedLanguage, setSelectedLanguage] = useState(store.get('language') || i18n.language);
	const supportedLanguages = i18n.options.supportedLngs;

	const changeLanguage = (event) => {
		const language = event.target.value;
		setSelectedLanguage(language);
	};

	useEffect(() => {
		i18n.changeLanguage(selectedLanguage, (error) => {
			if (error) return console.error('Error loading translation:', error);
			store.set('language', selectedLanguage)
		});
	}, [selectedLanguage]);

	return (
	<FormControl>
	<InputLabel id='language'>{i18n.t('settings.language')}</InputLabel>
		<Select
		  labelId='language'
		  id='language'
		  label='Language'
		  value={selectedLanguage}
		  name='language'
		  onChange={changeLanguage}
		>
		{supportedLanguages.map((languageCode) => (
		  languageCode !== 'cimode' && (
		    <MenuItem key={languageCode} value={languageCode}>
		      {friendlyLanguageName[languageCode]}
		    </MenuItem>
		  )
		))}
		</Select>
	</FormControl>  	
	);
};

export default LanguageSelector;
export { i18n };