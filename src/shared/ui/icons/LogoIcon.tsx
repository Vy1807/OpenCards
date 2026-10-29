import { Icon } from './icon';

export function LogoIcon(props: Parameters<typeof Icon>[0]) {
  return (
    <Icon {...props} title={props.title ?? 'OpenCards logo'}>
      {/* Quadrado de trás (menta) */}
      <rect x="2" y="2" width="12" height="12" rx="3" fill="#98D8AA" />
      {/* Quadrado da frente (rosa), deslocado */}
      <rect x="6" y="6" width="12" height="12" rx="3" fill="#F7A8B8" />
    </Icon>
  );
}
