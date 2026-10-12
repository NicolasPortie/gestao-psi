import { Toaster } from 'sonner';

import { MarcaEstado } from '../ui/marca-estado';

export function ProvedorToasts() {
  return (
    <Toaster
      position="bottom-right"
      offset={20}
      mobileOffset={{ bottom: 76, left: 12, right: 12 }}
      visibleToasts={3}
      gap={8}
      icons={{
        success: <MarcaEstado forma="check" tom="sucesso" tamanho={18} />,
        error: <MarcaEstado forma="x" tom="perigo" tamanho={18} />,
        info: <MarcaEstado forma="anel" tom="acento" tamanho={18} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-lg bg-overlay px-3.5 py-3 text-sm text-ink shadow-float sm:w-[22rem]',
          icon: 'mt-px shrink-0',
          content: 'grid gap-0.5',
          title: 'font-medium leading-5',
          description: 'text-ink-muted',
        },
      }}
    />
  );
}
