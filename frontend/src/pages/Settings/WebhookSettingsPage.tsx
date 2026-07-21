import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextInput,
  Switch,
  Badge,
  MultiSelect,
  Loader,
  Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconWebhook, IconTrash, IconPlayerPlay, IconPencil } from '@tabler/icons-react';
import { AppModal } from '../../components/shared/AppModal/AppModal';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import {
  fetchWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from '../../services/webhooks';
import type { Webhook, WebhookEvent } from '../../types';
import classes from './WebhookSettings.module.css';

const ALL_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'task.completed', label: '' },
  { value: 'task.failed', label: '' },
  { value: 'agent.started', label: '' },
  { value: 'agent.stopped', label: '' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function WebhookSettingsPage() {
  const { t } = useTranslation();

  // ── Data fetching ──
  const { data: webhooks, isLoading } = useApiQuery(queryKeys.webhooks.list(), fetchWebhooks);

  const createMutation = useApiMutation(queryKeys.webhooks.all, (vars: { url: string; events: WebhookEvent[]; secret?: string }) =>
    createWebhook(vars),
  );
  const updateMutation = useApiMutation(queryKeys.webhooks.all, (vars: { id: string; data: Partial<Webhook> }) =>
    updateWebhook(vars.id, vars.data),
  );
  const deleteMutation = useApiMutation(queryKeys.webhooks.all, (id: string) => deleteWebhook(id));
  const testMutation = useApiMutation(queryKeys.webhooks.all, (id: string) => testWebhook(id));

  // ── Local state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>([]);
  const [formSecret, setFormSecret] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const EVENT_OPTIONS = ALL_EVENTS.map((e) => ({
    value: e.value,
    label: t(`webhooks:events.${e.value}`),
  }));

  function openCreate() {
    setEditing(null);
    setFormUrl('');
    setFormEvents([]);
    setFormSecret('');
    setModalOpen(true);
  }

  function openEdit(wh: Webhook) {
    setEditing(wh);
    setFormUrl(wh.url);
    setFormEvents([...wh.events]);
    setFormSecret(wh.secret ?? '');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formUrl.trim() || formEvents.length === 0) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { url: formUrl.trim(), events: formEvents, secret: formSecret || undefined } },
        {
          onSuccess: () => {
            notifications.show({ message: t('webhooks:edit.savedMsg'), color: 'green' });
            setModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(
        { url: formUrl.trim(), events: formEvents, secret: formSecret || undefined },
        {
          onSuccess: () => {
            notifications.show({ message: t('webhooks:create.successMsg'), color: 'green' });
            setModalOpen(false);
          },
        },
      );
    }
  }

  function handleToggle(whId: string, enabled: boolean) {
    updateMutation.mutate(
      { id: whId, data: { enabled } },
      {
        onSuccess: () => {
          notifications.show({
            message: enabled ? t('webhooks:list.toggleOn') : t('webhooks:list.toggleOff'),
            color: 'green',
          });
        },
      },
    );
  }

  function handleDelete(whId: string) {
    deleteMutation.mutate(whId, {
      onSuccess: () => {
        setDeleteTarget(null);
        notifications.show({ message: t('webhooks:delete.successMsg'), color: 'green' });
      },
    });
  }

  function handleTest(whId: string) {
    setTestingId(whId);
    testMutation.mutate(whId, {
      onSuccess: () => {
        setTestingId(null);
        notifications.show({ message: t('webhooks:test.successMsg'), color: 'green' });
      },
      onError: () => {
        setTestingId(null);
      },
    });
  }

  if (isLoading) {
    return <Center h={400}><Loader /></Center>;
  }

  const list = webhooks ?? [];
  const testing = testMutation.isPending ? testingId : null;

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('webhooks:title')}</h1>
        <Button variant="filled" size="compact-sm" leftSection={<span>+</span>} onClick={openCreate}>
          {t('webhooks:list.createBtn')}
        </Button>
      </div>

      <div className={classes.section}>
        <div className={classes.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t('webhooks:list.columns.url')}</th>
                <th>{t('webhooks:list.columns.events')}</th>
                <th>{t('webhooks:list.columns.status')}</th>
                <th>{t('webhooks:list.columns.createdAt')}</th>
                <th>{t('webhooks:list.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((wh) => (
                <tr key={wh.id}>
                  <td>
                    <div className={classes.urlCell}>
                      <IconWebhook size={14} className={classes.urlIcon} />
                      <span className={classes.urlText}>{wh.url}</span>
                    </div>
                  </td>
                  <td>
                    <div className={classes.eventsCell}>
                      {wh.events.map((ev) => (
                        <Badge key={ev} variant="light" color="blue" size="sm">
                          {t(`webhooks:events.${ev}`)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Switch
                      checked={wh.enabled}
                      onChange={(e) => handleToggle(wh.id, e.currentTarget.checked)}
                      size="sm"
                    />
                    <span className={`${classes.statusLabel} ${wh.enabled ? classes.enabledLabel : classes.disabledLabel}`}>
                      {wh.enabled ? t('webhooks:list.enabled') : t('webhooks:list.disabled')}
                    </span>
                  </td>
                  <td className={classes.dateCell}>{formatDate(wh.createdAt)}</td>
                  <td>
                    <div className={classes.actionBtns}>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconPlayerPlay size={12} />}
                        loading={testing === wh.id}
                        onClick={() => handleTest(wh.id)}
                      >
                        {t('webhooks:test.btn')}
                      </Button>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconPencil size={12} />}
                        onClick={() => openEdit(wh)}
                      >
                        {t('common:actions.edit')}
                      </Button>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => setDeleteTarget(wh)}
                      >
                        {t('common:actions.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className={classes.emptyCell}>{t('webhooks:list.empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('webhooks:edit.title') : t('webhooks:create.title')}
        size="480px"
        footer={
          <>
            <Button variant="default" onClick={() => setModalOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formUrl.trim() || formEvents.length === 0}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? t('webhooks:edit.saveBtn') : t('webhooks:create.submitBtn')}
            </Button>
          </>
        }
      >
        <TextInput
          label={t('webhooks:create.urlLabel')}
          placeholder={t('webhooks:create.urlPlaceholder')}
          description={t('webhooks:create.urlDesc')}
          value={formUrl}
          onChange={(e) => setFormUrl(e.currentTarget.value)}
          data-autofocus
          mb="md"
          required
        />
        <MultiSelect
          label={t('webhooks:create.eventsLabel')}
          description={t('webhooks:create.eventsDesc')}
          data={EVENT_OPTIONS}
          value={formEvents}
          onChange={(v) => setFormEvents(v as WebhookEvent[])}
          mb="md"
          required
          nothingFoundMessage={t('webhooks:create.noEventsFound')}
        />
        <TextInput
          label={t('webhooks:create.secretLabel')}
          placeholder={t('webhooks:create.secretPlaceholder')}
          description={t('webhooks:create.secretDesc')}
          value={formSecret}
          onChange={(e) => setFormSecret(e.currentTarget.value)}
        />
      </AppModal>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t('webhooks:delete.confirmTitle')}
        message={t('webhooks:delete.confirmMsg')}
        target={deleteTarget ? { icon: <IconWebhook size={14} />, label: deleteTarget.url } : undefined}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
        confirmLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </>
  );
}
