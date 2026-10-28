import { Icon } from './icon'

export function UploadIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Enviar'}>
      <polyline points="16 3 12 7 8 3" />
      <line x1="12" y1="7" x2="12" y2="21" />
      <polyline points="22 18 18 18 18 22" />
    </Icon>
  )
}
