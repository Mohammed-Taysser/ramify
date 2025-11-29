const BASE_ENDPOINT = '/api';

const ENDPOINTS = {
  operation: `${BASE_ENDPOINT}/operation`,
  auth: {
    login: `${BASE_ENDPOINT}/auth/login`,
    register: `${BASE_ENDPOINT}/auth/register`,
    refreshToken: `${BASE_ENDPOINT}/auth/refresh-token`,
    switchUser: `${BASE_ENDPOINT}/auth/switch-user`,
  },
  discussion: `${BASE_ENDPOINT}/discussion`,
  user: `${BASE_ENDPOINT}/users`,
};

export default ENDPOINTS;
