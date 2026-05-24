import api from './api';

export const authService = {
  signup: async (data: any) => {
    return api.post('/account/signup', data);
  },
  signin: async (data: any) => {
    return api.post('/account/signin', data);
  },
};