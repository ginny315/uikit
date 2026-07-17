import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import common from './locales/zh-CN/common.json';
import nav from './locales/zh-CN/nav.json';
import dashboard from './locales/zh-CN/dashboard.json';
import agents from './locales/zh-CN/agents.json';
import tasks from './locales/zh-CN/tasks.json';
import status from './locales/zh-CN/status.json';
import validation from './locales/zh-CN/validation.json';

const resources = {
  'zh-CN': {
    common,
    nav,
    dashboard,
    agents,
    tasks,
    status,
    validation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    lng: 'zh-CN', // 目前仅中文，后期由 detector 自动切换
    defaultNS: 'common',
    ns: ['common', 'nav', 'dashboard', 'agents', 'tasks', 'status', 'validation'],
    interpolation: {
      escapeValue: false, // React 已经处理 XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'agentsys-lang',
    },
  });

export default i18n;
