/**
 * MSW Browser Worker Setup
 * Session 9: 在浏览器环境中启动 MSW 拦截请求。
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
