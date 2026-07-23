import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { SettingSection } from './components/SettingSection';
import { useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';
import { config } from '../../config';
import {
  DEMO_PASSWORD,
  DEMO_VERIFICATION_CODE,
  useVerificationCountdown,
} from './useVerificationCountdown';
import classes from './ProfileLayout.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const { secondsLeft, active, start } = useVerificationCountdown();

  const [email, setEmail] = useState(profile.email);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSendCode() {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrors({ email: t('profile:email.addressRequired') });
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setErrors({ email: t('profile:email.addressInvalid') });
      return;
    }
    start();
    notifications.show({
      message: t('profile:email.codeSent'),
      color: 'blue',
      autoClose: 4000,
      withBorder: true,
    });
  }

  function validate() {
    const next: Record<string, string | undefined> = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = t('profile:email.addressRequired');
    else if (!EMAIL_PATTERN.test(trimmed)) next.email = t('profile:email.addressInvalid');
    if (!code.trim()) next.code = t('profile:email.codeRequired');
    else if (code.trim() !== DEMO_VERIFICATION_CODE) next.code = t('profile:email.codeRequired');
    if (!password.trim()) next.password = t('profile:email.verifyPasswordRequired');
    else if (password !== DEMO_PASSWORD) next.password = t('profile:password.wrongCurrent');
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  function handleSubmit() {
    if (!validate()) return;
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setConfirmOpen(false);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({ email: email.trim() });
    setSaving(false);

    notifications.show({
      title: t('profile:email.title'),
      message: t('profile:email.changeSuccess'),
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
      withBorder: true,
    });

    logout();
    navigate(config.auth.loginPath, { replace: true });
  }

  return (
    <>
      <SettingSection
        title={t('profile:email.title')}
        description={t('profile:email.description')}
      />

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:email.address')}</div>
        <TextInput
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          type="email"
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:email.code')}</div>
        <div className={classes.formInlineRow}>
          <TextInput
            className={classes.formInlineField}
            value={code}
            onChange={(e) => {
              setCode(e.currentTarget.value);
              setErrors((prev) => ({ ...prev, code: undefined }));
            }}
            error={errors.code}
          />
          <Button variant="light" disabled={active} onClick={handleSendCode}>
            {active ? t('profile:email.resendCode', { seconds: secondsLeft }) : t('profile:email.sendCode')}
          </Button>
        </div>
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:email.verifyPassword')}</div>
        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />
      </div>

      <div className={classes.formActions}>
        <Button variant="default" onClick={() => { setEmail(profile.email); setCode(''); setPassword(''); }}>
          {t('common:actions.cancel')}
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          {t('common:actions.save')}
        </Button>
      </div>

      <ConfirmModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('profile:email.changeTitle')}
        message={t('profile:email.changeMessage')}
        confirmLabel={t('common:actions.confirm')}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
