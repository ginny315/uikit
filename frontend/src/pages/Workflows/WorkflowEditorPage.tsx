import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function WorkflowEditorPage() {
  const { id } = useParams();
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Workflow Editor</Title>
      <Text c="dimmed">DAG editor for workflow {id} — coming in Session 7.</Text>
    </Container>
  );
}
