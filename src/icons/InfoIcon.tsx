import { Icon } from './icon';

export function InfoIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Informação'}>
      <circle cx="12" cy="9" r="1" />
      <path d="M11 12h2v6h-2z" />
    </Icon>
  );
}
