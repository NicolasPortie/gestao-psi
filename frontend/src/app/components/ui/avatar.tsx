import { cva, type VariantProps } from 'class-variance-authority';

import { iniciaisNome } from '../../core/formatacao/pessoas';
import { cn } from './cn';

const estiloAvatar = cva('inline-grid shrink-0 select-none place-items-center rounded-full bg-accent-wash font-medium text-accent-ink', {
  variants: {
    tamanho: {
      pequeno: 'size-6 text-[0.625rem]',
      medio: 'size-8 text-xs',
      grande: 'size-10 text-sm',
      enorme: 'size-14 text-lg',
    },
  },
  defaultVariants: { tamanho: 'medio' },
});

interface AvatarProps extends VariantProps<typeof estiloAvatar> {
  nome: string;
  className?: string;
}

/** Iniciais da pessoa. Decorativo: o nome completo sempre aparece em texto ao lado. */
export function Avatar({ nome, tamanho, className }: AvatarProps) {
  return (
    <span aria-hidden="true" className={cn(estiloAvatar({ tamanho }), className)}>
      {iniciaisNome(nome)}
    </span>
  );
}
