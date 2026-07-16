import { Component, type ReactNode } from 'react';
import { Container, Title, Text, Button, Code } from '@mantine/core';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局 ErrorBoundary
 *
 * 捕获组件树中的未处理错误，显示友好错误页面。
 * PRD §6.3: "清晰的错误原因 + 重试按钮"
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl" ta="center">
          <Title order={2} mb="md">
            Something went wrong
          </Title>
          <Text c="dimmed" mb="lg">
            An unexpected error occurred. Please try again.
          </Text>
          <Code block mb="lg" ta="left">
            {this.state.error?.message ?? 'Unknown error'}
          </Code>
          <Button onClick={this.handleRetry} radius="xl">
            Try Again
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
