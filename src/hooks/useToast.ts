/**
 * Hook simples para exibir notificações toast.
 * Usa alert nativo por enquanto - pode ser substituído por uma lib de toast depois.
 */

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const show = ({ title, description, type = 'info', duration = 3000 }: ToastOptions) => {
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = getToastClasses(type);
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        ${getIcon(type)}
        <div class="flex-1">
          <p class="font-semibold text-sm">${title}</p>
          ${description ? `<p class="text-xs mt-1 opacity-90">${description}</p>` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-current opacity-70 hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    // Adicionar ao container de toasts (criar se não existir)
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    toast.style.pointerEvents = 'auto';
    toast.style.transition = 'opacity 200ms ease';
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
      }, duration);
    }
  };

  return {
    success: (title: string, description?: string, duration?: number) =>
      show({ title, description, type: 'success', duration }),
    error: (title: string, description?: string, duration?: number) =>
      show({ title, description, type: 'error', duration }),
    info: (title: string, description?: string, duration?: number) =>
      show({ title, description, type: 'info', duration }),
  };
}

function getToastClasses(type: ToastType): string {
  const base = 'w-full p-4 rounded-lg shadow-lg';
  
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return `${base} ${colors[type]}`;
}

function getIcon(type: ToastType): string {
  const icons = {
    success: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 flex-shrink-0">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
      </svg>
    `,
    error: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 flex-shrink-0">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
      </svg>
    `,
    info: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 flex-shrink-0">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
      </svg>
    `,
  };

  return icons[type];
}
