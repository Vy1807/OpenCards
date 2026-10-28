import { Icon } from './icon';

export function ExternalLinkIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Link externo'}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
    </Icon>
  );
}
