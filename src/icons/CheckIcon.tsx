import { Icon } from './icon'

export function CheckIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Confirmado'}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  )
}
