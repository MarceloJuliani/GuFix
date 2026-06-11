import { Client, Exercise, SavedWorkout, TrainingType } from '../types';
import { getToken } from './auth';
import { apiUrl, readApiError } from './http';

export type CurrentUser = {
  id: string;
  email: string;
  fullName?: string | null;
  birthDate?: string | null;
  objective?: string | null;
  role?: 'personal' | 'student' | null;
  lastWorkoutType?: TrainingType | null;
};

export type BillingInfo = {
  subscriptionCost: number;
};

export type FinishedWorkout = {
  id: string;
  userId: string;
  clientId: string;
  clientName?: string | null;
  workoutId: string;
  finishedAt: any;
  timestamp: string | null;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
};

function timestampLike(value: unknown) {
  const dateValue = typeof value === 'string' || value instanceof Date ? value : null;
  return {
    value: dateValue,
    toDate: () => (dateValue ? new Date(dateValue) : new Date(0)),
    toMillis: () => (dateValue ? new Date(dateValue).getTime() : 0),
    toString: () => (dateValue ? String(dateValue) : ''),
  };
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(apiUrl(path), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, `Erro na API (${response.status})`));
  }
  const data = await response.json().catch(() => null);
  return data as T;
}

function normalizeClient(client: any): Client {
  return {
    ...client,
    fee: client.fee == null ? undefined : Number(client.fee),
    appEnabled: Boolean(client.appEnabled),
    createdAt: timestampLike(client.createdAt),
  };
}

function normalizeExercise(exercise: any): Exercise {
  return {
    ...exercise,
    isProtocol: Boolean(exercise.isProtocol),
    protocolExercises: Array.isArray(exercise.protocolExercises) ? exercise.protocolExercises : undefined,
    createdAt: exercise.createdAt || undefined,
  };
}

function normalizeWorkout(workout: any): SavedWorkout {
  return {
    ...workout,
    archived: Boolean(workout.archived),
    createdAt: timestampLike(workout.createdAt),
    blocks: Array.isArray(workout.blocks) ? workout.blocks : [],
  };
}

function normalizeFinishedWorkout(item: any): FinishedWorkout {
  return {
    ...item,
    finishedAt: timestampLike(item.finishedAt),
    timestamp: item.finishedAt || null,
  };
}

export async function getCurrentUser() {
  const data = await apiFetch<{ user: CurrentUser }>('/api/auth/me');
  return data.user;
}

export async function updateUserProfile(payload: Partial<CurrentUser>) {
  const data = await apiFetch<{ user: CurrentUser }>('/api/users/me', {
    method: 'PATCH',
    body: payload,
  });
  return data.user;
}

export async function listClients() {
  const data = await apiFetch<any[]>('/api/clients');
  return data.map(normalizeClient);
}

export async function createClient(payload: Pick<Client, 'name' | 'email' | 'fee'>) {
  const data = await apiFetch<any>('/api/clients', {
    method: 'POST',
    body: payload,
  });
  return normalizeClient(data);
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const data = await apiFetch<any>(`/api/clients/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload,
  });
  return normalizeClient(data);
}

export async function enableClientApp(id: string) {
  const data = await apiFetch<any>(`/api/clients/${encodeURIComponent(id)}/enable-app`, {
    method: 'POST',
  });
  return normalizeClient(data);
}

export async function listExercises() {
  const data = await apiFetch<any[]>('/api/exercises');
  return data.map(normalizeExercise);
}

export async function createExercise(payload: Partial<Exercise> & { suggestToGlobal?: boolean }) {
  const data = await apiFetch<any>('/api/exercises', {
    method: 'POST',
    body: payload,
  });
  return normalizeExercise(data);
}

export async function deleteExercise(id: string) {
  await apiFetch<{ ok: true }>(`/api/exercises/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listWorkouts(role: 'personal' | 'student' | null) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  const data = await apiFetch<any[]>(`/api/workouts${query}`);
  return data.map(normalizeWorkout);
}

export async function createWorkout(payload: Pick<SavedWorkout, 'clientName' | 'clientId' | 'type' | 'objective' | 'blocks'>) {
  const data = await apiFetch<any>('/api/workouts', {
    method: 'POST',
    body: payload,
  });
  return normalizeWorkout(data);
}

export async function deleteWorkout(id: string) {
  await apiFetch<{ ok: true }>(`/api/workouts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listFinishedWorkouts(role: 'personal' | 'student' | null) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  const data = await apiFetch<any[]>(`/api/finished-workouts${query}`);
  return data.map(normalizeFinishedWorkout);
}

export async function finishWorkout(workoutId: string, clientName?: string | null) {
  const data = await apiFetch<any>('/api/finished-workouts', {
    method: 'POST',
    body: { workoutId, clientName },
  });
  return normalizeFinishedWorkout(data);
}

export async function getBilling() {
  return apiFetch<BillingInfo>('/api/billing');
}
