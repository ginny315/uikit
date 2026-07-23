import { Text } from '@mantine/core';
import classes from './SettingSection.module.css';

interface SettingSectionProps {
  title: string;
  description: string;
}

export function SettingSection({ title, description }: SettingSectionProps) {
  return (
    <header className={classes.header}>
      <Text className={classes.title}>{title}</Text>
      <Text className={classes.description}>{description}</Text>
    </header>
  );
}
