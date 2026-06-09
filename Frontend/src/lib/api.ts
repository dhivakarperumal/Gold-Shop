const API_BASE_URL = 'http://localhost:5000/api';

export const authApi = {
  register: async (data: {
    user_id: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    status: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },
};
