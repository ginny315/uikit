import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonZh from './locales/zh-CN/common.json';
import navZh from './locales/zh-CN/nav.json';
import authZh from './locales/zh-CN/auth.json';
import dashboardZh from './locales/zh-CN/dashboard.json';
import agentsZh from './locales/zh-CN/agents.json';
import tasksZh from './locales/zh-CN/tasks.json';
import logsZh from './locales/zh-CN/logs.json';
import statusZh from './locales/zh-CN/status.json';
import validationZh from './locales/zh-CN/validation.json';
import workflowsZh from './locales/zh-CN/workflows.json';
import costsZh from './locales/zh-CN/costs.json';
import accessZh from './locales/zh-CN/access.json';
import webhooksZh from './locales/zh-CN/webhooks.json';
import profileZh from './locales/zh-CN/profile.json';

import commonEn from './locales/en-US/common.json';
import navEn from './locales/en-US/nav.json';
import authEn from './locales/en-US/auth.json';
import dashboardEn from './locales/en-US/dashboard.json';
import agentsEn from './locales/en-US/agents.json';
import tasksEn from './locales/en-US/tasks.json';
import logsEn from './locales/en-US/logs.json';
import statusEn from './locales/en-US/status.json';
import validationEn from './locales/en-US/validation.json';
import workflowsEn from './locales/en-US/workflows.json';
import costsEn from './locales/en-US/costs.json';
import accessEn from './locales/en-US/access.json';
import webhooksEn from './locales/en-US/webhooks.json';
import profileEn from './locales/en-US/profile.json';

const resources = {
  'zh-CN': {
    common: commonZh,
    nav: navZh,
    auth: authZh,
    dashboard: dashboardZh,
    agents: agentsZh,
    tasks: tasksZh,
    logs: logsZh,
    status: statusZh,
    validation: validationZh,
    workflows: workflowsZh,
    costs: costsZh,
    access: accessZh,
    webhooks: webhooksZh,
    profile: profileZh,
  },
  'en-US': {
    common: commonEn,
    nav: navEn,
    auth: authEn,
    dashboard: dashboardEn,
    agents: agentsEn,
    tasks: tasksEn,
    logs: logsEn,
    status: statusEn,
    validation: validationEn,
    workflows: workflowsEn,
    costs: costsEn,
    access: accessEn,
    webhooks: webhooksEn,
    profile: profileEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    lng: 'zh-CN', // 默认语言，LanguageDetector 会自动覆盖 localStorage 中的值
    defaultNS: 'common',
    ns: ['common', 'nav', 'auth', 'dashboard', 'agents', 'tasks', 'logs', 'status', 'validation', 'workflows', 'costs', 'access', 'webhooks', 'profile'],
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
