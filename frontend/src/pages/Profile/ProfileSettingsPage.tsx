import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconUpload } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { SettingSection } from './components/SettingSection';
import { getProfileInitials, useProfileStore } from '../../stores/profileStore';
import classes from './ProfileLayout.module.css';

const USERNAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { profile, updateProfile, setAvatar } = useProfileStore();
  const [username, setUsername] = useState(profile.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAvatarRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setUsername(profile.username);
  }, [profile.username]);

  function validateUsername(value: string): string | null {
    if (!value.trim()) return t('profile:profile.usernameRequired');
    if (!USERNAME_PATTERN.test(value.trim())) return t('profile:profile.usernameFormat');
    return null;
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      pendingAvatarRef.current = dataUrl;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function saveProfile(forceUsernameChange = false) {
    const trimmed = username.trim();
    const error = validateUsername(trimmed);
    if (error) {
      setUsernameError(error);
      return;
    }

    const usernameChanged = trimmed !== profile.username;
    const avatarChanged = pendingAvatarRef.current !== undefined;

    if (!usernameChanged && !avatarChanged) return;

    if (usernameChanged && !forceUsernameChange) {
      setConfirmOpen(true);
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    updateProfile({
      username: trimmed,
      ...(avatarChanged ? { avatarUrl: pendingAvatarRef.current } : {}),
    });
    pendingAvatarRef.current = undefined;
    setSaving(false);

    notifications.show({
      title: t('profile:profile.title'),
      message: t('profile:profile.saveSuccess'),
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
      withBorder: true,
    });
  }

  function handleConfirmUsernameChange() {
    setConfirmOpen(false);
    void saveProfile(true);
  }

  const initials = getProfileInitials(profile.username);

  return (
    <>
      <SettingSection
        title={t('profile:profile.title')}
        description={t('profile:profile.description')}
      />

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:profile.accountId')}</div>
        <div>
          <TextInput value={profile.id} disabled />
          <p className={classes.formHint}>{t('profile:profile.accountIdHint')}</p>
        </div>
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:profile.username')}</div>
        <TextInput
          value={username}
          onChange={(e) => {
            setUsername(e.currentTarget.value);
            setUsernameError(null);
          }}
          error={usernameError}
        />
      </div>

      <div className={classes.formRow}>
        <div className={classes.formLabel}>{t('profile:profile.avatar')}</div>
        <div className={classes.avatarUpload}>
          <div className={classes.avatarPreview}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} />
            ) : (
              initials
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <Button
              variant="light"
              leftSection={<IconUpload size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('profile:profile.uploadAvatar')}
            </Button>
          </div>
        </div>
      </div>

      <div className={classes.formActions}>
        <Button variant="default" onClick={() => setUsername(profile.username)}>
          {t('common:actions.cancel')}
        </Button>
        <Button loading={saving} onClick={() => void saveProfile()}>
          {t('common:actions.save')}
        </Button>
      </div>

      <ConfirmModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('profile:profile.usernameChangeTitle')}
        message={t('profile:profile.usernameChangeMessage')}
        confirmLabel={t('common:actions.confirm')}
        onConfirm={handleConfirmUsernameChange}
      />
    </>
  );
}
