import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
    baseURL: 'http://localhost:3333', // Endereço do Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptador: Antes de cada requisição, coloca o token no Header
api.interceptors.request.use((config) => {
    const token = getCookie('eventsync_token'); // Recupera do cookie

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Interceptador: Tratamento de Erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se o token expirou ou é inválido (401), podemos logar no console
        if (error.response?.status === 401) {
            console.warn('Sessão expirada ou token inválido');
        }
        return Promise.reject(error);
    }
);

export { api };