import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { isLiveEnabled } from './features';

window.Pusher = Pusher;

let echo = {
    channel: () => ({ listen: () => ({ listen: () => {} }), leave: () => {} }),
    private: () => ({ listen: () => ({ listen: () => {} }), leave: () => {} }),
    leave: () => {},
};

if (isLiveEnabled()) {
    echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

export default echo;
