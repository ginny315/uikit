import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Modal,
  TextInput,
  Switch,
  Badge,
  MultiSelect,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconWebhook, IconTrash, IconPlayerPlay, IconPencil } from '@tabler/icons-react';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import type { Webhook, WebhookEvent } from '../../types';
import classes from './WebhookSettings.module.css';

// ── Mock Data ──

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'wh_1',
    url: 'https://hooks.slack.com/services/T01/ABC/xyz',
    events: ['task.completed', 'task.failed'],
    enabled: true,
    createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'wh_2',
    url: 'https://api.example.com/agent-events',
    events: ['agent.started', 'agent.stopped'],
    enabled: true,
    secret: 'whsec_abc123',
    createdAt: '2026-07-15T14:30:00Z',
  },
  {
    id: 'wh_3',
    url: 'https://myapp.com/webhooks/agent-sys',
    events: ['task.completed', 'task.failed', 'agent.started', 'agent.stopped'],
    enabled: false,
    createdAt: '2026-06-20T09:00:00Z',
  },
];

const ALL_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'task.completed', label: '' }, // label filled from i18n
  { value: 'task.failed', label: '' },
  { value: 'agent.started', label: '' },
  { value: 'agent.stopped', label: '' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function WebhookSettingsPage() {
  const { t } = useTranslation();

  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>([]);
  const [formSecret, setFormSecret] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);

  // Test state
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
      setWebhooks(webhooks.map((w) =>
        w.id === editing.id
          ? { ...w, url: formUrl.trim(), events: formEvents, secret: formSecret || undefined }
          : w
      ));
      notifications.show({ message: t('webhooks:edit.savedMsg'), color: 'green' });
    } else {
      const newWh: Webhook = {
        id: `wh_${Date.now()}`,
        url: formUrl.trim(),
        events: formEvents,
        enabled: true,
        secret: formSecret || undefined,
        createdAt: new Date().toISOString(),
      };
      setWebhooks([newWh, ...webhooks]);
      notifications.show({ message: t('webhooks:create.successMsg'), color: 'green' });
    }

    setModalOpen(false);
  }

  function handleToggle(whId: string, enabled: boolean) {
    setWebhooks(webhooks.map((w) => (w.id === whId ? { ...w, enabled } : w)));
    notifications.show({
      message: enabled ? t('webhooks:list.toggleOn') : t('webhooks:list.toggleOff'),
      color: 'green',
    });
  }

  function handleDelete(whId: string) {
    setWebhooks(webhooks.filter((w) => w.id !== whId));
    setDeleteTarget(null);
    notifications.show({ message: t('webhooks:delete.successMsg'), color: 'green' });
  }

  function handleTest(whId: string) {
    setTestingId(whId);
    // Simulate test request
    setTimeout(() => {
      setTestingId(null);
      notifications.show({ message: t('webhooks:test.successMsg'), color: 'green' });
    }, 1500);
  }

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
              {webhooks.map((wh) => (
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
                      thumbIcon={
                        wh.enabled ? undefined : undefined
                      }
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
                        loading={testingId === wh.id}
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
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={5} className={classes.emptyCell}>
                    {t('webhooks:list.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('webhooks:edit.title') : t('webhooks:create.title')}
        centered
        size="lg"
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
          mb="xl"
        />
        <Button fullWidth onClick={handleSave} disabled={!formUrl.trim() || formEvents.length === 0} size="md">
          {editing ? t('webhooks:edit.saveBtn') : t('webhooks:create.submitBtn')}
        </Button>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t('webhooks:delete.confirmTitle')}
        message={t('webhooks:delete.confirmMsg')}
        target={deleteTarget ? { icon: <IconWebhook size={14} />, label: deleteTarget.url } : undefined}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </>
  );
}
