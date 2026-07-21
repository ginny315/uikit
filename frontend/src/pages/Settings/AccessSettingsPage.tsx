import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Button, Modal, TextInput, Select as MantineSelect, Badge, CopyButton, ActionIcon, Text, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck, IconKey, IconUsers, IconHistory } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import {
  fetchUsers,
  updateUserRole,
  removeUser,
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
} from '../../services/access';
import type { User, UserRole, ApiKey } from '../../types';
import classes from './AccessSettings.module.css';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'member', label: '成员' },
  { value: 'viewer', label: '观察者' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'red',
  member: 'blue',
  viewer: 'gray',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatLastUsed(iso: string | undefined, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (!iso) return t('access:apiKeys.never');
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return t('access:apiKeys.today');
  if (diffDays === 1) return t('access:apiKeys.yesterday');
  if (diffDays < 7) return t('access:apiKeys.daysAgo', { count: diffDays });
  return formatDate(iso);
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return <span className={classes.avatar}>{initials}</span>;
}

// 本地审计日志 mock（未接入 MSW 端点）
const MOCK_AUDIT = [
  { id: 'a1', timestamp: '2026-07-21 10:32:15', user: 'Alice Chen', action: 'task_created', resource: 'task_7a3f2', detail: '提交代码审查任务', ip: '192.168.1.100' },
  { id: 'a2', timestamp: '2026-07-21 09:15:00', user: 'Bob Zhang', action: 'agent_created', resource: 'agent_5', detail: '创建 Agent: doc-writer', ip: '192.168.1.101' },
  { id: 'a3', timestamp: '2026-07-20 18:00:30', user: 'Alice Chen', action: 'api_key_created', resource: 'key_2', detail: '创建 API Key: Local Dev', ip: '192.168.1.100' },
  { id: 'a4', timestamp: '2026-07-20 16:45:00', user: 'Carol Li', action: 'role_changed', resource: 'user_u4', detail: 'David Wang: viewer → member', ip: '192.168.1.102' },
  { id: 'a5', timestamp: '2026-07-19 14:20:00', user: 'Alice Chen', action: 'webhook_created', resource: 'wh_1', detail: '创建 Webhook: Slack 通知', ip: '192.168.1.100' },
  { id: 'a6', timestamp: '2026-07-19 11:00:00', user: 'Bob Zhang', action: 'task_cancelled', resource: 'task_9d55c', detail: '取消长时间运行任务', ip: '192.168.1.101' },
  { id: 'a7', timestamp: '2026-07-18 09:30:00', user: 'Alice Chen', action: 'user_invited', resource: 'user_u5', detail: '邀请 Eve Liu 加入团队', ip: '192.168.1.100' },
  { id: 'a8', timestamp: '2026-07-17 15:10:00', user: 'Carol Li', action: 'api_key_revoked', resource: 'key_old', detail: '吊销旧 CI Key', ip: '192.168.1.102' },
];

export function AccessSettingsPage() {
  const { t } = useTranslation();

  // ── Data fetching ──
  const { data: users, isLoading: usersLoading } = useApiQuery(queryKeys.users.list(), fetchUsers);
  const { data: apiKeys, isLoading: keysLoading } = useApiQuery(queryKeys.users.list(), fetchApiKeys);

  const roleMutation = useApiMutation(queryKeys.users.list(), (vars: { id: string; role: string }) =>
    updateUserRole(vars.id, vars.role),
  );
  const removeUserMutation = useApiMutation(queryKeys.users.list(), (id: string) => removeUser(id));
  const createKeyMutation = useApiMutation(queryKeys.users.list(), (name: string) => createApiKey(name));
  const revokeKeyMutation = useApiMutation(queryKeys.users.list(), (id: string) => revokeApiKey(id));

  // ── Local state ──
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{ user: User } | null>(null);
  const [removeModal, setRemoveModal] = useState<{ user: User } | null>(null);
  const [revokeModal, setRevokeModal] = useState<{ key: ApiKey } | null>(null);

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

      <div className={classes.tabsCard}>
        <Tabs defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users" leftSection={<IconUsers size={14} />}>{t('access:users.title')}</Tabs.Tab>
            <Tabs.Tab value="apiKeys" leftSection={<IconKey size={14} />}>{t('access:apiKeys.title')}</Tabs.Tab>
            <Tabs.Tab value="audit" leftSection={<IconHistory size={14} />}>{t('access:auditLog.title')}</Tabs.Tab>
          </Tabs.List>

        {/* ── Users Tab ── */}
        <Tabs.Panel value="users">
          <div className={classes.tabContent}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>{t('access:users.title')}</span>
              <Button variant="filled" size="compact-sm" leftSection={<span>+</span>}>
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
        </Tabs.Panel>

        {/* ── API Keys Tab ── */}
        <Tabs.Panel value="apiKeys">
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
                      <td className={classes.dateCell}>{formatDate(key.createdAt)}</td>
                      <td className={classes.dateCell}>{formatLastUsed(key.lastUsedAt, t)}</td>
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
        </Tabs.Panel>

        {/* ── Audit Log Tab ── */}
        <Tabs.Panel value="audit">
          <div className={classes.tabContent}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>{t('access:auditLog.title')}</span>
            </div>
            <div className={classes.tableWrap}>
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
                  {MOCK_AUDIT.map((entry) => (
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
            </div>
          </div>
        </Tabs.Panel>
        </Tabs>
      </div>

      {/* ── Create API Key Modal ── */}
      <Modal
        opened={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setGeneratedKey(null); setNewKeyName(''); }}
        title={t('access:apiKeys.create.title')}
        centered
        size="md"
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
            <Text size="xs" c="green" mt="xs">{t('access:apiKeys.create.copied')}</Text>
            <Button fullWidth mt="lg" onClick={() => { setCreateModalOpen(false); setGeneratedKey(null); }}>
              {t('common:actions.confirm')}
            </Button>
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
            <Button fullWidth mt="lg" onClick={handleCreateKey} disabled={!newKeyName.trim()} loading={createKeyMutation.isPending}>
              {t('access:apiKeys.create.submitBtn')}
            </Button>
          </div>
        )}
      </Modal>

      {/* ── Change Role Modal ── */}
      <Modal opened={roleModal !== null} onClose={() => setRoleModal(null)} title={t('access:users.changeRole')} centered>
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
              data={ROLE_OPTIONS.map((r) => ({ value: r.value, label: t(`access:users.roles.${r.value}`) }))}
              value={roleModal.user.role}
              onChange={(v) => v && handleRoleChange(roleModal.user.id, v as UserRole)}
              mt="md"
            />
          </div>
        )}
      </Modal>

      {/* ── Remove User Modal ── */}
      <ConfirmModal
        opened={removeModal !== null}
        onClose={() => setRemoveModal(null)}
        title={t('access:users.removeUser')}
        message={t('access:users.removeConfirm', { name: removeModal?.user.name ?? '' })}
        target={removeModal ? { label: removeModal.user.name } : undefined}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
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
        onConfirm={() => revokeModal && handleRevokeKey(revokeModal.key.id)}
      />
    </>
  );
}
