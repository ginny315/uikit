import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import classes from './LoginPage.module.css';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const {
    isAuthenticated,
    isLoading: authLoading,
    login,
    loginError,
    clearError,
  } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // 已登录 → 首页
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return null;
  }

  function validate(): boolean {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = t('auth:errors.usernameRequired');
    }
    if (!password) {
      errors.password = t('auth:errors.passwordRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    setIsSubmitting(true);
    const success = await login(username.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (success) {
      navigate('/', { replace: true });
    }
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
    if (loginError) clearError();
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
    if (loginError) clearError();
  }

  const globalError = loginError || fieldErrors.username || fieldErrors.password;

  return (
    <div className={classes.wrapper}>
      {/* 背景装饰 — 大圆光晕，与 dashboard 浅色体系一致 */}
      <div className={classes.bgShape1} />
      <div className={classes.bgShape2} />
      <div className={classes.bgGrid} />

      {/* 卡片 */}
      <div className={classes.card}>
        {/* 品牌区 */}
        <div className={classes.brand}>
          <div className={classes.brandIconWrap}>
            <IconSparkles />
          </div>
          <h1 className={classes.brandName}>
            <span className={classes.brandNameAccent}>Agent</span>Sys
          </h1>
          <p className={classes.brandTagline}>{t('auth:brandTagline')}</p>
        </div>

        {/* 登录表单 */}
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <div className={classes.fieldGroup}>
            {/* 用户名 */}
            <div className={classes.inputWrapper}>
              <span className={classes.inputIcon}>
                <IconUser size={18} />
              </span>
              <input
                ref={usernameRef}
                className={`${classes.inputField} ${fieldErrors.username ? classes.inputFieldError : ''}`}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder={t('auth:usernamePlaceholder')}
                autoComplete="username"
                aria-label={t('auth:username')}
                aria-invalid={!!fieldErrors.username}
                disabled={isSubmitting}
              />
            </div>

            {/* 密码 */}
            <div className={classes.inputWrapper}>
              <span className={classes.inputIcon}>
                <IconLock size={18} />
              </span>
              <input
                className={`${classes.inputField} ${fieldErrors.password ? classes.inputFieldError : ''}`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder={t('auth:passwordPlaceholder')}
                autoComplete="current-password"
                aria-label={t('auth:password')}
                aria-invalid={!!fieldErrors.password}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={classes.pwToggle}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          {/* 保持登录 + 错误 */}
          <div className={classes.formFooter}>
            <label className={classes.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />
              <span className={classes.checkbox}>
                <IconCheck size={12} />
              </span>
              <span className={classes.rememberMeLabel}>{t('auth:rememberMe')}</span>
            </label>

            {globalError && (
              <span className={classes.errorMsg} key={globalError}>
                {t(globalError)}
              </span>
            )}
          </div>

          {/* 登录按钮 */}
          <button type="submit" className={classes.submitBtn} disabled={isSubmitting}>
            {isSubmitting && <span className={classes.spinner} />}
            {isSubmitting ? t('auth:signingIn') : t('auth:signInButton')}
          </button>
        </form>

        {/* 底部 */}
        <div className={classes.footer}>
          <span className={classes.footerText}>AGENTSYS · V0.1.0</span>
        </div>
      </div>
    </div>
  );
}
