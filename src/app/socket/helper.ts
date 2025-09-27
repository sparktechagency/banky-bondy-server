/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
export type SocketError = {
    code: number;
    message: string;
    type: 'validation' | 'database' | 'auth' | 'general';
    details?: any;
};
//emit error--------
export const emitError = (socket: any, error: SocketError) => {
    console.error(`Socket Error [${error.type}]:`, error);
    socket.emit('socket-error', error);
};
