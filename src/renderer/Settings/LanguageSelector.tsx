import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from '../../locales/de.json';
import en from '../../locales/en.json';
import en_GB from '../../locales/en-gb.json';
import it from '../../locales/it.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';
import zh from '../../locales/zh.json';
import pt from '../../locales/pt.json';
import jp from '../../locales/jp.json';
import tr from '../../locales/tr.json';
import hu from '../../locales/hu.json';
import cs from '../../locales/cs.json';
import pl from '../../locales/pl.json';
import ru from '../../locales/ru.json';
import ko from '../../locales/ko.json';
import hi from '../../locales/hi.json';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/it';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh';
import 'dayjs/locale/pt';
import 'dayjs/locale/tr';
import 'dayjs/locale/hu';
import 'dayjs/locale/cs';
import 'dayjs/locale/pl';
import 'dayjs/locale/ru';

const { store } = window.api;

const options: i18n.InitOptions = {
	resources: {
		de: { translation: de },
		en: { translation: en },
		en_GB: { translation: en_GB },
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
		hi: { translation: hi },
	},
	fallbackLng: 'en',
	supportedLngs: ['de', 'en', 'en-GB', 'it', 'es', 'fr', 'zh', 'pt', 'jp', 'tr', 'hu', 'cs', 'pl', 'ru', 'ko', 'hi'],
	interpolation: {
		escapeValue: false,
	},
	saveMissing: true,
};

i18n
	.use(initReactI18next)
	.init(options)
	.then(() => {
		if(!store.get('language')) {
			store.set('language', navigator.language);
		}
		// TODO: check if this is still working
		i18n.on('missingKey', (key: string) => {
			console.warn(`Missing translation key: ${key}`);
		});
	})
	.catch((error) => {
		console.error('Error initializing i18next:', error);
	});

const friendlyLanguageName: Record<string, string> = {
	de: 'Deutsch',
	en: 'English',
	'en-GB': 'English (UK)',
	it: 'Italiano',
	es: 'Español',
	fr: 'Français',
	zh: '简体中文',
	pt: 'Português',
	jp: '日本語',
	tr: 'Türkçe',
	hu: 'Magyar',
	cs: 'Čeština',
	pl: 'Polski',
	ru: 'Русский',
	ko: '한국어',
	hi: 'हिन्दी',
};

interface Props {
	settings: Settings;
	attributeMapping;
}

const LanguageSelector: React.FC<Props> = ({
  	settings,
  	attributeMapping,
}) => {
	const supportedLanguages: false | readonly string[] | undefined = i18n.options.supportedLngs;

	const changeLanguage = (event: React.ChangeEvent<{ value: string }>) => {
		const language = event.target.value;
		store.set('language', language);
	};

	useEffect(() => {
		i18n.changeLanguage(settings.language)
		.then(() => {
			store.set('language', settings.language);
			//setAttributeMapping(attributeMapping(i18n.t));
		})
			.catch((error) => {
			console.error('Error loading translation:', error);
		});
	}, [settings.language]);

	return (
		<FormControl>
			<InputLabel id='language'>{i18n.t('settings.language')}</InputLabel>
			<Select
				labelId='language'
				id='language'
				label='Language'
				value={settings.language || navigator.language}
				name='language'
				onChange={(event) => changeLanguage(event)}
			>
				{Array.isArray(supportedLanguages) ? (
					supportedLanguages.map((languageCode: string) => (
						languageCode !== 'cimode' && (
							<MenuItem key={languageCode} value={languageCode}>
								{friendlyLanguageName[languageCode]}
							</MenuItem>
						)
					))
				) : null}
			</Select>
		</FormControl>
	);
};

export default LanguageSelector;
export { i18n };
