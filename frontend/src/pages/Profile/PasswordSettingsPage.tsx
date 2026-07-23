import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PasswordInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { SettingSection } from './components/SettingSection';
import { useAuthStore } from '../../stores/authStore';
import { config } from '../../config';
import classes from './ProfileLayout.module.css';

const MOCK_CURRENT_PASSWORD = 'admin123';
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,14}$/;

interface FormState {
  current: string;
  newPassword: string;
  confirm: string;
}

interface FormErrors {
  current?: string;
  newPassword?: string;
  confirm?: string;
}

export function PasswordSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [form, setForm] = useState<FormState>({ current: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.current.trim()) next.current = t('profile:password.currentRequired');
    else if (form.current !== MOCK_CURRENT_PASSWORD) next.current = t('profile:password.wrongCurrent');

    if (!form.newPassword.trim()) next.newPassword = t('profile:password.newRequired');
    else if (!PASSWORD_PATTERN.test(form.newPassword)) next.newPassword = t('profile:password.invalidFormat');
    else if (form.newPassword === form.current) next.newPassword = t('profile:password.sameAsOld');

    if (!form.confirm.trim()) next.confirm = t('profile:password.confirmRequired');
    else if (form.confirm !== form.newPassword) next.confirm = t('profile:password.mismatch');

    return next;
  }

  function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setConfirmOpen(false);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setForm({ current: '', newPassword: '', confirm: '' });

    notifications.show({
      title: t('profile:password.title'),
      message: t('profile:password.changeSuccess'),
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
      withBorder: true,
    });

    logout();
    navigate(config.auth.loginPath, { replace: true });
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <>
      <SettingSection
        title={t('profile:password.title')}
        description={t('profile:password.description')}
      />

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:password.current')}</div>
        <PasswordInput
          value={form.current}
          onChange={(e) => updateField('current', e.currentTarget.value)}
          error={errors.current}
          autoComplete="current-password"
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:password.new')}</div>
        <PasswordInput
          value={form.newPassword}
          onChange={(e) => updateField('newPassword', e.currentTarget.value)}
          error={errors.newPassword}
          autoComplete="new-password"
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:password.confirm')}</div>
        <PasswordInput
          value={form.confirm}
          onChange={(e) => updateField('confirm', e.currentTarget.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />
      </div>

      <div className={classes.formActions}>
        <Button variant="default" onClick={() => setForm({ current: '', newPassword: '', confirm: '' })}>
          {t('common:actions.cancel')}
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          {t('common:actions.save')}
        </Button>
      </div>

      <ConfirmModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('profile:password.changeTitle')}
        message={t('profile:password.changeMessage')}
        confirmLabel={t('common:actions.confirm')}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
