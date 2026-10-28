import { Icon } from './icon'

export function ArrowRightIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Avançar'}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Icon>
  )
}
