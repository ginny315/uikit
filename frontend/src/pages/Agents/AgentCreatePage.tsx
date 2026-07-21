import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, TextInput, Textarea, Select, NumberInput, MultiSelect, Text, Center, Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { PageHeader } from '../../components/shared/PageHeader/PageHeader';
import type { BreadcrumbItem } from '../../components/shared/PageHeader/PageHeader';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchAgent, createAgent, updateAgent } from '../../services/agents';
import classes from './AgentCreate.module.css';

const TOOL_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'slack', label: 'Slack' },
  { value: 'notion', label: 'Notion' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'clickhouse', label: 'ClickHouse' },
  { value: 'redis', label: 'Redis' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubectl', label: 'Kubernetes' },
  { value: 'snyk', label: 'Snyk' },
  { value: 'trivy', label: 'Trivy' },
  { value: 'jest', label: 'Jest' },
  { value: 'pytest', label: 'Pytest' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'outlook', label: 'Outlook' },
  { value: 'pagerduty', label: 'PagerDuty' },
];

const MODEL_OPTIONS: Record<string, string[]> = {
  anthropic: ['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Haiku 4.5'],
  openai: ['GPT-4o', 'GPT-4o-mini', 'GPT-4.1'],
  ollama: ['llama3.1:8b', 'llama3.1:70b', 'mistral:7b', 'qwen2:7b'],
  vllm: ['llama3.1:8b', 'llama3.1:70b', 'mixtral:8x7b'],
};

function normalizeProvider(provider: string): string {
  const lower = provider.toLowerCase();
  if (lower.includes('anthropic')) return 'anthropic';
  if (lower.includes('openai')) return 'openai';
  if (lower.includes('ollama')) return 'ollama';
  if (lower.includes('vllm')) return 'vllm';
  return 'anthropic';
}

export function AgentCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [triedSubmit, setTriedSubmit] = useState(false);

  const { data: existingAgent, isLoading: agentLoading } = useApiQuery(
    queryKeys.agents.detail(editId ?? ''),
    () => fetchAgent(editId!),
    { enabled: isEditMode },
  );

  const PROVIDER_OPTIONS = [
    { value: 'anthropic', label: t('agents:create.providerOptions.anthropic') },
    { value: 'openai', label: t('agents:create.providerOptions.openai') },
    { value: 'ollama', label: t('agents:create.providerOptions.ollama') },
    { value: 'vllm', label: t('agents:create.providerOptions.vllm') },
  ];

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      provider: 'anthropic',
      model: '',
      tools: [] as string[],
      dailyTokenQuota: 500000,
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return t('validation:nameRequired');
        if (!isEditMode && value.trim().length < 2) return t('validation:nameMinLength');
        if (!isEditMode && !/^[a-zA-Z0-9_-]+$/.test(value.trim())) return t('validation:nameFormat');
        return null;
      },
      description: (value) => {
        if (!value.trim()) return t('validation:descriptionRequired');
        if (value.trim().length < 10) return t('validation:descriptionMinLength');
        return null;
      },
      model: (value) => (!value ? t('validation:modelRequired') : null),
      dailyTokenQuota: (value) => {
        if (value < 1000) return t('validation:quotaMin', { min: '1,000' });
        if (value > 10_000_000) return t('validation:quotaMax', { max: '10,000,000' });
        return null;
      },
    },
    transformValues: (values) => ({
      ...values,
      name: values.name.trim().toLowerCase(),
    }),
  });

  useEffect(() => {
    if (!existingAgent) return;
    form.setValues({
      name: existingAgent.name,
      description: existingAgent.description,
      provider: normalizeProvider(existingAgent.llmProvider),
      model: existingAgent.llmModel,
      tools: existingAgent.tools,
      dailyTokenQuota: existingAgent.dailyTokenQuota,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在加载 agent 时预填一次
  }, [existingAgent]);

  const selectedProvider = form.values.provider;
  const pageTitle = isEditMode ? t('agents:edit.title') : t('agents:create.title');
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav:pageTitles./agents'), path: '/agents' },
    ...(isEditMode && existingAgent
      ? [{ label: existingAgent.name, path: `/agents/${editId}` }, { label: pageTitle }]
      : [{ label: pageTitle }]),
  ];

  const saveMutation = useApiMutation(queryKeys.agents.all, (values: typeof form.values) => {
    const payload = {
      description: values.description,
      llmProvider: values.provider,
      llmModel: values.model,
      tools: values.tools,
      dailyTokenQuota: values.dailyTokenQuota,
    };
    if (isEditMode) {
      return updateAgent(editId!, payload);
    }
    return createAgent({
      name: values.name,
      ...payload,
    });
  });

  function handleSubmit(values: typeof form.values) {
    setTriedSubmit(false);
    saveMutation.mutate(values, {
      onSuccess: () => {
        const msg = isEditMode
          ? t('agents:edit.successMsg', { name: values.name })
          : t('agents:create.successMsg', { name: values.name });
        notifications.show({ message: msg, color: 'green', withCloseButton: true });
        navigate(isEditMode ? `/agents/${editId}` : '/agents');
      },
    });
  }

  function handleValidationError() {
    setTriedSubmit(true);
  }

  if (isEditMode && agentLoading) {
    return <Center h="60vh"><Loader size="md" /></Center>;
  }

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={pageTitle} />

      <div className={classes.formCard}>
        <form onSubmit={form.onSubmit(handleSubmit, handleValidationError)}>
          <div className={classes.formGrid}>
            <TextInput
              label={t('agents:create.nameLabel')}
              placeholder={t('agents:create.namePlaceholder')}
              description={t('agents:create.nameDesc')}
              withAsterisk
              disabled={isEditMode}
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              {...form.getInputProps('name')}
            />

            <Select
              label={t('agents:create.providerLabel')}
              placeholder={t('agents:create.providerPlaceholder')}
              data={PROVIDER_OPTIONS}
              withAsterisk
              inputWrapperOrder={['label', 'input', 'error']}
              {...form.getInputProps('provider')}
            />

            <div className={classes.formGridFull}>
              <Textarea
                label={t('agents:create.descriptionLabel')}
                placeholder={t('agents:create.descriptionPlaceholder')}
                minRows={3}
                withAsterisk
                {...form.getInputProps('description')}
              />
            </div>

            <Select
              label={t('agents:create.modelLabel')}
              placeholder={t('agents:create.modelPlaceholder')}
              data={MODEL_OPTIONS[selectedProvider] ?? []}
              searchable
              allowDeselect={false}
              nothingFoundMessage={t('agents:create.modelNotFound')}
              withAsterisk
              inputWrapperOrder={['label', 'input', 'error']}
              {...form.getInputProps('model')}
            />

            <NumberInput
              label={t('agents:create.quotaLabel')}
              description={t('agents:create.quotaDesc')}
              min={1000}
              max={10_000_000}
              step={50000}
              thousandSeparator
              withAsterisk
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              {...form.getInputProps('dailyTokenQuota')}
            />

            <div className={classes.formGridFull}>
              <MultiSelect
                label={t('agents:create.toolsLabel')}
                placeholder={t('agents:create.toolsPlaceholder')}
                data={TOOL_OPTIONS}
                searchable
                clearable
                description={t('agents:create.toolsDesc')}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                {...form.getInputProps('tools')}
              />
            </div>
          </div>

          <div className={classes.formActions}>
            <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={saveMutation.isPending}>
              {isEditMode ? t('agents:edit.submitBtn') : t('agents:create.submitBtn')}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={() => navigate(isEditMode ? `/agents/${editId}` : '/agents')}
            >
              {t('agents:create.cancelBtn')}
            </Button>
            {!form.isValid() && triedSubmit && (
              <Text size="sm" c="red" mt={4}>{t('common:actions.formErrorHint')}</Text>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
