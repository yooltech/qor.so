import { reactive } from 'vue';

const state = reactive({
  notifications: []
});

export function useNotifications() {
  const show = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    state.notifications.push({ id, message, type });
    
    setTimeout(() => {
      remove(id);
    }, duration);
  };

  const remove = (id) => {
    const index = state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      state.notifications.splice(index, 1);
    }
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
