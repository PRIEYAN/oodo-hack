import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++idSeq;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-control border p-3 shadow-lg bg-surface ${
              t.type === 'error' ? 'border-red-200' : 'border-hairline'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            )}
            <p className="text-sm text-ink flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
