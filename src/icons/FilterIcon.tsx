import { Icon } from './icon'

export function FilterIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Filtrar'}>
      <polyline points="18 3 12 9 6 3" />
      <path d="M7 21v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
    </Icon>
  )
}
