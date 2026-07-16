import { Container, Title, Text } from '@mantine/core';

export function DashboardPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Dashboard</Title>
      <Text c="dimmed">Overview of all agents and tasks — coming in Session 3.</Text>
    </Container>
  );
}
