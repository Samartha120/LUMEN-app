import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/AuthStore';
import { queryClient } from './api.client';

class SocketService {
  private socket: Socket | null = null;
  private backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  connect() {
    const session = useAuthStore.getState().session;
    if (!session?.access_token) return;

    if (this.socket?.connected) return;

    this.socket = io(this.backendUrl, {
      extraHeaders: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    // Global listener for department/admin
    this.socket.on('complaint_status_changed', (update) => {
      queryClient.invalidateQueries({ queryKey: ['admin_complaints'] });
      queryClient.invalidateQueries({ queryKey: ['department_complaints'] });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinComplaint(complaintId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('join_complaint', complaintId);
    
    // Listen for specific complaint updates
    this.socket.on(`complaint_${complaintId}_update`, (update) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['citizen_complaints'] });
    });

    this.socket.on(`complaint_${complaintId}_timeline`, (timeline) => {
      queryClient.invalidateQueries({ queryKey: ['complaint_timeline', complaintId] });
    });
  }

  leaveComplaint(complaintId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_complaint', complaintId);
    this.socket.off(`complaint_${complaintId}_update`);
    this.socket.off(`complaint_${complaintId}_timeline`);
  }
}

export const socketService = new SocketService();
