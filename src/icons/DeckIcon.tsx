import { Icon } from './icon'

export function DeckIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Baralho'}>
      <rect x="4" y="4" width="8" height="16" rx="2" />
      <path d="M14 4v16" />
    </Icon>
  )
}
