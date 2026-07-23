import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PasswordInput, Select, TextInput } from '@mantine/core';
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

const COUNTRY_CODES = [
  { value: '+86', label: '+86 中国' },
  { value: '+1', label: '+1 US' },
  { value: '+44', label: '+44 UK' },
  { value: '+81', label: '+81 日本' },
];

const PHONE_PATTERN = /^\d{7,15}$/;

export function PhoneSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const { secondsLeft, active, start } = useVerificationCountdown();

  const [countryCode, setCountryCode] = useState(profile.countryCode);
  const [phone, setPhone] = useState(profile.phone);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSendCode() {
    const trimmed = phone.trim();
    if (!trimmed) {
      setErrors({ phone: t('profile:phone.numberRequired') });
      return;
    }
    if (!PHONE_PATTERN.test(trimmed)) {
      setErrors({ phone: t('profile:phone.numberInvalid') });
      return;
    }
    start();
    notifications.show({
      message: t('profile:phone.codeSent'),
      color: 'blue',
      autoClose: 4000,
      withBorder: true,
    });
  }

  function validate() {
    const next: Record<string, string | undefined> = {};
    const trimmed = phone.trim();
    if (!trimmed) next.phone = t('profile:phone.numberRequired');
    else if (!PHONE_PATTERN.test(trimmed)) next.phone = t('profile:phone.numberInvalid');
    if (!code.trim()) next.code = t('profile:phone.codeRequired');
    else if (code.trim() !== DEMO_VERIFICATION_CODE) next.code = t('profile:phone.codeRequired');
    if (!password.trim()) next.password = t('profile:phone.verifyPasswordRequired');
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
    updateProfile({ phone: phone.trim(), countryCode });
    setSaving(false);

    notifications.show({
      title: t('profile:phone.title'),
      message: t('profile:phone.changeSuccess'),
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
        title={t('profile:phone.title')}
        description={t('profile:phone.description')}
      />

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:phone.countryCode')}</div>
        <Select
          data={COUNTRY_CODES}
          value={countryCode}
          onChange={(v) => setCountryCode(v ?? '+86')}
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:phone.number')}</div>
        <TextInput
          value={phone}
          onChange={(e) => {
            setPhone(e.currentTarget.value);
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          error={errors.phone}
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:phone.code')}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <TextInput
            style={{ flex: 1 }}
            value={code}
            onChange={(e) => {
              setCode(e.currentTarget.value);
              setErrors((prev) => ({ ...prev, code: undefined }));
            }}
            error={errors.code}
          />
          <Button variant="light" disabled={active} onClick={handleSendCode}>
            {active ? t('profile:phone.resendCode', { seconds: secondsLeft }) : t('profile:phone.sendCode')}
          </Button>
        </div>
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:phone.verifyPassword')}</div>
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
        <Button
          variant="default"
          onClick={() => {
            setCountryCode(profile.countryCode);
            setPhone(profile.phone);
            setCode('');
            setPassword('');
          }}
        >
          {t('common:actions.cancel')}
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          {t('common:actions.save')}
        </Button>
      </div>

      <ConfirmModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('profile:phone.changeTitle')}
        message={t('profile:phone.changeMessage')}
        confirmLabel={t('common:actions.confirm')}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
