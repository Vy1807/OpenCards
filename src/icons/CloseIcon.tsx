import { Icon } from './icon'

export function CloseIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Fechar'}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  )
}
