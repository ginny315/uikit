import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function AgentDetailPage() {
  const { id } = useParams();
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Agent Detail</Title>
      <Text c="dimmed">Agent {id} detail page — coming in Session 4.</Text>
    </Container>
  );
}
