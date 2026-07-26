import { useAuthStore } from "../store/AuthStore";
import { env } from "../config/env";

const API_URL = `${env.apiUrl}/api/v1/citizen`;

export const CitizenService = {
  async getDashboard() {
    const session = useAuthStore.getState().session;
    if (!session || !session.access_token) throw new Error("No active session");

    const response = await fetch(`${API_URL}/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.status}`);
    }
    return response.json();
  },

  async getPayments() {
    const session = useAuthStore.getState().session;
    if (!session || !session.access_token) throw new Error("No active session");

    const response = await fetch(`${API_URL}/payments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.status}`);
    }
    return response.json();
  },

  async payBill(paymentId: string) {
    const session = useAuthStore.getState().session;
    if (!session || !session.access_token) throw new Error("No active session");

    const response = await fetch(`${API_URL}/payments/${paymentId}/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to pay bill: ${response.status}`);
    }
    return response.json();
  }
};
