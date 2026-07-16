import { Container, Title, Text } from '@mantine/core';

export function TaskListPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Tasks</Title>
      <Text c="dimmed">Task list with sorting and filtering — coming in Session 5.</Text>
    </Container>
  );
}
