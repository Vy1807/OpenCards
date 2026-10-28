import { Icon } from './icon'

export function RefreshIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'Atualizar'}>
      <path d="M1 4v5h5" />
      <path d="M23 20v-5h-5" />
      <path d="M20.49 9A9 9 0 0 0 23 12c0 5-5 9-9 9" />
      <path d="M3.51 15A9 9 0 0 1 1 12c0-5 5-9 9-9" />
    </Icon>
  )
}
