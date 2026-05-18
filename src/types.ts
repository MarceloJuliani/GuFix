/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Empurrar' | 'Puxar' | 'Perna' | 'Core' | 'Funcional' | 'O²' | 'Protocolo';
export type SubCategory = 'Peito' | 'Costas' | 'Ombro' | 'Bíceps' | 'Tríceps' | 'Quadríceps' | 'Posterior' | 'Glúteo' | 'Rotação' | 'Locomoção' | 'Troca de Nível' | 'Protocolo';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  description?: string;
  videoUrl?: string;
  uploaderId?: string;
  createdAt?: string;
  isProtocol?: boolean;
  protocolExercises?: string[];
}

export type TrainingObjective = 'Hipertrofia' | 'Força' | 'Metabólico';
export type TrainingType = 'Empurrar' | 'Puxar' | 'Perna' | 'Híbrido' | 'Full Body';

export interface ObjectiveLogic {
  series: string;
  reps: string;
}

export interface BiplexBlock {
  id: number;
  method?: 'Simples' | 'Biplex' | 'Triplex' | 'Quadriplex';
  mainExerciseId: string;
  dischargeExerciseId?: string;
  triplexExerciseId?: string;
  quadriplexExerciseId?: string;
  customNotes?: string;
  weight?: string;
}

export interface WorkoutPlan {
  id: string;
  clientName: string;
  date: string;
  type: TrainingType;
  objective: TrainingObjective;
  blocks: BiplexBlock[];
}

export interface UserProfile {
  fullName?: string;
  birthDate?: string;
  objective?: string;
  email?: string;
  lastWorkoutType?: TrainingType;
}

export interface Client {
  id: string;
  userId: string; // The professional who owns this client record
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  objective?: string;
  status: 'Ativo' | 'Inativo';
  fee?: number;
  appEnabled?: boolean;
  createdAt: any;
}

export interface SavedWorkout {
  id: string;
  userId: string;
  clientId?: string;
  clientName: string;
  type: TrainingType;
  objective: TrainingObjective;
  blocks: BiplexBlock[];
  createdAt: any;
  archived?: boolean;
}
