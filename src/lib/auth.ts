import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { apiUrl, readApiError } from './http';

export type SessionUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role?: 'personal' | 'student' | null;
};

const TOKEN_KEY = 'gufix_token';
const BIOMETRIC_EMAIL_KEY = 'gufix_biometric_email';

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasBiometricSupport() {
  return Boolean(window.PublicKeyCredential && navigator.credentials);
}

export function isBiometricEnabled() {
  return Boolean(localStorage.getItem(BIOMETRIC_EMAIL_KEY));
}

export function clearBiometricLogin() {
  localStorage.removeItem(BIOMETRIC_EMAIL_KEY);
}

export async function loginWithEmail(email: string, password: string) {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readApiError(response, 'Email ou senha invalidos.'));
  const data = await response.json();
  saveToken(data.token);
  return data.user as SessionUser;
}

export async function enableBiometricLogin(user: SessionUser) {
  if (!hasBiometricSupport()) throw new Error('Biometria nao suportada neste dispositivo.');

  const optionsResponse = await fetch(apiUrl('/api/auth/biometric/register/options'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email }),
  });

  if (!optionsResponse.ok) {
    throw new Error(await readApiError(optionsResponse, 'Nao foi possivel iniciar o cadastro biometrico.'));
  }

  const { options, userId } = await optionsResponse.json();
  const registrationResponse = await startRegistration({ optionsJSON: options });

  const verifyResponse = await fetch(apiUrl('/api/auth/biometric/register/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, response: registrationResponse }),
  });

  if (!verifyResponse.ok) {
    throw new Error(await readApiError(verifyResponse, 'Nao foi possivel validar o cadastro biometrico.'));
  }

  localStorage.setItem(BIOMETRIC_EMAIL_KEY, user.email);
}

export async function loginWithBiometrics(emailInput?: string) {
  if (!hasBiometricSupport()) throw new Error('Biometria nao suportada neste dispositivo.');

  const email = (emailInput || localStorage.getItem(BIOMETRIC_EMAIL_KEY) || '').trim();
  if (!email) {
    throw new Error('Informe o email para autenticar com biometria.');
  }

  const optionsResponse = await fetch(apiUrl('/api/auth/biometric/login/options'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!optionsResponse.ok) {
    throw new Error(await readApiError(optionsResponse, 'Nenhuma credencial biometrica encontrada para este usuario.'));
  }

  const { options, userId } = await optionsResponse.json();
  const authResponse = await startAuthentication({ optionsJSON: options });

  const verifyResponse = await fetch(apiUrl('/api/auth/biometric/login/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, response: authResponse }),
  });

  if (!verifyResponse.ok) {
    throw new Error(await readApiError(verifyResponse, 'Falha na autenticacao biometrica.'));
  }

  const data = await verifyResponse.json();
  saveToken(data.token);
  localStorage.setItem(BIOMETRIC_EMAIL_KEY, data.user.email);
  return data.user as SessionUser;
}

export async function registerWithEmail(fullName: string, email: string, password: string) {
  const response = await fetch(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, role: 'personal' }),
  });
  if (!response.ok) throw new Error(await readApiError(response, 'Nao foi possivel criar a conta.'));
  const data = await response.json();
  saveToken(data.token);
  return data.user as SessionUser;
}
