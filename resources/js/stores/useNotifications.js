import { reactive } from 'vue';

const state = reactive({
  notifications: []
});

export function useNotifications() {
  const show = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    state.notifications.push({ id, message, type });
    
    setTimeout(() => {
      remove(id);
    }, duration);
  };

  const remove = (id) => {
    state.notifications = state.notifications.filter(n => n.id !== id);
  };

  return {
    notifications: state.notifications,
    show,
    remove,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info')
  };
}
