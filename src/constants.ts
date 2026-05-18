/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise, TrainingObjective, ObjectiveLogic, TrainingType } from './types';

export const OBJECTIVES: Record<TrainingObjective, ObjectiveLogic> = {
  'Hipertrofia': { series: '3–4', reps: '8–12' },
  'Força': { series: '4–5', reps: '4–6' },
  'Metabólico': { series: '2–3', reps: '12–15' }
};

export const TRAINING_TYPES: TrainingType[] = ['Empurrar', 'Puxar', 'Perna', 'Híbrido', 'Full Body'];

export const EXERCISES: Exercise[] = [
  // PILLAR: EMPURRAR
  { id: '1', name: 'Supino Reto (BB/DB)', category: 'Empurrar', subCategory: 'Peito' },
  { id: '2', name: 'Supino Inclinado (BB/DB)', category: 'Empurrar', subCategory: 'Peito' },
  { id: '3', name: 'Flexão de Braços', category: 'Empurrar', subCategory: 'Peito' },
  { id: '4', name: 'Desenvolvimento (BB/DB)', category: 'Empurrar', subCategory: 'Ombro' },
  { id: '5', name: 'Elevação Lateral (DB)', category: 'Empurrar', subCategory: 'Ombro' },
  { id: '6', name: 'Tríceps Corda/Barra', category: 'Empurrar', subCategory: 'Tríceps' },
  { id: '7', name: 'Paralelas', category: 'Empurrar', subCategory: 'Tríceps' },

  // PILLAR: PUXAR
  { id: '8', name: 'Puxada Vertical (BP)', category: 'Puxar', subCategory: 'Costas' },
  { id: '9', name: 'Remada Baixa (BP)', category: 'Puxar', subCategory: 'Costas' },
  { id: '10', name: 'Remada Unilateral (DB)', category: 'Puxar', subCategory: 'Costas' },
  { id: '11', name: 'Barra Fixa', category: 'Puxar', subCategory: 'Costas' },
  { id: '12', name: 'Rosca Direta/Martelo', category: 'Puxar', subCategory: 'Bíceps' },
  { id: '13', name: 'Crucifixo Inverso', category: 'Puxar', subCategory: 'Ombro' },

  // PILLAR: TROCA DE NÍVEL (PERNA)
  { id: '14', name: 'Agachamento (BB/DB)', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '15', name: 'Leg Press 45', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '16', name: 'Afundo/Avanço', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '17', name: 'Stiff (BB/DB)', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '18', name: 'Cadeira Flexora', category: 'Perna', subCategory: 'Posterior' },
  { id: '19', name: 'Elevação Pélvica', category: 'Perna', subCategory: 'Glúteo' },
  { id: '20', name: 'Cadeira Extensora', category: 'Perna', subCategory: 'Quadríceps' },

  // PILLAR: ROTAÇÃO / CORE
  { id: '21', name: 'Prancha Frontal', category: 'Core', subCategory: 'Rotação' },
  { id: '22', name: 'Abdominal Supra/Infra', category: 'Core', subCategory: 'Rotação' },
  { id: '23', name: 'Russian Twist', category: 'Core', subCategory: 'Rotação' },
  { id: '24', name: 'Woodchopper (Cabo)', category: 'Core', subCategory: 'Rotação' },
  { id: '25', name: 'Prancha Lateral', category: 'Core', subCategory: 'Rotação' },

  // PILLAR: LOCOMOÇÃO / FUNCIONAL
  { id: '26', name: 'Farmer Walk', category: 'Funcional', subCategory: 'Locomoção' },
  { id: '27', name: 'Passada com Carga', category: 'Funcional', subCategory: 'Locomoção' },
  { id: '28', name: 'Sled Push/Pull', category: 'Funcional', subCategory: 'Locomoção' },
  { id: '29', name: 'Burpee', category: 'Funcional', subCategory: 'Locomoção' },
  { id: '30', name: 'Salto na Caixa', category: 'Funcional', subCategory: 'Troca de Nível' },

  // PILLAR: PROTOCOLOS & ISOLADOS
  { id: '100', name: 'SB. Flexão de braço', category: 'Empurrar', subCategory: 'Peito' },
  { id: '101', name: 'SB. Extensões lombares – prono', category: 'Core', subCategory: 'Rotação' },
  { id: '102', name: 'SB. Extensão da anca – prono', category: 'Core', subCategory: 'Rotação' },
  { id: '103', name: 'SB. Flexão invertida do tronco – pés na bola', category: 'Core', subCategory: 'Rotação' },
  { id: '104', name: 'SB. Corpo fechado com pés na bola – rotação', category: 'Core', subCategory: 'Rotação' },
  
  { id: '105', name: 'MB. Agachamento e elevação de braços acima da cabeça', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '106', name: 'MB. Rotação do tronco para cima com retorno do lado oposto alternada', category: 'Core', subCategory: 'Rotação' },
  { id: '107', name: 'MB. Rotação do tronco em pé (rotação com pivô)', category: 'Core', subCategory: 'Rotação' },
  
  { id: '108', name: 'BW. Agachamento bipodal', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '109', name: 'BW. Avanço alternado calistênico', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '110', name: 'BW. Agachamento alternado unilateral com salto', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '111', name: 'BW. Salto com agachamento', category: 'Perna', subCategory: 'Troca de Nível' },
  
  { id: '112', name: 'SB. Elevação pélvica', category: 'Perna', subCategory: 'Glúteo' },
  { id: '113', name: 'SB. Flexão de joelhos', category: 'Perna', subCategory: 'Posterior' },
  { id: '114', name: 'SB. Ponte de glúteos com pernas esticadas', category: 'Perna', subCategory: 'Glúteo' },
  
  { id: '115', name: 'BP. Remada alta', category: 'Puxar', subCategory: 'Costas' },
  { id: '116', name: 'BP. Remada curvada alternada em posição de avanço', category: 'Puxar', subCategory: 'Costas' },
  { id: '117', name: 'BP. Swimmer com elástico', category: 'Puxar', subCategory: 'Costas' },
  { id: '118', name: 'WB. Ball slam', category: 'Funcional', subCategory: 'Locomoção' },
  
  { id: '119', name: 'BW. Flexão', category: 'Empurrar', subCategory: 'Peito' },
  { id: '120', name: 'BP. Empurra unilateral (STAG)', category: 'Empurrar', subCategory: 'Peito' },
  { id: '121', name: 'BP. Crucifixo (STAG)', category: 'Empurrar', subCategory: 'Peito' },
  { id: '122', name: 'BW. Flexão explosiva', category: 'Empurrar', subCategory: 'Peito' },
  
  { id: '123', name: 'DB./KTB. Alcance anterior', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '124', name: 'DB./KTB. Alcance lateral', category: 'Perna', subCategory: 'Troca de Nível' },
  { id: '125', name: 'DB./KTB. Alcance transverso', category: 'Perna', subCategory: 'Troca de Nível' },
  
  { id: '126', name: 'DB. Desenvolvimento alternado', category: 'Empurrar', subCategory: 'Ombro' },
  { id: '127', name: 'DB. Desenvolvimento diagonal em “Y”', category: 'Empurrar', subCategory: 'Ombro' },
  { id: '128', name: 'DB. Desenvolvimento unilateral cruzado com pivô', category: 'Empurrar', subCategory: 'Ombro' },
  
  { id: '129', name: 'DB. Rosca alternada com giro', category: 'Puxar', subCategory: 'Bíceps' },
  { id: '130', name: 'DB. Remada alta alternada', category: 'Puxar', subCategory: 'Costas' },
  { id: '131', name: 'DB. Uppercut alternado (gancho cruzado com pivô)', category: 'Puxar', subCategory: 'Costas' },
  
  { id: '132', name: 'SB. Abdominal pés na bola', category: 'Core', subCategory: 'Rotação' },
  { id: '133', name: 'SB. Ponte', category: 'Core', subCategory: 'Rotação' },
  { id: '134', name: 'SB. Rotação de quadril com pernas na bola', category: 'Core', subCategory: 'Rotação' },
  
  { id: '135', name: 'MB. Abdominal tocando a ponta dos pés', category: 'Core', subCategory: 'Rotação' },
  { id: '136', name: 'SB. Abdominal infra com bola nas pernas', category: 'Core', subCategory: 'Rotação' },
  { id: '137', name: 'SB. Canivete com passagem da bola', category: 'Core', subCategory: 'Rotação' },

  // PROTOCOLOS
  { 
    id: '500', 
    name: 'FABULOUS 5', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['SB. Flexão de braço', 'SB. Extensões lombares – prono', 'SB. Extensão da anca – prono', 'SB. Flexão invertida do tronco – pés na bola', 'SB. Corpo fechado com pés na bola – rotação'],
    description: 'Protocolo de estabilidade e core com bola suíça.'
  },
  { 
    id: '501', 
    name: 'CHOPPER', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['MB. Agachamento e elevação de braços acima da cabeça', 'MB. Rotação do tronco para cima com retorno do lado oposto alternada', 'MB. Rotação do tronco em pé (rotação com pivô)'],
    description: 'Protocolo de rotação e potência com med ball.'
  },
  { 
    id: '502', 
    name: 'LEG CRANK', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['BW. Agachamento bipodal', 'BW. Avanço alternado calistênico', 'BW. Agachamento alternado unilateral com salto', 'BW. Salto com agachamento'],
    description: 'Protocolo de resistência e potência de membros inferiores.'
  },
  { 
    id: '503', 
    name: 'TRIPLE THREAT', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['SB. Elevação pélvica', 'SB. Flexão de joelhos', 'SB. Ponte de glúteos com pernas esticadas'],
    description: 'Protocolo de posterior de coxa e glúteo com bola suíça.'
  },
  { 
    id: '504', 
    name: 'META BACK', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['BP. Remada alta', 'BP. Remada curvada alternada em posição de avanço', 'BP. Swimmer com elástico', 'WB. Ball slam'],
    description: 'Protocolo de tração e estabilidade dorsal.'
  },
  { 
    id: '505', 
    name: 'META CHEST', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['BW. Flexão', 'BP. Empurra unilateral (STAG)', 'BP. Crucifixo (STAG)', 'BW. Flexão explosiva'],
    description: 'Protocolo de empurra e potência de peitorais.'
  },
  { 
    id: '506', 
    name: 'MATRIX DE PERNA', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['DB./KTB. Alcance anterior', 'DB./KTB. Alcance lateral', 'DB./KTB. Alcance transverso'],
    description: 'Protocolo de equilíbrio e estabilidade de membros inferiores.'
  },
  { 
    id: '507', 
    name: 'MATRIX DE EMPURRA', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['DB. Desenvolvimento alternado', 'DB. Desenvolvimento diagonal em “Y”', 'DB. Desenvolvimento unilateral cruzado com pivô'],
    description: 'Protocolo de estabilidade e força de ombros.'
  },
  { 
    id: '508', 
    name: 'MATRIX DE PUXA', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['DB. Rosca alternada com giro', 'DB. Remada alta alternada', 'DB. Uppercut alternado (gancho cruzado com pivô)'],
    description: 'Protocolo de força e estabilidade de membros superiores.'
  },
  { 
    id: '509', 
    name: 'CBR', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['SB. Abdominal pés na bola', 'SB. Ponte', 'SB. Rotação de quadril com pernas na bola'],
    description: 'Protocolo Core, Balance and Rotation.'
  },
  { 
    id: '510', 
    name: 'AB BLAST', 
    category: 'Protocolo', 
    subCategory: 'Protocolo',
    isProtocol: true,
    protocolExercises: ['MB. Abdominal tocando a ponta dos pés', 'SB. Abdominal infra com bola nas pernas', 'SB. Canivete com passagem da bola'],
    description: 'Protocolo intenso de abdominais.'
  },
];

export const PILLARS = [
  'Locomoção',
  'Troca de Nível',
  'Empurrar/Puxar',
  'Rotações'
];
