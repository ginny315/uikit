import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function TaskDetailPage() {
  const { id } = useParams();
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Task Detail</Title>
      <Text c="dimmed">Task {id} detail with timeline — coming in Session 5.</Text>
    </Container>
  );
}
