import { Icon } from './icon'

export function ChevronDownIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Expandir'}>
      <polyline points="6 9 12 15 18 9" />
    </Icon>
  )
}
