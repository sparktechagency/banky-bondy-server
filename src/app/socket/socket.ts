/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HTTPServer } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../config';
import handleChat from './handleChat';
let io: IOServer;

const initializeSocket = (server: HTTPServer) => {
    if (!io) {
        io = new IOServer(server, {
            pingTimeout: 60000,
            cors: {
                origin: [
                    'http://localhost:5173',
                    'http://localhost:3000',
                    'http://localhost:3008',
                    'http://10.10.20.70:3000',
                    'https://emilioroo-integration.vercel.app',
                    'https://emilioroo-dashboard-integration.vercel.app',
                    'https://bankybondy.com',
                    'http://bankybondy.com',
                    'https://www.bankybondy.com',
                    'http://www.bankybondy.com',
                    'https://admin.bankybondy.com',
                    'http://admin.bankybondy.com',
                ],
            },
        });
        // online user------------
        const onlineUser = new Set();
        io.on('connection', async (socket: Socket) => {
            // const userId = socket.handshake.query.id as string;
            // if (!userId) {
            //     return;
            // }
            // const currentUser = await NormalUser.findById(userId);
            // if (!currentUser) {
            //     return;
            // }
            // const currentUserId = currentUser?._id.toString();
            const token =
                socket.handshake.auth?.token || socket.handshake.query?.token;
            const decode = (await jwt.verify(
                token,
                config.jwt_access_secret as string
            )) as JwtPayload;
            const currentUserId = decode.profileId;
            // create a room-------------------------
            socket.join(currentUserId as string);
            // set online user
            onlineUser.add(currentUserId);
            // send to the client
            io.emit('onlineUser', Array.from(onlineUser));
            // handle caht
            await handleChat(io, socket, currentUserId as string);
            socket.on('disconnect', () => {
                console.log('A user disconnected:', socket.id);
            });
        });
    }
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error(
            'Socket.io is not initialized. Call initializeSocket first.'
        );
    }
    return io;
};

export { getIO, initializeSocket };
