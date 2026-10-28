import { Icon } from './icon';

export function PencilIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Editar'}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l1.5 15L13 18z" />
    </Icon>
  );
}
