import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, TextInput, Textarea, Select, NumberInput, MultiSelect, Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { PageHeader } from '../../components/shared/PageHeader/PageHeader';
import type { BreadcrumbItem } from '../../components/shared/PageHeader/PageHeader';
import { useApiMutation, queryKeys } from '../../hooks/useApi';
import { createAgent } from '../../services/agents';
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

export function AgentCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [triedSubmit, setTriedSubmit] = useState(false);

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
        if (value.trim().length < 2) return t('validation:nameMinLength');
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) return t('validation:nameFormat');
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

  const selectedProvider = form.values.provider;
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav:pageTitles./agents'), path: '/agents' },
    { label: t('agents:create.title') },
  ];

  const createMutation = useApiMutation(queryKeys.agents.all, (values: typeof form.values) =>
    createAgent({
      name: values.name,
      description: values.description,
      llmProvider: values.provider,
      llmModel: values.model,
      tools: values.tools,
      dailyTokenQuota: values.dailyTokenQuota,
    }),
  );

  function handleSubmit(values: typeof form.values) {
    setTriedSubmit(false);
    createMutation.mutate(values, {
      onSuccess: () => {
        notifications.show({ message: `Agent "${values.name}" 创建成功`, color: 'green', withCloseButton: true });
        navigate('/agents');
      },
    });
  }

  function handleValidationError() {
    setTriedSubmit(true);
  }

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={t('agents:create.title')} />

      <div className={classes.formCard}>
        <form onSubmit={form.onSubmit(handleSubmit, handleValidationError)}>
          <div className={classes.formGrid}>
            <TextInput
              label={t('agents:create.nameLabel')}
              placeholder={t('agents:create.namePlaceholder')}
              description={t('agents:create.nameDesc')}
              withAsterisk
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
            <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={createMutation.isPending}>
              {t('agents:create.submitBtn')}
            </Button>
            <Button variant="subtle" color="gray" leftSection={<IconX size={16} />} onClick={() => navigate('/agents')}>
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
