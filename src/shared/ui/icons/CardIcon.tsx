import { Icon } from './icon';

export function CardIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Cartão'}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10h10" />
      <path d="M7 14h6" />
    </Icon>
  );
}
