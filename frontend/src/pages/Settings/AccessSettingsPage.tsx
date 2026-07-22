import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, Select as MantineSelect, Badge, CopyButton, ActionIcon, Text, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck, IconKey, IconUsers, IconHistory } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { AppModal } from '../../components/shared/AppModal/AppModal';
import { AppTabs } from '../../components/shared/AppTabs/AppTabs';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import {
  fetchUsers,
  updateUserRole,
  removeUser,
  inviteUser,
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
  fetchAuditLogs,
} from '../../services/access';
import type { User, UserRole, ApiKey } from '../../types';
import classes from './AccessSettings.module.css';

const ROLE_VALUES: UserRole[] = ['admin', 'member', 'viewer'];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'red',
  member: 'blue',
  viewer: 'gray',
};

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatLastUsed(iso: string | undefined, t: (key: string, opts?: Record<string, unknown>) => string, locale: string): string {
  if (!iso) return t('access:apiKeys.never');
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return t('access:apiKeys.today');
  if (diffDays === 1) return t('access:apiKeys.yesterday');
  if (diffDays < 7) return t('access:apiKeys.daysAgo', { count: diffDays });
  return formatDate(iso, locale);
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return <span className={classes.avatar}>{initials}</span>;
}

export function AccessSettingsPage() {
  const { t, i18n } = useTranslation();

  const { data: users, isLoading: usersLoading } = useApiQuery(queryKeys.users.list(), fetchUsers);
  const { data: apiKeys, isLoading: keysLoading } = useApiQuery(queryKeys.apiKeys.list(), fetchApiKeys);
  const { data: auditLogs, isLoading: auditLoading } = useApiQuery(queryKeys.audit.list(), fetchAuditLogs);

  const roleMutation = useApiMutation(queryKeys.users.all, (vars: { id: string; role: string }) =>
    updateUserRole(vars.id, vars.role),
  );
  const removeUserMutation = useApiMutation(queryKeys.users.all, (id: string) => removeUser(id));
  const inviteMutation = useApiMutation(queryKeys.users.all, (vars: { email: string; role: UserRole }) =>
    inviteUser(vars.email, vars.role),
  );
  const createKeyMutation = useApiMutation(queryKeys.apiKeys.all, (name: string) => createApiKey(name));
  const revokeKeyMutation = useApiMutation(queryKeys.apiKeys.all, (id: string) => revokeApiKey(id));

  // ── Local state ──
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{ user: User } | null>(null);
  const [removeModal, setRemoveModal] = useState<{ user: User } | null>(null);
  const [revokeModal, setRevokeModal] = useState<{ key: ApiKey } | null>(null);

  function handleInviteUser() {
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole }, {
      onSuccess: () => {
        setInviteModalOpen(false);
        setInviteEmail('');
        setInviteRole('member');
        notifications.show({ message: t('access:users.invite.successMsg', { email: inviteEmail.trim() }), color: 'green' });
      },
    });
  }

  function handleCreateKey() {
    if (!newKeyName.trim()) return;
    createKeyMutation.mutate(newKeyName.trim(), {
      onSuccess: (result) => {
        setGeneratedKey(result.rawKey);
        setNewKeyName('');
        notifications.show({ message: t('access:apiKeys.create.successMsg'), color: 'green' });
      },
    });
  }

  function handleRoleChange(userId: string, newRole: UserRole) {
    roleMutation.mutate({ id: userId, role: newRole }, {
      onSuccess: () => {
        setRoleModal(null);
        notifications.show({ message: t('access:users.roleChanged'), color: 'green' });
      },
    });
  }

  function handleRemoveUser(userId: string) {
    removeUserMutation.mutate(userId, {
      onSuccess: () => {
        setRemoveModal(null);
        notifications.show({ message: t('access:users.userRemoved'), color: 'green' });
      },
    });
  }

  function handleRevokeKey(keyId: string) {
    revokeKeyMutation.mutate(keyId, {
      onSuccess: () => {
        setRevokeModal(null);
        notifications.show({ message: t('access:apiKeys.revoked'), color: 'green' });
      },
    });
  }

  if (usersLoading || keysLoading) {
    return <Center h={400}><Loader /></Center>;
  }

  const userList = users ?? [];
  const keyList = apiKeys ?? [];

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('access:title')}</h1>
      </div>

      <AppTabs defaultValue="users">
          <AppTabs.List>
            <AppTabs.Tab value="users" leftSection={<IconUsers size={14} />}>{t('access:users.title')}</AppTabs.Tab>
            <AppTabs.Tab value="apiKeys" leftSection={<IconKey size={14} />}>{t('access:apiKeys.title')}</AppTabs.Tab>
            <AppTabs.Tab value="audit" leftSection={<IconHistory size={14} />}>{t('access:auditLog.title')}</AppTabs.Tab>
          </AppTabs.List>

        {/* ── Users Tab ── */}
        <AppTabs.Panel value="users">
          <div className={classes.tabContent}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>{t('access:users.title')}</span>
              <Button variant="filled" size="compact-sm" leftSection={<span>+</span>} onClick={() => setInviteModalOpen(true)}>
                {t('access:users.inviteBtn')}
              </Button>
            </div>
            <div className={classes.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>{t('access:users.columns.name')}</th>
                    <th>{t('access:users.columns.email')}</th>
                    <th>{t('access:users.columns.role')}</th>
                    <th>{t('access:users.columns.joinedAt')}</th>
                    <th>{t('access:users.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={classes.userCell}>
                          <Avatar name={user.name} />
                          <span className={classes.userName}>{user.name}</span>
                        </div>
                      </td>
                      <td className={classes.monoCell}>{user.email}</td>
                      <td>
                        <Badge variant="light" color={ROLE_COLORS[user.role]} size="sm">
                          {t(`access:users.roles.${user.role}`)}
                        </Badge>
                      </td>
                      <td className={classes.dateCell}>2026-07-10</td>
                      <td>
                        <div className={classes.actionBtns}>
                          <Button variant="subtle" size="compact-xs" onClick={() => setRoleModal({ user })}>
                            {t('access:users.changeRole')}
                          </Button>
                          <Button variant="subtle" size="compact-xs" color="red" onClick={() => setRemoveModal({ user })}>
                            {t('access:users.removeUser')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AppTabs.Panel>

        {/* ── API Keys Tab ── */}
        <AppTabs.Panel value="apiKeys">
          <div className={classes.tabContent}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>{t('access:apiKeys.title')}</span>
              <Button
                variant="filled"
                size="compact-sm"
                leftSection={<span>+</span>}
                onClick={() => { setGeneratedKey(null); setCreateModalOpen(true); }}
              >
                {t('access:apiKeys.createBtn')}
              </Button>
            </div>
            <div className={classes.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>{t('access:apiKeys.columns.name')}</th>
                    <th>{t('access:apiKeys.columns.prefix')}</th>
                    <th>{t('access:apiKeys.columns.createdAt')}</th>
                    <th>{t('access:apiKeys.columns.lastUsed')}</th>
                    <th>{t('access:apiKeys.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {keyList.map((key) => (
                    <tr key={key.id}>
                      <td className={classes.nameCell}>{key.name}</td>
                      <td className={classes.monoCell}>{key.prefix}</td>
                      <td className={classes.dateCell}>{formatDate(key.createdAt, i18n.language)}</td>
                      <td className={classes.dateCell}>{formatLastUsed(key.lastUsedAt, t, i18n.language)}</td>
                      <td>
                        <Button variant="subtle" size="compact-xs" color="red" onClick={() => setRevokeModal({ key })}>
                          {t('access:apiKeys.revoke')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {keyList.length === 0 && (
                    <tr><td colSpan={5} className={classes.emptyCell}>{t('common:empty.noResults')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AppTabs.Panel>

        {/* ── Audit Log Tab ── */}
        <AppTabs.Panel value="audit">
          <div className={classes.tabContent}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>{t('access:auditLog.title')}</span>
            </div>
            <div className={classes.tableWrap}>
              {auditLoading ? (
                <Center py="xl"><Loader size="sm" /></Center>
              ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t('access:auditLog.columns.timestamp')}</th>
                    <th>{t('access:auditLog.columns.user')}</th>
                    <th>{t('access:auditLog.columns.action')}</th>
                    <th>{t('access:auditLog.columns.resource')}</th>
                    <th>{t('access:auditLog.columns.detail')}</th>
                    <th>{t('access:auditLog.columns.ip')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditLogs ?? []).map((entry) => (
                    <tr key={entry.id}>
                      <td className={classes.monoCell}>{entry.timestamp}</td>
                      <td className={classes.nameCell}>{entry.user}</td>
                      <td>
                        <Badge variant="light" color="gray" size="sm">
                          {t(`access:auditLog.actions.${entry.action}`, entry.action)}
                        </Badge>
                      </td>
                      <td className={classes.monoCell}>{entry.resource}</td>
                      <td className={classes.detailCell}>{entry.detail}</td>
                      <td className={classes.monoCell}>{entry.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </AppTabs.Panel>
      </AppTabs>

      {/* ── Invite User Modal ── */}
      <AppModal
        opened={inviteModalOpen}
        onClose={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteRole('member'); }}
        title={t('access:users.invite.title')}
        footer={
          <>
            <Button variant="default" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteRole('member'); }}>
              {t('common:actions.cancel')}
            </Button>
            <Button onClick={handleInviteUser} disabled={!inviteEmail.trim()} loading={inviteMutation.isPending}>
              {t('access:users.invite.submitBtn')}
            </Button>
          </>
        }
      >
        <TextInput
          label={t('access:users.invite.emailLabel')}
          placeholder={t('access:users.invite.emailPlaceholder')}
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.currentTarget.value)}
          data-autofocus
        />
        <MantineSelect
          label={t('access:users.invite.roleLabel')}
          data={ROLE_VALUES.map((value) => ({ value, label: t(`access:users.roles.${value}`) }))}
          value={inviteRole}
          onChange={(v) => v && setInviteRole(v as UserRole)}
          mt="md"
        />
      </AppModal>

      {/* ── Create API Key Modal ── */}
      <AppModal
        opened={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); }}
        title={t('access:apiKeys.create.title')}
        footer={
          generatedKey ? (
            <Button onClick={() => { setCreateModalOpen(false); setGeneratedKey(null); }}>
              {t('common:actions.confirm')}
            </Button>
          ) : (
            <>
              <Button variant="default" onClick={() => { setCreateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); }}>
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleCreateKey} disabled={!newKeyName.trim()} loading={createKeyMutation.isPending}>
                {t('access:apiKeys.create.submitBtn')}
              </Button>
            </>
          )
        }
      >
        {generatedKey ? (
          <div>
            <div className={classes.keyWarning}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>{t('access:apiKeys.create.copyWarning')}</span>
            </div>
            <div className={classes.keyDisplay}>
              <code className={classes.keyCode}>{generatedKey}</code>
              <CopyButton value={generatedKey}>
                {({ copied, copy }) => (
                  <ActionIcon color={copied ? 'green' : 'gray'} variant="light" onClick={copy} className={classes.copyBtn}>
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                )}
              </CopyButton>
            </div>
            <Text size="xs" c="green">{t('access:apiKeys.create.copied')}</Text>
          </div>
        ) : (
          <div>
            <Text size="sm" c="dimmed" mb="lg">{t('access:apiKeys.create.nameLabel')} — {t('access:apiKeys.create.namePlaceholder')}</Text>
            <TextInput
              label={t('access:apiKeys.create.nameLabel')}
              placeholder={t('access:apiKeys.create.namePlaceholder')}
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.currentTarget.value)}
              data-autofocus
            />
          </div>
        )}
      </AppModal>

      {/* ── Change Role Modal ── */}
      <AppModal opened={roleModal !== null} onClose={() => setRoleModal(null)} title={t('access:users.changeRole')}>
        {roleModal && (
          <div>
            <div className={classes.roleTarget}>
              <Avatar name={roleModal.user.name} />
              <div>
                <div className={classes.roleTargetName}>{roleModal.user.name}</div>
                <div className={classes.roleTargetEmail}>{roleModal.user.email}</div>
              </div>
              <Badge variant="light" color={ROLE_COLORS[roleModal.user.role]} size="sm" className={classes.roleTargetBadge}>
                {t(`access:users.roles.${roleModal.user.role}`)}
              </Badge>
            </div>
            <MantineSelect
              label={t('access:users.columns.role')}
              description={t(`access:users.roleDesc.${roleModal.user.role}`)}
              data={ROLE_VALUES.map((value) => ({ value, label: t(`access:users.roles.${value}`) }))}
              value={roleModal.user.role}
              onChange={(v) => v && handleRoleChange(roleModal.user.id, v as UserRole)}
              mt="md"
            />
          </div>
        )}
      </AppModal>

      {/* ── Remove User Modal ── */}
      <ConfirmModal
        opened={removeModal !== null}
        onClose={() => setRemoveModal(null)}
        title={t('access:users.removeUser')}
        message={t('access:users.removeConfirm', { name: removeModal?.user.name ?? '' })}
        target={removeModal ? { label: removeModal.user.name } : undefined}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
        confirmLoading={removeUserMutation.isPending}
        onConfirm={() => removeModal && handleRemoveUser(removeModal.user.id)}
      />

      {/* ── Revoke Key Modal ── */}
      <ConfirmModal
        opened={revokeModal !== null}
        onClose={() => setRevokeModal(null)}
        title={t('access:apiKeys.revoke')}
        message={t('access:apiKeys.revokeConfirm', { name: revokeModal?.key.name ?? '' })}
        target={revokeModal ? { icon: <IconKey size={14} />, label: revokeModal.key.name, detail: revokeModal.key.prefix } : undefined}
        confirmLabel={t('access:apiKeys.revoke')}
        cancelLabel={t('common:actions.cancel')}
        confirmLoading={revokeKeyMutation.isPending}
        onConfirm={() => revokeModal && handleRevokeKey(revokeModal.key.id)}
      />
    </>
  );
}
