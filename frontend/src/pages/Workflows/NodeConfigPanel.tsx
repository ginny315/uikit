/**
 * NodeConfigPanel — 节点配置侧边面板
 *
 * 当用户在 DAG 画布中选中一个 Agent 节点时，该面板从右侧滑入，
 * 用于配置节点的 Agent 选择、输入模板等。
 * Start/End 节点不显示此面板。
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Textarea, Button, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { WorkflowNode, WorkflowNodeData } from '../../types';
import { MOCK_AGENTS } from '../../mocks/agents';
import classes from './NodeConfigPanel.module.css';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  visible: boolean;
  onChange: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeConfigPanel({ node, visible, onChange, onDelete }: NodeConfigPanelProps) {
  const { t } = useTranslation();

  // 只显示运行中的 Agent（停止/错误的 Agent 不可选）
  const agentOptions = useMemo(
    () => MOCK_AGENTS
      .filter((a) => a.status === 'running')
      .map((a) => ({ value: a.id, label: `${a.name} (${a.llmModel})` })),
    [],
  );

  if (!visible || !node || node.type !== 'agent') return null;

  const data = node.data;

  return (
    <aside className={classes.panel}>
      <div className={classes.header}>
        <Text fw={600} size="sm" ff="Space Grotesk, sans-serif">
          {t('workflows:editor.stepConfig')}
        </Text>
      </div>

      <div className={classes.body}>
        <Select
          label={t('workflows:editor.agentLabel')}
          placeholder={t('workflows:editor.selectAgentPlaceholder')}
          data={agentOptions}
          value={data.agentId ?? ''}
          onChange={(v) => {
            if (v) {
              const agent = MOCK_AGENTS.find((a) => a.id === v);
              onChange(node.id, {
                agentId: v,
                agentName: agent?.name ?? '',
                label: data.label || agent?.name || '',
              });
            } else {
              onChange(node.id, { agentId: undefined, agentName: undefined });
            }
          }}
          searchable
          clearable
          mb="md"
          size="xs"
          comboboxProps={{ withinPortal: false }}
        />

        <Textarea
          label={t('workflows:editor.inputTemplateLabel')}
          placeholder={t('workflows:editor.inputTemplatePlaceholder')}
          description={t('workflows:editor.inputTemplateDesc')}
          value={data.inputTemplate ?? ''}
          onChange={(e) => onChange(node.id, { inputTemplate: e.currentTarget.value })}
          minRows={3}
          maxRows={8}
          autosize
          mb="lg"
          size="xs"
        />
      </div>

      <div className={classes.footer}>
        <Button
          variant="light"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={() => onDelete(node.id)}
          fullWidth
        >
          {t('workflows:editor.deleteStep')}
        </Button>
      </div>
    </aside>
  );
}
