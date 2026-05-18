/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Target, 
  Settings2, 
  Plus, 
  ChevronDown, 
  Timer, 
  Flame, 
  Zap,
  Info,
  ClipboardList,
  Library,
  BookOpen,
  Search,
  CheckCircle2,
  Printer,
  LogIn,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Video,
  ExternalLink,
  Trash2,
  Save,
  Loader2,
  Menu,
  X,
  CreditCard,
  Settings,
  Heart,
  MessageCircle,
  History,
  Users,
  UserPlus,
  Smartphone,
  TrendingUp,
  ArrowDownRight,
  Coins,
  AlertCircle
} from 'lucide-react';
import { 
  TrainingObjective, 
  TrainingType, 
  BiplexBlock, 
  Exercise,
  Category,
  SubCategory,
  SavedWorkout,
  Client
} from './types';
import { EXERCISES as STATIC_EXERCISES, OBJECTIVES, TRAINING_TYPES } from './constants';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import LandingPage from './components/LandingPage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp,
  updateDoc
} from 'firebase/firestore';

type TabId = 'sistema' | 'biblioteca' | 'metodologia' | 'perfil' | 'historico' | 'alunos' | 'assinatura' | 'treinos_feitos';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('sistema');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'personal' | 'student' | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbExercises, setDbExercises] = useState<Exercise[]>([]);
  
  // Profile States
  const [profileFullName, setProfileFullName] = useState('');
  const [profileBirthDate, setProfileBirthDate] = useState('');
  const [profileObjective, setProfileObjective] = useState('');
  const [lastWorkoutType, setLastWorkoutType] = useState<TrainingType | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Workouts State
  const [dbWorkouts, setDbWorkouts] = useState<SavedWorkout[]>([]);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);


  // Clients State
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientFee, setNewClientFee] = useState(150);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [finishedWorkouts, setFinishedWorkouts] = useState<any[]>([]);
  const [billingInfo, setBillingInfo] = useState<{ subscriptionCost: number } | null>(null);
  const [isFinishingWorkout, setIsFinishingWorkout] = useState(false);
  const [isEnablingApp, setIsEnablingApp] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [clientName, setClientName] = useState('');
  const [searchQueryClients, setSearchQueryClients] = useState('');
  const [selectedType, setSelectedType] = useState<TrainingType>('Empurrar');
  const [selectedObjective, setSelectedObjective] = useState<TrainingObjective>('Hipertrofia');
  const [selectedMethod, setSelectedMethod] = useState<'Simples' | 'Biplex' | 'Triplex' | 'Quadriplex'>('Biplex');
  const [blocks, setBlocks] = useState<BiplexBlock[]>([
    { id: 1, mainExerciseId: '', dischargeExerciseId: '', weight: '' },
    { id: 2, mainExerciseId: '', dischargeExerciseId: '', weight: '' },
    { id: 3, mainExerciseId: '', dischargeExerciseId: '', weight: '' },
    { id: 4, mainExerciseId: '', dischargeExerciseId: '', weight: '' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState<Category | 'Todos'>('Todos');
  
  // Video Cadastro States
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<Category>('Empurrar');
  const [newExSubCategory, setNewExSubCategory] = useState<SubCategory>('Peito');
  const [newExVideoUrl, setNewExVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exercise Contribution
  const [suggestToGlobal, setSuggestToGlobal] = useState(false);

  // Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'workout' | 'exercise' } | null>(null);

  // History Pagination
  const [historyLimit, setHistoryLimit] = useState(10);

  // Video Preview
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [selectedClientIdForPrevious, setSelectedClientIdForPrevious] = useState<string | null>(null);
  const [selectedStudentIdInTreinosFeitos, setSelectedStudentIdInTreinosFeitos] = useState<string>('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    let unsubscribeWorkouts: (() => void) | null = null;
    let unsubscribeClients: (() => void) | null = null;
    let unsubscribeFinished: (() => void) | null = null;
    let unsubscribeBilling: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      
      if (u) {
        // Load profile first to get rotation
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileFullName(data.fullName || '');
            setProfileBirthDate(data.birthDate || '');
            setProfileObjective(data.objective || '');
            setLastWorkoutType(data.lastWorkoutType || null);
            
            if (data.role) {
              setUserRole(data.role);
              // Role exists, we can show selection or stay in role
              // As requested by user earlier: force selection each login
              setShowRoleSelection(true);
            } else {
              setShowRoleSelection(true);
            }
          } else {
            setShowRoleSelection(true);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setShowRoleSelection(true);
        }
      } else {
        setShowRoleSelection(false);
        setUserRole(null);
        setDbWorkouts([]);
        setClients([]);
        setFinishedWorkouts([]);
        setBillingInfo(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeWorkouts) unsubscribeWorkouts();
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeFinished) unsubscribeFinished();
      if (unsubscribeBilling) unsubscribeBilling();
    };
  }, []);

  // Separate effect for data listeners that depends on role
  useEffect(() => {
    if (!user) return;

    let unsubscribeWorkouts: (() => void) | null = null;
    let unsubscribeClients: (() => void) | null = null;
    let unsubscribeFinished: (() => void) | null = null;
    let unsubscribeBilling: (() => void) | null = null;

    // Workouts Query
    const qW = userRole === 'student' 
      ? query(collection(db, 'workouts'), where('clientId', '==', user.uid))
      : query(collection(db, 'workouts'), where('userId', '==', user.uid));

    unsubscribeWorkouts = onSnapshot(qW, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedWorkout[];
      docs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      setDbWorkouts(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'workouts');
    });

    // Clients Query (Only for Personal)
    if (userRole === 'personal') {
      const qC = query(collection(db, 'clients'), where('userId', '==', user.uid));
      unsubscribeClients = onSnapshot(qC, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
        docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setClients(docs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clients');
      });
    } else {
      setClients([]);
    }

    // Finished Workouts Query
    const qF = userRole === 'student'
      ? query(collection(db, 'finished_workouts'), where('clientId', '==', user.uid), orderBy('finishedAt', 'desc'))
      : query(collection(db, 'finished_workouts'), where('userId', '==', user.uid), orderBy('finishedAt', 'desc'));

    unsubscribeFinished = onSnapshot(qF, (snapshot) => {
      setFinishedWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      // It's possible ordering fails if index is missing, handle gracefully
      if (error.message.includes('index')) {
        console.warn('Index missing for finished_workouts, falling back to unordered list');
        const qFUnordered = userRole === 'student'
          ? query(collection(db, 'finished_workouts'), where('clientId', '==', user.uid))
          : query(collection(db, 'finished_workouts'), where('userId', '==', user.uid));
        onSnapshot(qFUnordered, (snap) => {
           setFinishedWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        handleFirestoreError(error, OperationType.LIST, 'finished_workouts');
      }
    });

    // Billing Query (Only for Personal)
    if (userRole === 'personal') {
      unsubscribeBilling = onSnapshot(doc(db, 'billing', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setBillingInfo(snapshot.data() as any);
        } else {
          setBillingInfo({ subscriptionCost: 99.90 });
          setDoc(doc(db, 'billing', user.uid), { subscriptionCost: 99.90, updatedAt: serverTimestamp() });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `billing/${user.uid}`);
      });
    }

    return () => {
      if (unsubscribeWorkouts) unsubscribeWorkouts();
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeFinished) unsubscribeFinished();
      if (unsubscribeBilling) unsubscribeBilling();
    };
  }, [user, userRole]);

  useEffect(() => {
    if (authLoading) return;

    const q = query(collection(db, 'exercises'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];
      setDbExercises(docs);
    }, (error) => {
      // If we still get a permission error (e.g. during rules refresh), we log it but don't let it crash the app mount
      if (error.message.includes('permission')) {
        console.warn('Firestore: Exercícios de banco restritos ou não disponíveis no momento.');
      } else {
        handleFirestoreError(error, OperationType.LIST, 'exercises');
      }
    });
    return unsubscribe;
  }, [authLoading]);

  useEffect(() => {
    if (userRole === 'student' && dbWorkouts.length > 0) {
      const activeWorkout = dbWorkouts.find(w => w.archived !== true);
      if (activeWorkout) {
        setBlocks(activeWorkout.blocks);
        setSelectedObjective(activeWorkout.objective);
        setSelectedType(activeWorkout.type);
        setClientName(activeWorkout.clientName);
      }
    }
  }, [userRole, dbWorkouts]);

  const allExercises = useMemo(() => {
    const combined = [...STATIC_EXERCISES, ...dbExercises];
    // Deduplicate by ID to avoid key collisions
    const unique = new Map();
    combined.forEach(ex => {
      unique.set(ex.id, ex);
    });
    return Array.from(unique.values());
  }, [dbExercises]);

  const currentLogic = OBJECTIVES[selectedObjective];

  const updateBlock = (id: number, field: keyof BiplexBlock, value: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const filteredLibrary = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ex.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = libraryCategory === 'Todos' || ex.category === libraryCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allExercises, searchQuery, libraryCategory]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    allExercises.forEach(ex => {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push(ex);
    });
    return groups;
  }, [allExercises]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // For demo purposes, we'll create a local URL
      // In production, you would upload to Firebase Storage here
      setNewExVideoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const workoutValidation = useMemo(() => {
    const errors: string[] = [];
    const exerciseIds = new Set(allExercises.map(ex => ex.id));
    
    if (!clientName.trim()) {
      errors.push('Selecione um aluno para prescrever o treino');
    }
    
    const blockStatuses = blocks.map((block, index) => {
      const hasMain = !!block.mainExerciseId;
      const mainExists = hasMain && exerciseIds.has(block.mainExerciseId);
      
      const needsDischarge = block.method === 'Biplex' || block.method === 'Triplex' || block.method === 'Quadriplex';
      const hasDischarge = !!block.dischargeExerciseId;
      const dischargeExists = hasDischarge && exerciseIds.has(block.dischargeExerciseId);
      
      const needsTriplex = block.method === 'Triplex' || block.method === 'Quadriplex';
      const hasTriplex = !!block.triplexExerciseId;
      const triplexExists = hasTriplex && exerciseIds.has(block.triplexExerciseId);

      const needsQuadriplex = block.method === 'Quadriplex';
      const hasQuadriplex = !!block.quadriplexExerciseId;
      const quadriplexExists = hasQuadriplex && exerciseIds.has(block.quadriplexExerciseId);
      
      const blockErrors: string[] = [];
      if (hasMain && !mainExists) {
        // Encontrar sugestões baseadas no tipo de treino selecionado
        const suggestions = allExercises
          .filter(ex => ex.category === selectedType)
          .slice(0, 3)
          .map(e => e.name)
          .join(', ');
          
        blockErrors.push(`EXERCÍCIO PRINCIPAL INVÁLIDO NO BLOCO ${index + 1}.`);
        if (suggestions) {
          blockErrors.push(`Dica: Experimente substituir por: ${suggestions}.`);
        }
      }
      
      if (needsDischarge && !hasDischarge) blockErrors.push(`EXERCÍCIO DE DESCARGA PENDENTE NO BLOCO ${index + 1}`);
      else if (hasDischarge && !dischargeExists) blockErrors.push(`EXERCÍCIO DE DESCARGA INVÁLIDO NO BLOCO ${index + 1}`);
      
      if (needsTriplex && !hasTriplex) blockErrors.push(`TERCEIRO EXERCÍCIO PENDENTE NO BLOCO ${index + 1}`);
      else if (hasTriplex && !triplexExists) blockErrors.push(`TERCEIRO EXERCÍCIO INVÁLIDO NO BLOCO ${index + 1}`);

      if (needsQuadriplex && !hasQuadriplex) blockErrors.push(`QUARTO EXERCÍCIO PENDENTE NO BLOCO ${index + 1}`);
      else if (hasQuadriplex && !quadriplexExists) blockErrors.push(`QUARTO EXERCÍCIO INVÁLIDO NO BLOCO ${index + 1}`);

      const isPartiallyFilled = hasMain || hasDischarge || hasTriplex || hasQuadriplex;
      const isValid = (hasMain && mainExists) && 
                      (!needsDischarge || (hasDischarge && dischargeExists)) && 
                      (!needsTriplex || (hasTriplex && triplexExists)) &&
                      (!needsQuadriplex || (hasQuadriplex && quadriplexExists));

      return {
        id: block.id,
        isValid,
        isPartiallyFilled,
        errors: blockErrors
      };
    });

    const filledBlocks = blockStatuses.filter(s => s.isPartiallyFilled);
    if (filledBlocks.length === 0) {
      errors.push('Adicione pelo menos um bloco de exercício com o exercício principal preenchido');
    } else {
      filledBlocks.forEach(s => {
        if (!s.isValid) {
          errors.push(...s.errors);
        }
      });
    }

    const hasInvalidFilledBlock = blockStatuses.some(s => s.isPartiallyFilled && !s.isValid);

    return {
      isValid: errors.length === 0 && !hasInvalidFilledBlock && filledBlocks.length > 0,
      errors: Array.from(new Set(errors)),
      blockStatuses
    };
  }, [clientName, blocks, allExercises, selectedType]);

  const handleSaveWorkout = async () => {
    if (!user || !clientName || !workoutValidation.isValid) return;
    setIsSavingWorkout(true);
    try {
      const workoutData = {
        userId: user.uid,
        clientName,
        clientId: selectedClientId || null,
        type: selectedType,
        objective: selectedObjective,
        blocks,
        createdAt: serverTimestamp(),
        archived: false
      };
      
      await addDoc(collection(db, 'workouts'), workoutData);

      // If we have a selected client ID, we could also update the client's last workout
      if (selectedClientId) {
        await setDoc(doc(db, 'clients', selectedClientId), {
          lastTrainingAt: serverTimestamp(),
          lastTrainingType: selectedType
        }, { merge: true });
      }
      
      // Update professional's profile record of last activity
      await setDoc(doc(db, 'users', user.uid), {
        lastWorkoutType: selectedType,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setLastWorkoutType(selectedType);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workouts');
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'workouts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `workouts/${id}`);
    }
  };

  const handleUpdateClient = async () => {
    if (!user || !editingClient?.id) {
      console.warn('ID do cliente não encontrado para atualização');
      return;
    }
    setIsAddingClient(true);
    try {
      await setDoc(doc(db, 'clients', editingClient.id), {
        name: editingClient.name,
        email: editingClient.email || '',
        fee: editingClient.fee || 150,
        status: editingClient.status,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setEditingClient(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${editingClient.id}`);
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleQuickStatusToggle = async (client: Client, newStatus: 'Ativo' | 'Inativo') => {
    if (!user || !client?.id) {
      console.error('Tentativa de alteração de status sem ID de cliente válido');
      return;
    }
    try {
      await setDoc(doc(db, 'clients', client.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${client.id}`);
    }
  };

  const handleAddClient = async () => {
    if (!user || !newClientName) return;
    setIsAddingClient(true);
    try {
      await addDoc(collection(db, 'clients'), {
        userId: user.uid,
        name: newClientName,
        email: newClientEmail,
        fee: newClientFee,
        status: 'Ativo',
        createdAt: serverTimestamp()
      });
      setNewClientName('');
      setNewClientEmail('');
      setNewClientFee(150);
      setShowAddClientModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'clients');
    } finally {
      setIsAddingClient(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        fullName: profileFullName,
        birthDate: profileBirthDate,
        objective: profileObjective,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsMenuOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateProfileAction = async () => {
    await handleSaveProfile();
    // Every change forces return to role selection as per user request
    setShowRoleSelection(true);
  };

  const handleEnableApp = async (client: Client) => {
    if (!user || !client?.id) return;
    setIsEnablingApp(true);
    try {
      await setDoc(doc(db, 'clients', client.id), {
        appEnabled: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert(t('email_sent_msg'));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${client?.id}`);
    } finally {
      setIsEnablingApp(false);
    }
  };

  const handleFinishWorkout = async (workout: SavedWorkout) => {
    if (!user) return;
    setIsFinishingWorkout(true);
    try {
      await addDoc(collection(db, 'finished_workouts'), {
        userId: workout.userId, // The professional's ID
        clientId: user.uid, // The student's ID (current user)
        clientName: profileFullName || user.displayName || user.email,
        workoutId: workout.id,
        finishedAt: serverTimestamp()
      });
      alert(t('workout_finished_msg'));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'finished_workouts');
    } finally {
      setIsFinishingWorkout(false);
    }
  };

  const revenueStats = useMemo(() => {
    const activePaying = clients.filter(c => c.status === 'Ativo');
    const totalRevenue = activePaying.reduce((acc, c) => acc + (c.fee || 150), 0);
    const totalExpenses = billingInfo?.subscriptionCost || 99.90;
    return {
      totalMonthlyRevenue: totalRevenue,
      expenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      payingStudents: activePaying.length
    };
  }, [clients, billingInfo]);

  const handleSetRole = async (role: 'personal' | 'student') => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        role,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUserRole(role);
      setShowRoleSelection(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleAddExercise = async () => {
    if (!user) return;
    if (!newExName || !newExVideoUrl) return;

    // Basic URL validation for YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(newExVideoUrl)) {
      alert(t('invalid_video_url'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      await addDoc(collection(db, 'exercises'), {
        name: newExName,
        category: newExCategory,
        subCategory: newExSubCategory,
        videoUrl: newExVideoUrl,
        uploaderId: user.uid,
        suggestToGlobal,
        status: suggestToGlobal ? 'pending_moderation' : 'active',
        createdAt: serverTimestamp(),
      });
      
      setNewExName('');
      setNewExVideoUrl('');
      setSelectedFile(null);
      setUploadProgress(0);
      setSuggestToGlobal(false);
      setShowUploadForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exercises');
    } finally {
      setIsSubmitting(false);
      clearInterval(interval);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exercises', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'exercises');
    }
  };

  const optionGroups = useMemo(() => Object.entries(groupedExercises) as [string, Exercise[]][], [groupedExercises]);

  const addBlock = () => {
    if (blocks.length >= 10) return;
    const newBlock: BiplexBlock = {
      id: blocks.length + 1,
      method: selectedObjective === 'Metabólico' ? 'Simples' : selectedMethod,
      mainExerciseId: '',
      dischargeExerciseId: '',
      triplexExerciseId: '',
      quadriplexExerciseId: '',
      weight: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: number) => {
    if (blocks.length <= 1) return;
    const newBlocks = blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, id: i + 1 }));
    setBlocks(newBlocks);
  };

  const loadSample = () => {
    if (!clientName) setClientName('ALUNO EXEMPLO');
    
    let sampleBlocks: BiplexBlock[] = [];
    const method = selectedObjective === 'Metabólico' ? 'Simples' : selectedMethod;
    
    // Helper to get exercises safely
    const getExId = (idx: number, cat?: string) => {
      const filtered = cat ? allExercises.filter(e => e.category === cat) : allExercises;
      return filtered[idx % filtered.length]?.id || String(idx + 1);
    };

    const dischargeId = '21'; // Exemplo genérico de abdominal/cardio/descarga
    const triplexId = '22';
    const quadriplexId = '23';

    if (selectedObjective === 'Metabólico') {
      const count = 7;
      for (let i = 1; i <= count; i++) {
        sampleBlocks.push({ id: i, method: 'Simples', mainExerciseId: getExId(i * 3, selectedType), weight: '15-20 reps' });
      }
    } else {
      const count = 4;
      for (let i = 1; i <= count; i++) {
        const block: BiplexBlock = { 
          id: i, 
          method, 
          mainExerciseId: getExId(i * 2, selectedType), 
          weight: '10-12 reps' 
        };
        
        if (method === 'Biplex' || method === 'Triplex' || method === 'Quadriplex') {
          block.dischargeExerciseId = dischargeId;
        }
        if (method === 'Triplex' || method === 'Quadriplex') {
          block.triplexExerciseId = triplexId;
        }
        if (method === 'Quadriplex') {
          block.quadriplexExerciseId = quadriplexId;
        }
        
        sampleBlocks.push(block);
      }
    }
    
    if (sampleBlocks.length > 0) {
      setBlocks(sampleBlocks);
    }
  };

  const prescribeWithAI = async () => {
    if (!user) return;
    setIsAILoading(true);
    try {
      loadSample();
    } catch (error) {
      console.error("Auto prescription error:", error);
      alert("Falha ao gerar prescrição automática.");
      loadSample();
    } finally {
      setIsAILoading(false);
    }
  };

  const resetAll = () => {
    setClientName('');
    setBlocks(blocks.map(b => ({ ...b, mainExerciseId: '', dischargeExerciseId: '', triplexExerciseId: '', quadriplexExerciseId: '', weight: '' })));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-accent/10 p-6 rounded-3xl"
        >
          <Dumbbell className="w-12 h-12 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-page-bg font-sans text-text-main pb-20 selection:bg-accent selection:text-black">
      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-page-bg/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-[300px] bg-card-bg border-r border-text-main/5 z-[101] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-accent" />
                  <span className="font-black tracking-tighter text-text-main">MENU</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-text-main/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-dim/40" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {[
                  { icon: Dumbbell, id: 'sistema', label: 'INÍCIO', desc: 'Prescrever e Planejar', role: 'personal' },
                  { icon: UserIcon, id: 'perfil', label: t('tabs.perfil'), desc: 'Dados e Bio' },
                  { icon: Users, id: 'alunos', label: t('tabs.alunos'), desc: 'Minha Consultoria', role: 'personal' },
                  { icon: ClipboardList, id: 'treinos_feitos', label: 'TREINOS FEITOS', desc: 'Histórico por Aluno', role: 'personal' },
                  { icon: History, id: 'historico', label: t('tabs.historico'), desc: 'Sessões Salvas', role: 'student' },
                  { icon: CreditCard, id: 'assinatura', label: t('tabs.assinatura'), desc: 'Plano GJ Premium', role: 'personal' },
                ].filter(item => !item.role || item.role === (userRole as string)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (['perfil', 'historico', 'alunos', 'assinatura', 'treinos_feitos', 'sistema'].includes(item.id)) {
                        setActiveTab(item.id as TabId);
                        setIsMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-text-main/5 transition-all group text-left"
                  >
                    <div className="p-2 bg-text-main/5 rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-main uppercase text-[10px] tracking-widest">{item.label}</p>
                      <p className="text-[9px] text-text-dim/20 uppercase font-black">{item.desc}</p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    setUserRole(null);
                    setShowRoleSelection(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 transition-all group text-left mt-4 border border-dashed border-text-main/5"
                >
                  <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-red-500 uppercase text-[10px] tracking-widest">{t('logout')}</p>
                    <p className="text-[9px] text-text-dim/20 uppercase font-black">{t('welcome_msg')}</p>
                  </div>
                </button>
              </nav>

              <div className="mt-auto pt-8 border-t border-text-main/5">
                <button className="flex items-center gap-3 text-text-dim/40 hover:text-text-main transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Suporte Direto</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Print-only Header */}
      <div className="hidden print:block p-8 border-b-4 border-black mb-8 bg-white text-black">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter italic">GU<span className="logo-fix">FIX</span></h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-1">Treinamento de Alta Performance</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data</p>
            <p className="font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-8">
          <div className="border-b-2 border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</p>
            <p className="text-lg font-bold">{clientName || '____________________'}</p>
          </div>
          <div className="border-b-2 border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</p>
            <p className="text-lg font-bold">{selectedType}</p>
          </div>
          <div className="border-b-2 border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</p>
            <p className="text-lg font-bold">{selectedObjective} ({currentLogic.series}x{currentLogic.reps})</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-page-bg/80 backdrop-blur-md border-b border-text-main/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-text-main/5 p-0.5 rounded-lg border border-text-main/10 mr-2">
              {[
                { code: 'pt', flag: '🇧🇷' },
                { code: 'en', flag: '🇺🇸' },
                { code: 'es', flag: '🇪🇸' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded transition-all ${
                    i18n.language === lang.code 
                    ? 'bg-accent text-page-bg shadow-sm' 
                    : 'hover:bg-text-main/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                  }`}
                  title={lang.code.toUpperCase()}
                >
                  <span className="text-lg md:text-xl">{lang.flag}</span>
                </button>
              ))}
            </div>
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-text-main/5 rounded-lg transition-colors group mr-2"
            >
              <Menu className="w-6 h-6 text-text-dim group-hover:text-accent" />
            </button>

            <div className="bg-accent/10 text-accent p-2 rounded flex items-center justify-center">
              <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-display font-black tracking-tighter text-text-main leading-none italic">GU<span className="logo-fix">FIX</span></h1>
              <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-0.5">Performance & Resultados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 bg-text-main/5 p-1 rounded-lg border border-text-main/10">
              {(userRole === 'personal' ? ['sistema', 'biblioteca', 'metodologia'] : ['sistema', 'historico']).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabId)}
                  className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                    ? 'bg-accent text-page-bg shadow-lg shadow-accent/20' 
                    : 'text-text-dim hover:text-text-main hover:bg-text-main/5'
                  }`}
                >
                  {tab === 'sistema' && userRole === 'student' ? t('current_prescription') : t(`tabs.${tab}`)}
                </button>
              ))}
            </nav>

            <button
                onClick={toggleTheme}
                className="p-2 hover:bg-text-main/5 rounded-lg transition-all group flex items-center gap-2 border border-text-main/5"
                title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-text-dim group-hover:text-accent" />
                ) : (
                  <Sun className="w-5 h-5 text-text-dim group-hover:text-accent" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-text-dim group-hover:text-text-main">Tema</span>
              </button>

              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-text-main/5 animate-pulse" />
              ) : user ? (
                <button 
                  onClick={logout}
                  className="group flex items-center gap-2 bg-text-main/5 hover:bg-red-500/10 p-2 rounded-lg border border-text-main/5 transition-all"
                  title="Sair"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-text-dim" />
                  )}
                  <LogOut className="w-4 h-4 text-text-main/20 group-hover:text-red-500" />
                </button>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 bg-accent text-page-bg px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  <LogIn className="w-3 h-3" />
                  Login
                </button>
              )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Save Success Feedback */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-accent text-page-bg px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
            >
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
              <span>{t('workout_saved_success')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'treinos_feitos' && (
            <motion.div
              key="treinos_feitos"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-card-bg border border-text-main/5 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-text-main italic uppercase tracking-tighter">TREINOS FEITOS</h2>
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-1">Gestão de Prescrições por Aluno</p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/40" />
                    <select 
                      className="w-full bg-page-bg border border-text-main/10 rounded-xl pl-12 pr-4 py-4 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all appearance-none uppercase"
                      value={selectedStudentIdInTreinosFeitos}
                      onChange={(e) => setSelectedStudentIdInTreinosFeitos(e.target.value)}
                    >
                      <option value="">TODOS OS ALUNOS</option>
                      <option value="AULA_AVULSA">AULA AVULSA</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {/* Active Workouts Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest italic">TREINOS ATIVOS</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(dbWorkouts.filter(w => {
                      if (selectedStudentIdInTreinosFeitos === 'AULA_AVULSA') return !w.clientId && w.archived !== true;
                      return (!selectedStudentIdInTreinosFeitos || w.clientId === selectedStudentIdInTreinosFeitos) && w.archived !== true;
                    }).length > 0) ? (
                      dbWorkouts
                        .filter(w => {
                          if (selectedStudentIdInTreinosFeitos === 'AULA_AVULSA') return !w.clientId && w.archived !== true;
                          return (!selectedStudentIdInTreinosFeitos || w.clientId === selectedStudentIdInTreinosFeitos) && w.archived !== true;
                        })
                        .map((workout) => (
                        <motion.div 
                          key={workout.id}
                          className="bg-card-bg border border-white/5 rounded-[2rem] p-8 hover:border-accent/20 transition-all group relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-md border border-accent/20">
                                  {workout.type}
                                </span>
                                <h3 className="text-xl font-black text-text-main italic uppercase tracking-tighter mt-3">{workout.clientName}</h3>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-bold text-text-dim/40 uppercase tracking-widest">Data</p>
                                 <p className="text-xs font-black text-text-dim/60">{workout.createdAt?.toDate().toLocaleDateString('pt-BR') || '---'}</p>
                              </div>
                            </div>
    
                            <div className="space-y-3 mb-8">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                                 <span className="text-text-dim/60">Objetivo</span>
                                 <span className="text-text-main">{workout.objective}</span>
                              </div>
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                                 <span className="text-text-dim/60">Blocos</span>
                                 <span className="text-text-main">{workout.blocks.length} Blocos</span>
                              </div>
                            </div>
    
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => {
                                  setClientName(workout.clientName);
                                  setSelectedClientId(workout.clientId || '');
                                  setSelectedType(workout.type);
                                  setSelectedObjective(workout.objective);
                                  setBlocks(workout.blocks.map((b: any, i: number) => ({ ...b, id: i + 1 })));
                                  setActiveTab('sistema');
                                }}
                                className="bg-text-main text-page-bg font-black uppercase text-[10px] tracking-widest py-4 rounded-xl hover:bg-accent transition-all flex items-center justify-center gap-2"
                              >
                                EDITAR TREINO
                              </button>
                              <button 
                                onClick={() => {
                                  // Set student data for new workout
                                  setClientName(workout.clientName);
                                  setSelectedClientId(workout.clientId || '');
                                  // Reset blocks for a fresh start
                                  setBlocks([{ id: 1, mainExerciseId: '', dischargeExerciseId: '', weight: '', method: 'Simples' }]);
                                  setActiveTab('sistema');
                                }}
                                className="bg-text-main/5 text-text-main font-black uppercase text-[10px] tracking-widest py-4 rounded-xl hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2"
                              >
                                NOVO TREINO
                              </button>
                            </div>
                            
                              <button 
                                onClick={() => {
                                  if (workout.id) {
                                    setItemToDelete({ id: workout.id, type: 'workout' });
                                  }
                                }}
                                className="w-full mt-3 text-[9px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest py-2 transition-all"
                              >
                                EXCLUIR REGISTRO
                              </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center border border-dashed border-text-main/10 rounded-[2.5rem] bg-text-main/5">
                        <Dumbbell className="w-8 h-8 text-text-main/5 mx-auto mb-3" />
                        <p className="font-bold text-[10px] text-text-dim/40 uppercase tracking-widest">Nenhum treino ativo para este filtro</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous/Archived Workouts Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-1.5 h-6 bg-text-dim/20 rounded-full"></div>
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest italic text-text-dim/60">TREINOS ANTERIORES</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(dbWorkouts.filter(w => {
                      if (selectedStudentIdInTreinosFeitos === 'AULA_AVULSA') return !w.clientId && w.archived === true;
                      return (!selectedStudentIdInTreinosFeitos || w.clientId === selectedStudentIdInTreinosFeitos) && w.archived === true;
                    }).length > 0) ? (
                      dbWorkouts
                        .filter(w => {
                          if (selectedStudentIdInTreinosFeitos === 'AULA_AVULSA') return !w.clientId && w.archived === true;
                          return (!selectedStudentIdInTreinosFeitos || w.clientId === selectedStudentIdInTreinosFeitos) && w.archived === true;
                        })
                        .map((workout) => (
                        <motion.div 
                          key={workout.id}
                          className="bg-card-bg/50 border border-white/5 rounded-[2rem] p-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all group relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest px-2 py-0.5 bg-text-main/5 rounded border border-text-main/10">
                                  {workout.type} (CONCLUÍDO)
                                </span>
                                <h3 className="text-lg font-black text-text-main italic uppercase tracking-tighter mt-3 opacity-50 group-hover:opacity-100">{workout.clientName}</h3>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] font-bold text-text-dim/40 uppercase tracking-widest">Início</p>
                                 <p className="text-[10px] font-black text-text-dim/60">{workout.createdAt?.toDate().toLocaleDateString('pt-BR') || '---'}</p>
                              </div>
                            </div>

                            <div className="space-y-2 mb-6">
                               <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest pb-1">
                                  <span className="text-text-dim/40 italic">Objetivo: {workout.objective}</span>
                                  <span className="text-text-dim/40 italic">{workout.blocks.length} blocos</span>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              <button 
                                onClick={() => {
                                  setClientName(workout.clientName);
                                  setSelectedClientId(workout.clientId || '');
                                  setSelectedType(workout.type);
                                  setSelectedObjective(workout.objective);
                                  setBlocks(workout.blocks.map((b: any, i: number) => ({ ...b, id: i + 1 })));
                                  setActiveTab('sistema');
                                }}
                                className="w-full bg-text-main/5 text-text-main font-black uppercase text-[9px] tracking-widest py-3 rounded-xl hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2"
                              >
                                REATIVAR / COPIAR
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center border border-dashed border-text-main/5 rounded-[2.5rem]">
                        <History className="w-8 h-8 text-text-main/5 mx-auto mb-3" />
                        <p className="font-bold text-[10px] text-text-dim/20 uppercase tracking-widest">Histórico vazio para este filtro</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sistema' && (
            <motion.div
              key="sistema"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-8"
            >
              {userRole === 'personal' ? (
                <>
                  <div className="bg-card-bg border border-text-main/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-accent/10 transition-colors pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"></div>
                            <span className="text-[10px] font-display font-black text-text-dim uppercase tracking-[0.3em]">{t('pro_dashboard')}</span>
                          </div>
                          <button 
                            onClick={() => setShowAddClientModal(true)}
                            className="bg-accent/10 hover:bg-accent text-accent hover:text-page-bg px-4 py-2 rounded-xl transition-all group flex items-center gap-3 border border-accent/20 active:scale-95"
                            title="Adicionar Aluno"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">NOVO ALUNO</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black tracking-widest text-text-dim uppercase italic">{t('select_student')}</label>
                            <div className="relative">
                              <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/40" />
                              <select 
                                className={`w-full bg-page-bg border ${!clientName ? 'border-red-500/20' : 'border-text-main/10'} rounded-2xl pl-14 pr-12 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all appearance-none uppercase italic cursor-pointer hover:border-accent/40`}
                                value={selectedClientId}
                                onChange={(e) => {
                                  const cid = e.target.value;
                                  setSelectedClientId(cid);
                                  const client = clients.find(c => c.id === cid);
                                  if (client) {
                                    setClientName(client.name);
                                    setSelectedObjective(client.objective as TrainingObjective || 'Hipertrofia');
                                  } else {
                                    setClientName('');
                                  }
                                }}
                              >
                                <option value="">-- {t('one_off_session')} --</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
                            </div>
                          </div>

                          {!selectedClientId && (
                            <div className="space-y-2">
                              <label className="block text-[9px] font-black tracking-widest text-text-dim uppercase italic">{t('form_name')}</label>
                              <div className="relative">
                                <ClipboardList className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                                <input 
                                  type="text"
                                  className={`w-full bg-page-bg border ${!clientName ? 'border-red-500/20' : 'border-text-main/10'} rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all uppercase placeholder:text-text-main/20 italic`}
                                  placeholder={t('student_name_placeholder')}
                                  value={clientName}
                                  onChange={(e) => setClientName(e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-text-main/5 pt-8 md:pt-0 md:pl-10">
                        <div className="text-center group/stat">
                          <p className="text-[10px] font-black text-text-dim/40 uppercase italic group-hover/stat:text-accent transition-colors">{t('registered')}</p>
                          <p className="text-4xl font-black text-text-main italic mt-1">{clients.length}</p>
                        </div>
                        <div className="h-12 w-px bg-text-main/5"></div>
                        <div className="text-center group/stat">
                          <p className="text-[10px] font-black text-text-dim/40 uppercase italic group-hover/stat:text-accent transition-colors">{t('prescriptions')}</p>
                          <p className="text-4xl font-black text-accent italic mt-1">{dbWorkouts.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                {/* Sidebar Config */}
                <aside className="col-span-12 lg:col-span-4 space-y-6">
                  <section className="bg-card-bg rounded-2xl border border-text-main/5 p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-8 relative z-10">
                      <Settings2 className="w-4 h-4 text-accent" />
                      <h2 className="text-xs font-display font-black uppercase tracking-[0.2em] text-text-main">{t('current_prescription')}</h2>
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                      <div>
                        <label className="block text-[9px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">Modelo de Treino</label>
                        <div className="grid grid-cols-2 gap-2">
                           {[
                             { id: 'Simples', label: 'Isolado' },
                             { id: 'Biplex', label: 'Biplex' },
                             { id: 'Triplex', label: 'Triplex' },
                             { id: 'Quadriplex', label: 'Quadriplex' }
                           ].map((m) => (
                             <button
                               key={m.id}
                               onClick={() => {
                                 const method = m.id as any;
                                 setSelectedMethod(method);
                                 // Apply method to all existing empty blocks or update them?
                                 // Usually users want to switch the context. Let's just update the state.
                               }}
                               className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                 selectedMethod === m.id 
                                 ? 'bg-accent text-page-bg border-accent shadow-lg shadow-accent/20' 
                                 : 'bg-page-bg text-text-dim border-text-main/10 hover:border-accent/40'
                               }`}
                             >
                               {m.label}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-text-dim uppercase tracking-widest mb-2">{t('method_base')}</label>
                        <div className="relative">
                          <select 
                            className="w-full bg-page-bg border border-text-main/10 rounded-lg px-4 py-3.5 appearance-none focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none cursor-pointer text-sm font-bold uppercase italic text-text-main"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as TrainingType)}
                          >
                            {TRAINING_TYPES.map(type => (
                              <option key={type} value={type} className="bg-page-bg">{type}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40 pointer-events-none" />
                        </div>
                      </div>

                    <div>
                      <label className="block text-[9px] font-bold text-text-dim uppercase tracking-widest mb-2">{t('objective')}</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-page-bg border border-text-main/10 rounded-lg px-4 py-3.5 appearance-none focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none cursor-pointer text-sm font-bold text-text-main"
                          value={selectedObjective}
                          onChange={(e) => setSelectedObjective(e.target.value as TrainingObjective)}
                        >
                          <option value="Hipertrofia" className="bg-page-bg">{t('hipertrofia')}</option>
                          <option value="Força" className="bg-page-bg">{t('forca')}</option>
                          <option value="Metabólico" className="bg-page-bg">{t('metabolico')}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40 pointer-events-none" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-text-main/5 space-y-4">
                      <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
                        <div className="flex items-center gap-2 mb-3">
                           <Zap className="w-3 h-3 text-accent" />
                           <span className="text-[9px] font-black text-accent uppercase tracking-[0.15em]">{t('auto_logic')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-page-bg/50 p-2.5 rounded-lg border border-text-main/5">
                             <span className="block text-[8px] font-bold text-text-dim/40 uppercase tracking-widest mb-1">{t('sets')}</span>
                             <span className="text-base font-black text-text-main font-mono leading-none tracking-tighter">{currentLogic.series}</span>
                          </div>
                          <div className="bg-page-bg/50 p-2.5 rounded-lg border border-text-main/5">
                             <span className="block text-[8px] font-bold text-text-dim/40 uppercase tracking-widest mb-1">{t('reps')}</span>
                             <span className="text-base font-black text-text-main font-mono leading-none tracking-tighter">{currentLogic.reps}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                          onClick={loadSample}
                          className="flex-1 text-[9px] font-bold text-text-dim border border-text-main/10 hover:bg-text-main/5 py-3 rounded-lg transition-colors uppercase tracking-widest"
                        >
                          {t('example')}
                        </button>
                        <button 
                          onClick={prescribeWithAI}
                          disabled={isAILoading}
                          className="flex-1 text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 py-3 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                          {isAILoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3 group-hover:scale-125 transition-transform text-accent" />
                          )}
                          {t('ia_suggest')}
                        </button>
                        <button 
                          onClick={resetAll}
                          className="text-[9px] font-bold text-text-dim/50 hover:text-red-500 py-3 px-4 rounded-lg transition-colors uppercase tracking-widest"
                        >
                          {t('clear')}
                        </button>
                      </div>
                    </div>
                  </section>

                  <div className="bg-card-bg border border-text-main/5 rounded-2xl p-6 hidden lg:block">
                     <h3 className="text-[10px] font-display font-black text-text-dim uppercase tracking-[0.2em] mb-4">MÉTODO GU<span className="logo-fix">FIX</span></h3>
                     <p className="text-xs italic text-text-main/60 leading-relaxed font-serif tracking-tight">
                      "Integração de alta performance e resultados sólidos através de prescrição personalizada."
                     </p>
                  </div>
                </aside>

                {/* Main Prescription Blocks */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {blocks.map((block, index) => (
                        <motion.div 
                          key={`prescription-block-${block.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card-bg rounded-2xl border border-text-main/10 flex flex-col hover:border-accent/30 transition-colors group p-5 shadow-xl relative"
                        >
                          <button 
                            onClick={() => removeBlock(block.id)}
                            className="absolute top-4 right-4 p-1 hover:bg-red-500/10 rounded group/del transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3 text-text-dim/50 group-hover/del:text-red-500" />
                          </button>
    
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <span className={`bg-text-main/5 px-2 py-1 rounded text-[9px] font-mono border tracking-tighter ${workoutValidation.blockStatuses[index].isPartiallyFilled && !workoutValidation.blockStatuses[index].isValid ? 'border-red-500/50 text-red-500' : 'border-text-main/5 text-text-dim'}`}>0{block.id}</span>
                              <div className="flex items-center gap-2">
                                <select 
                                  className="bg-transparent border-none p-0 focus:ring-0 text-[11px] font-black uppercase tracking-tighter text-accent cursor-pointer appearance-none"
                                  value={block.method || 'Biplex'}
                                  onChange={(e) => updateBlock(block.id, 'method', e.target.value)}
                                >
                                  <option value="Simples" className="bg-page-bg">SIMPLES</option>
                                  <option value="Biplex" className="bg-page-bg">BIPLEX</option>
                                  <option value="Triplex" className="bg-page-bg">TRIPLEX</option>
                                  <option value="Quadriplex" className="bg-page-bg">QUADRIPLEX</option>
                                </select>
                                <ChevronDown className="w-2.5 h-2.5 text-accent/40 pointer-events-none" />
                              </div>
                            </div>
                            {workoutValidation.blockStatuses[index].isPartiallyFilled && !workoutValidation.blockStatuses[index].isValid && (
                               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                 <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                               </motion.div>
                            )}
                          </div>
                          
                          <div className="space-y-3 flex-1 mb-6">
                            {/* Main Exercise */}
                            <div className="bg-page-bg/40 p-3.5 rounded-xl border-l-4 border-accent relative group/ex">
                              <p className="text-[8px] uppercase text-text-dim font-bold mb-1.5 tracking-widest">Exercício 1 (Principal)</p>
                              <div className="flex items-center gap-2">
                                <select 
                                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-text-main cursor-pointer appearance-none uppercase"
                                  value={block.mainExerciseId}
                                  onChange={(e) => updateBlock(block.id, 'mainExerciseId', e.target.value)}
                                >
                                  <option value="" className="bg-page-bg">SELECIONAR...</option>
                                  {optionGroups.map(([cat, exs]) => (
                                    <optgroup key={cat} label={cat.toUpperCase()} className="bg-page-bg text-text-dim font-bold text-[10px]">
                                      {exs.map(ex => (
                                        <option key={ex.id} value={ex.id} className="bg-page-bg text-text-main py-2">{ex.name.toUpperCase()}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                {block.mainExerciseId && allExercises.find(e => e.id === block.mainExerciseId)?.videoUrl && (
                                  <button 
                                    onClick={() => setVideoPreviewUrl(allExercises.find(e => e.id === block.mainExerciseId)!.videoUrl!)}
                                    className="p-1.5 bg-accent/20 hover:bg-accent rounded-lg text-accent hover:text-page-bg transition-all shrink-0"
                                    title="Ver Vídeo"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <div className={`absolute right-${block.mainExerciseId ? '10' : '3'} top-1/2 -translate-y-1/2 pointer-events-none opacity-20`}>
                                <ChevronDown className="w-4 h-4 text-text-main" />
                              </div>
                            </div>
    
                            {/* Discharge Exercise (Biplex/Triplex) */}
                            {block.method !== 'Simples' && (
                              <div className="bg-text-main/5 p-3.5 rounded-xl border-l-4 border-text-main/10 relative group/ex">
                                <p className="text-[8px] uppercase text-text-dim font-bold mb-1.5 tracking-widest">Exercício 2 (Descarga)</p>
                                <div className="flex items-center gap-2">
                                  <select 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-text-main/60 cursor-pointer appearance-none uppercase"
                                    value={block.dischargeExerciseId}
                                    onChange={(e) => updateBlock(block.id, 'dischargeExerciseId', e.target.value)}
                                  >
                                    <option value="" className="bg-page-bg">SELECIONAR...</option>
                                    {optionGroups.map(([cat, exs]) => (
                                      <optgroup key={cat} label={cat.toUpperCase()} className="bg-page-bg text-text-dim font-bold text-[10px]">
                                        {exs.map(ex => (
                                          <option key={ex.id} value={ex.id} className="bg-page-bg text-text-main py-2">{ex.name.toUpperCase()}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {block.dischargeExerciseId && allExercises.find(e => e.id === block.dischargeExerciseId)?.videoUrl && (
                                    <button 
                                      onClick={() => setVideoPreviewUrl(allExercises.find(e => e.id === block.dischargeExerciseId)!.videoUrl!)}
                                      className="p-1.5 bg-text-main/10 hover:bg-text-main/20 rounded-lg text-text-dim hover:text-text-main transition-all shrink-0"
                                      title="Ver Vídeo"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className={`absolute right-${block.dischargeExerciseId ? '10' : '3'} top-1/2 -translate-y-1/2 pointer-events-none opacity-20`}>
                                  <ChevronDown className="w-4 h-4 text-text-main" />
                                </div>
                              </div>
                            )}
    
                            {/* Triplex Exercise */}
                            {(block.method === 'Triplex' || block.method === 'Quadriplex') && (
                              <div className="bg-accent/5 p-3.5 rounded-xl border-l-4 border-accent/20 relative group/ex">
                                <p className="text-[8px] uppercase text-accent/40 font-bold mb-1.5 tracking-widest">Exercício 3 (Extra)</p>
                                <div className="flex items-center gap-2">
                                  <select 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-accent/60 cursor-pointer appearance-none uppercase"
                                    value={block.triplexExerciseId || ''}
                                    onChange={(e) => updateBlock(block.id, 'triplexExerciseId', e.target.value)}
                                  >
                                    <option value="" className="bg-page-bg">SELECIONAR...</option>
                                    {optionGroups.map(([cat, exs]) => (
                                      <optgroup key={cat} label={cat.toUpperCase()} className="bg-page-bg text-text-dim font-bold text-[10px]">
                                        {exs.map(ex => (
                                          <option key={ex.id} value={ex.id} className="bg-page-bg text-text-main py-2">{ex.name.toUpperCase()}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {block.triplexExerciseId && allExercises.find(e => e.id === block.triplexExerciseId)?.videoUrl && (
                                    <button 
                                      onClick={() => setVideoPreviewUrl(allExercises.find(e => e.id === block.triplexExerciseId)!.videoUrl!)}
                                      className="p-1.5 bg-accent/10 hover:bg-accent/20 rounded-lg text-accent transition-all shrink-0"
                                      title="Ver Vídeo"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className={`absolute right-${block.triplexExerciseId ? '10' : '3'} top-1/2 -translate-y-1/2 pointer-events-none opacity-20`}>
                                  <ChevronDown className="w-4 h-4 text-accent" />
                                </div>
                              </div>
                            )}

                            {/* Quadriplex Exercise */}
                            {block.method === 'Quadriplex' && (
                              <div className="bg-text-main/5 p-3.5 rounded-xl border-l-4 border-text-main/20 relative group/ex">
                                <p className="text-[8px] uppercase text-text-dim/40 font-bold mb-1.5 tracking-widest">Exercício 4 (Extra)</p>
                                <div className="flex items-center gap-2">
                                  <select 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-text-main/60 cursor-pointer appearance-none uppercase"
                                    value={block.quadriplexExerciseId || ''}
                                    onChange={(e) => updateBlock(block.id, 'quadriplexExerciseId', e.target.value)}
                                  >
                                    <option value="" className="bg-page-bg">SELECIONAR...</option>
                                    {optionGroups.map(([cat, exs]) => (
                                      <optgroup key={cat} label={cat.toUpperCase()} className="bg-page-bg text-text-dim font-bold text-[10px]">
                                        {exs.map(ex => (
                                          <option key={ex.id} value={ex.id} className="bg-page-bg text-text-main py-2">{ex.name.toUpperCase()}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {block.quadriplexExerciseId && allExercises.find(e => e.id === block.quadriplexExerciseId)?.videoUrl && (
                                    <button 
                                      onClick={() => setVideoPreviewUrl(allExercises.find(e => e.id === block.quadriplexExerciseId)!.videoUrl!)}
                                      className="p-1.5 bg-text-main/10 hover:bg-text-main/20 rounded-lg text-text-dim transition-all shrink-0"
                                      title="Ver Vídeo"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className={`absolute right-${block.quadriplexExerciseId ? '10' : '3'} top-1/2 -translate-y-1/2 pointer-events-none opacity-20`}>
                                  <ChevronDown className="w-4 h-4 text-text-main" />
                                </div>
                              </div>
                            )}
                          </div>
    
                          <div className="grid grid-cols-3 gap-2 border-t border-text-main/5 pt-4 font-mono">
                            <div className="text-center">
                              <span className="block text-[8px] text-text-dim uppercase tracking-widest">Séries</span>
                              <span className="text-lg font-black text-text-main leading-none">{currentLogic.series.split('–')[0]}</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-[8px] text-text-dim uppercase tracking-widest">Reps</span>
                              <span className="text-lg font-black text-text-main leading-none">{currentLogic.reps.split('–')[0]}</span>
                            </div>
                            <div className="text-center bg-text-main/5 p-1 rounded">
                              <span className="block text-[8px] text-text-dim uppercase tracking-widest">Peso</span>
                              <input 
                                type="text"
                                placeholder="---"
                                className="w-full bg-transparent border-none p-0 text-center text-sm font-black text-accent focus:ring-0"
                                value={block.weight}
                                onChange={(e) => updateBlock(block.id, 'weight', e.target.value)}
                              />
                            </div>
                          </div>
                        </motion.div>
                  ))}

                  {blocks.length < 10 && (
                    <button 
                      onClick={addBlock}
                      className="bg-accent/5 border-2 border-dashed border-accent/20 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-accent/10 hover:border-accent/40 transition-all group"
                    >
                      <Plus className="w-8 h-8 text-accent/40 group-hover:text-accent mb-2 transition-colors" />
                      <span className="text-[10px] font-black uppercase text-accent/40 group-hover:text-accent tracking-widest">Adicionar Bloco</span>
                    </button>
                  )}
                </div>

                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <div className="h-1.5 w-12 bg-accent rounded-full"></div>
                    <div className="h-1.5 w-12 bg-text-main/10 rounded-full"></div>
                    <div className="h-1.5 w-12 bg-text-main/10 rounded-full"></div>
                    <div className="h-1.5 w-12 bg-text-main/10 rounded-full"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <span className="hidden md:block text-[9px] text-text-dim uppercase font-black tracking-widest">Sistema Glide Ready</span>
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        {!workoutValidation.isValid && (
                          <div className="flex flex-col items-end mr-2">
                             {workoutValidation.errors.slice(0, 1).map((err, i) => (
                               <span key={`v-err-${i}`} className="text-[9px] font-black uppercase tracking-tighter text-red-500 italic">
                                 {err}
                               </span>
                             ))}
                             {workoutValidation.errors.length > 1 && (
                               <span className="text-[8px] font-bold uppercase tracking-tighter text-red-500/60 italic">
                                 + {workoutValidation.errors.length - 1} outros erros
                               </span>
                             )}
                          </div>
                        )}
                        <div className="flex gap-2 w-full md:w-auto">
                          <button 
                            className="flex-1 md:flex-none bg-text-main text-page-bg font-black uppercase tracking-widest text-[11px] py-3.5 px-8 rounded-full hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95"
                            onClick={() => window.print()}
                          >
                            <Printer className="w-4 h-4" />
                            Imprimir
                          </button>
                          <button 
                            className={`flex-1 md:flex-none font-black uppercase tracking-widest text-[11px] py-3.5 px-8 rounded-full transition-all flex items-center justify-center gap-3 active:scale-95 
                              ${!workoutValidation.isValid || isSavingWorkout 
                                ? 'bg-text-main/5 border border-text-main/10 text-text-main/30 cursor-not-allowed' 
                                : 'bg-text-main/10 border border-text-main/20 text-text-main hover:bg-accent hover:text-page-bg hover:border-transparent'}`}
                            onClick={handleSaveWorkout}
                            disabled={isSavingWorkout || !workoutValidation.isValid}
                          >
                            {isSavingWorkout ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Save className={`w-4 h-4 ${workoutValidation.isValid ? 'text-accent' : 'text-text-dim/20'}`} />}
                            Salvar
                          </button>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            </>
          ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Student View Latest Workout */}
                  {dbWorkouts.filter(w => !w.archived).length > 0 ? (
                    <div className="space-y-8">
                       <div className="bg-accent rounded-[3rem] p-10 text-black md:p-16 relative overflow-hidden group">
                          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                             <div>
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">MEU TREINO<br/>DO DIA</h1>
                                <p className="text-lg font-bold opacity-60 uppercase tracking-widest">Base: {dbWorkouts.filter(w => !w.archived)[0].type} | {dbWorkouts.filter(w => !w.archived)[0].objective}</p>
                             </div>
                             <button
                               onClick={() => handleFinishWorkout(dbWorkouts.filter(w => !w.archived)[0])}
                               disabled={isFinishingWorkout}
                               className="bg-black text-accent font-black uppercase text-xs tracking-[0.2em] py-5 px-10 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
                             >
                               {isFinishingWorkout ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                               {t('finish_workout')}
                             </button>
                          </div>
                          <Dumbbell className="absolute -right-20 -bottom-20 w-80 h-80 text-black/5 -rotate-12 pointer-events-none" />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {dbWorkouts.filter(w => !w.archived)[0].blocks.map((block, idx) => (
                             <div key={`history-block-${block.id}-${idx}`} className="bg-card-bg border border-text-main/5 rounded-[2.5rem] p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                   <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-xl font-mono text-[10px] font-black tracking-widest">BLOCO 0{idx+1}</span>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-text-dim italic">{block.method}</span>
                                </div>
                                <div className="space-y-4">
                                   {[block.mainExerciseId, block.dischargeExerciseId, block.triplexExerciseId, block.quadriplexExerciseId].filter(Boolean).map((exId, i) => {
                                      const ex = allExercises.find(e => e.id === exId);
                                      return (
                                         <div key={i} className="flex items-center justify-between p-4 bg-text-main/5 rounded-2xl group hover:bg-accent hover:text-black transition-all">
                                            <div>
                                               <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Exercício {i+1}</p>
                                               <p className="font-black uppercase italic tracking-tight">{ex?.name || 'Desconhecido'}</p>
                                            </div>
                                            {ex?.videoUrl && (
                                               <button
                                                 onClick={() => setVideoPreviewUrl(ex.videoUrl!)}
                                                 className="p-3 bg-text-main/10 rounded-xl group-hover:bg-black/10 transition-colors"
                                               >
                                                  <Video className="w-4 h-4" />
                                               </button>
                                            )}
                                         </div>
                                      );
                                   })}
                                </div>
                                <div className="mt-6 pt-6 border-t border-text-main/5 flex justify-between items-center px-2">
                                   <div>
                                      <p className="text-[8px] font-black uppercase tracking-widest text-text-dim">Carga/Dica</p>
                                      <p className="text-xl font-black italic tracking-tighter text-accent">{block.weight || '--'}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[8px] font-black uppercase tracking-widest text-text-dim">Volume</p>
                                      <p className="text-sm font-black text-text-main italic">{currentLogic.series} x {currentLogic.reps}</p>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  ) : (
                    <div className="py-32 text-center bg-card-bg border border-text-main/5 rounded-[3rem] shadow-2xl">
                       <Dumbbell className="w-16 h-16 text-text-main/5 mx-auto mb-6" />
                       <h2 className="text-3xl font-black italic uppercase tracking-tighter text-text-main mb-2">Sem treinos no momento</h2>
                       <p className="text-text-dim font-bold uppercase tracking-widest text-[10px]">Seu treinador ainda não prescreveu sessões para você.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'biblioteca' && (
            <motion.div
              key="biblioteca"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-6"
            >
              <div className="bg-card-bg rounded-3xl p-6 md:p-10 border border-text-main/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent text-page-bg p-3 rounded-lg shadow-xl shadow-accent/20">
                      <Library className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-black text-text-main italic uppercase tracking-tighter">BASE DE EXERCIÍCIOS</h2>
                      <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">GJ PERSONAL SYSTEM</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <button
                      onClick={() => {
                        if (!user) {
                          loginWithGoogle();
                        } else {
                          setShowUploadForm(!showUploadForm);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        showUploadForm 
                        ? 'bg-text-main text-page-bg border-text-main' 
                        : 'bg-text-main/5 text-text-main/60 border-text-main/10 hover:border-accent/40'
                      }`}
                    >
                      {showUploadForm ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Plus className="w-4 h-4" />}
                      {showUploadForm ? 'Fechar Form' : 'Adicionar Vídeo'}
                    </button>

                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40" />
                      <input 
                        type="text"
                        placeholder="Pesquisar pilar ou exercício..."
                        className="w-full bg-page-bg border border-text-main/10 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dim/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-10 relative z-10 bg-text-main/5 p-2 rounded-2xl border border-text-main/5">
                  {(['Todos', 'Protocolo', 'Empurrar', 'Puxar', 'Perna', 'Core', 'Funcional', 'O²'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLibraryCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        libraryCategory === cat 
                        ? 'bg-accent text-page-bg shadow-lg shadow-accent/20' 
                        : 'text-text-dim hover:text-text-main hover:bg-text-main/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showUploadForm && user && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-12"
                    >
                      <div className="bg-page-bg/60 rounded-2xl p-8 border border-accent/20 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="bg-accent text-page-bg p-2 rounded">
                              <Plus className="w-5 h-5" />
                           </div>
                           <h2 className="text-xl font-black text-text-main italic uppercase tracking-tighter">CADASTRAR NOVO VÍDEO</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-6">
                              <div>
                                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3">Nome do Exercício</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: Supino Reto com Pausa"
                                  className="w-full bg-page-bg border border-text-main/10 rounded-xl px-5 py-4 text-sm font-bold focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dim/20 text-text-main"
                                  value={newExName}
                                  onChange={(e) => setNewExName(e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3">Pilar</label>
                                  <select 
                                    className="w-full bg-page-bg border border-text-main/10 rounded-xl px-5 py-4 text-sm font-bold focus:ring-1 focus:ring-accent focus:outline-none transition-all appearance-none text-text-main"
                                    value={newExCategory}
                                    onChange={(e) => setNewExCategory(e.target.value as Category)}
                                  >
                                    {['Empurrar', 'Puxar', 'Perna', 'Core', 'Funcional', 'O²', 'Protocolo'].map(cat => (
                                      <option key={cat} value={cat} className="bg-page-bg">{cat.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3">Categoria</label>
                                  <select 
                                    className="w-full bg-page-bg border border-text-main/10 rounded-xl px-5 py-4 text-sm font-bold focus:ring-1 focus:ring-accent focus:outline-none transition-all appearance-none text-text-main"
                                    value={newExSubCategory}
                                    onChange={(e) => setNewExSubCategory(e.target.value as SubCategory)}
                                  >
                                    {['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posterior', 'Glúteo', 'Rotação', 'Locomoção', 'Troca de Nível', 'Protocolo'].map(sub => (
                                      <option key={sub} value={sub} className="bg-page-bg">{sub.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                           </div>

                             <div className="space-y-6">
                                <div>
                                  <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3">Upload de Vídeo</label>
                                  <div className="flex flex-col gap-4">
                                    <label className="cursor-pointer group">
                                      <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all ${
                                        selectedFile 
                                        ? 'border-accent bg-accent/5' 
                                        : 'border-text-main/10 hover:border-text-main/30 bg-page-bg'
                                      }`}>
                                        <Video className={`w-8 h-8 mb-2 transition-colors ${selectedFile ? 'text-accent' : 'text-text-dim/40'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedFile ? 'text-accent' : 'text-text-dim'}`}>
                                          {selectedFile ? selectedFile.name : 'Selecionar da Galeria'}
                                        </span>
                                        <input 
                                          type="file" 
                                          accept="video/*" 
                                          className="hidden" 
                                          onChange={handleFileChange} 
                                        />
                                      </div>
                                    </label>

                                    {uploadProgress > 0 && (
                                      <div className="w-full bg-text-main/5 h-1.5 rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${uploadProgress}%` }}
                                          className="h-full bg-accent"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Ou cole o link (Youtube/Cloudinary)</label>
                                      <div className="relative">
                                        <ExternalLink className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40" />
                                        <input 
                                          type="url"
                                          placeholder="https://..."
                                          className="w-full bg-page-bg border border-text-main/10 rounded-xl pl-14 pr-5 py-4 text-sm font-bold focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dim/20 text-text-main"
                                          value={newExVideoUrl}
                                          onChange={(e) => setNewExVideoUrl(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pt-4 flex flex-col gap-4">
                                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-text-main/5 transition-all">
                                    <input 
                                      type="checkbox" 
                                      className="w-5 h-5 rounded border-text-main/10 text-accent focus:ring-accent"
                                      checked={suggestToGlobal}
                                      onChange={(e) => setSuggestToGlobal(e.target.checked)}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{t('propose_global')}</span>
                                      <span className="text-[8px] font-bold text-text-dim/60 uppercase">Sujeito a análise da moderação</span>
                                    </div>
                                  </label>

                                 <button 
                                    onClick={handleAddExercise}
                                    disabled={isSubmitting || !newExName || !newExVideoUrl}
                                    className="w-full bg-text-main text-page-bg font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-accent disabled:opacity-20 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                                 >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Salvando...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        Salvar na Biblioteca
                                      </>
                                    )}
                                 </button>
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-16">
                  {/* Protocol Section */}
                  {(libraryCategory === 'Todos' || libraryCategory === 'Protocolo') && filteredLibrary.some(ex => ex.isProtocol) && (
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="bg-accent text-page-bg px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Protocolos</div>
                        <div className="h-[1px] flex-1 bg-text-main/5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLibrary.filter(ex => ex.isProtocol).map(ex => (
                          <div key={ex.id} className="group relative bg-card-bg border border-accent/20 rounded-[2rem] p-8 hover:border-accent/50 transition-all flex flex-col shadow-2xl shadow-accent/5">
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-4 bg-accent/10 rounded-2xl">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                  <Zap className="w-6 h-6 text-accent" />
                                </motion.div>
                              </div>
                              <span className="text-[10px] font-black text-accent uppercase tracking-widest opacity-40">Protocolo GuFix</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-text-main italic uppercase tracking-tighter mb-4 leading-none group-hover:text-accent transition-colors">{ex.name}</h3>
                            <p className="text-text-dim text-[11px] font-bold leading-relaxed mb-6 italic uppercase tracking-tight opacity-60 line-clamp-2">{ex.description}</p>
                            
                            <div className="space-y-2 mb-8">
                              {ex.protocolExercises?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-main/60">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                  {item}
                                </div>
                              ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-text-main/5 flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-text-dim">Especializado</span>
                              {ex.uploaderId === user?.uid && (
                                <button 
                                  onClick={() => setItemToDelete({ id: ex.id, type: 'exercise' })}
                                  className="p-2 text-text-dim/20 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Exercises Section */}
                  {(libraryCategory === 'Todos' || libraryCategory !== 'Protocolo') && filteredLibrary.some(ex => !ex.isProtocol) && (
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="bg-text-main/10 text-text-dim px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Exercícios Individuais</div>
                        <div className="h-[1px] flex-1 bg-text-main/5" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {filteredLibrary.filter(ex => !ex.isProtocol).map(ex => (
                          <div key={ex.id} className="group relative bg-card-bg border border-text-main/5 rounded-xl overflow-hidden hover:border-accent/30 transition-all flex flex-col h-full">
                            {ex.videoUrl ? (
                              <div className="aspect-video bg-page-bg relative">
                                {ex.videoUrl.includes('youtube.com') || ex.videoUrl.includes('youtu.be') ? (
                                  <iframe 
                                    src={`https://www.youtube.com/embed/${ex.videoUrl.split('v=')[1] || ex.videoUrl.split('/').pop()}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video 
                                    src={ex.videoUrl} 
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                )}
                                <div className="absolute top-2 right-2">
                                  <span className="bg-accent/80 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest backdrop-blur-sm">VIDEO</span>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-video bg-text-main/5 flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                                <Dumbbell className="w-8 h-8 text-text-dim/20 group-hover:text-accent/20 transition-colors" />
                              </div>
                            )}
                            
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    ex.category === 'Empurrar' ? 'bg-red-500/10 text-red-500' :
                                    ex.category === 'Puxar' ? 'bg-blue-500/10 text-blue-500' :
                                    ex.category === 'Perna' ? 'bg-accent/10 text-accent' :
                                    ex.category === 'Core' ? 'bg-purple-500/10 text-purple-500' :
                                    ex.category === 'Funcional' ? 'bg-cyan-500/10 text-cyan-500' :
                                    ex.category === 'O²' ? 'bg-sky-500/10 text-sky-500' :
                                    ex.category === 'Protocolo' ? 'bg-accent text-page-bg' :
                                    'bg-amber-500/10 text-amber-500'
                                  }`}>
                                    {ex.category}
                                  </span>
                                  <h3 className="font-black text-text-main uppercase text-[11px] mt-1 group-hover:text-accent transition-colors leading-tight line-clamp-2">{ex.name}</h3>
                                  <p className="text-[8px] text-text-dim font-bold uppercase tracking-widest mt-0.5">{ex.subCategory}</p>
                                </div>
                                
                                {ex.uploaderId === user?.uid && (
                                  <button 
                                    onClick={() => setItemToDelete({ id: ex.id, type: 'exercise' })}
                                    className="p-1 text-text-dim/20 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'metodologia' && (
            <motion.div
              key="metodologia"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Method Card */}
              <div className="lg:col-span-2 bg-accent rounded-[3rem] p-10 md:p-16 text-black relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 w-80 h-80 bg-black/5 rounded-full -mr-32 -mb-32 blur-3xl pointer-events-none group-hover:bg-black/10 transition-colors"></div>
                
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-4">
                      <BookOpen className="w-10 h-10" />
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">O MÉTODO<br/>BIPLEX</h2>
                   </div>

                   <p className="max-w-xl text-lg font-bold leading-relaxed tracking-tight text-text-main">
                    O treinamento <span className="underline decoration-4 underline-offset-4 decoration-text-main/20">BIPLEX</span> foca na integração harmoniosa entre treinamento de força resistida e dinâmica funcional.
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                           <CheckCircle2 className="w-5 h-5 text-text-main" />
                           <h4 className="font-black uppercase tracking-widest text-sm text-text-main">Sinérgia</h4>
                        </div>
                        <p className="text-xs font-bold text-text-dim/60 leading-relaxed">Combinamos ativações musculares complementares para otimizar o tempo de sessão e aumentar o gasto metabólico.</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                           <CheckCircle2 className="w-5 h-5 text-text-main" />
                           <h4 className="font-black uppercase tracking-widest text-sm text-text-main">Fluidez</h4>
                        </div>
                        <p className="text-xs font-bold text-text-dim/60 leading-relaxed">A transição rápida entre exercícios garante densidade e mantém o ambiente hormonal propício para evolução.</p>
                      </div>
                   </div>
                </div>
                <Dumbbell className="absolute -right-16 -bottom-16 w-80 h-80 text-text-main/5 pointer-events-none -rotate-12" />
              </div>

              {/* Pillars Card */}
              <div className="bg-card-bg rounded-[2.5rem] p-10 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic text-text-main flex items-center gap-3 mb-10">
                    <Target className="w-6 h-6 text-accent" />
                    4 PILARES
                  </h3>
                  
                  <div className="space-y-4">
                    {['LOCOMOÇÃO', 'TROCA DE NÍVEL', 'EMPURRAR / PUXAR', 'ROTAÇÕES'].map((pillar, i) => (
                      <div key={pillar} className="flex items-center gap-4 bg-page-bg border border-text-main/5 p-5 rounded-2xl hover:bg-accent hover:text-page-bg transition-all group/item">
                        <span className="text-xs font-mono text-text-dim/20 font-bold group-hover/item:text-page-bg italic transition-colors">0{i+1}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{pillar}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-text-main/5 flex items-center gap-3">
                   <Info className="w-4 h-4 text-accent" />
                   <span className="text-[10px] font-bold text-text-dim/30 uppercase tracking-widest italic">Base GJ Personal</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alunos' && (
            <motion.div
              key="alunos"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-5xl font-black text-text-main italic uppercase tracking-tighter">{t('my_students')}</h2>
                  <p className="text-sm font-bold text-text-dim uppercase tracking-[0.2em] mt-2 italic">{t('consultancy_management')}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-text-main/5 p-1 rounded-2xl border border-text-main/10 shadow-inner">
                  {(['Todos', 'Ativo', 'Inativo'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setClientStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        clientStatusFilter === status 
                        ? 'bg-accent text-page-bg shadow-lg shadow-accent/20' 
                        : 'text-text-dim hover:text-text-main'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40" />
                      <input 
                        type="text"
                        placeholder={t('search_client')}
                        className="w-full bg-page-bg border border-text-main/10 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dim/40"
                        value={searchQueryClients}
                        onChange={(e) => setSearchQueryClients(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddClientModal(true)}
                      className="bg-accent text-page-bg font-black uppercase text-[11px] tracking-widest py-4 px-8 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95 shadow-2xl shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t('new_student')}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(clients.filter(c => 
                  c.name.toLowerCase().includes(searchQueryClients.toLowerCase()) && 
                  (clientStatusFilter === 'Todos' || c.status === clientStatusFilter)
                )).length > 0 ? (
                  clients
                    .filter(c => 
                      c.name.toLowerCase().includes(searchQueryClients.toLowerCase()) && 
                      (clientStatusFilter === 'Todos' || c.status === clientStatusFilter)
                    )
                    .map((client) => (
                    <motion.div 
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card-bg border border-text-main/5 rounded-[2.5rem] p-8 group relative overflow-hidden transition-all hover:border-accent/40 shadow-xl"
                    >
                      <div className="absolute top-4 right-4 z-[40]">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                          client.status === 'Ativo' 
                          ? 'bg-green-500 text-white border-green-600' 
                          : 'bg-red-500 text-white border-red-600'
                        }`}>
                          {client.status}
                        </span>
                      </div>

                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserIcon className="w-16 h-16 text-text-main" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-text-main/5 rounded-2xl flex items-center justify-center border border-text-main/5 group-hover:bg-accent group-hover:text-page-bg transition-all">
                            <span className="font-black text-xl italic">{client.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-black text-text-main uppercase italic tracking-tighter text-lg leading-tight">{client.name}</h3>
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('active_consultancy')}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-8">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                            <span className="text-text-dim/60">{t('last_workout')}</span>
                            <span className="text-text-main/60 italic">--</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                            <span className="text-text-dim/60">{t('objective')}</span>
                            <span className="text-text-main/60 italic truncate max-w-[120px]">{client.objective || t('not_defined')}</span>
                          </div>
                          {finishedWorkouts.some(fw => fw.clientId === client.id && new Date(fw.timestamp).toDateString() === new Date().toDateString()) && (
                            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[8px] font-black uppercase tracking-widest">{t('workout_finished_msg')}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button 
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setClientName(client.name);
                              setSelectedObjective(client.objective as TrainingObjective || 'Hipertrofia');
                              setActiveTab('sistema');
                            }}
                            className="bg-text-main/5 text-text-dim hover:text-text-main hover:bg-text-main/10 p-4 rounded-2xl transition-all flex flex-col items-center gap-1"
                          >
                            <ClipboardList className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase">{t('prescribe')}</span>
                          </button>
                          <button 
                            onClick={() => setEditingClient(client)}
                            className="bg-text-main/5 text-text-dim hover:text-text-main hover:bg-text-main/10 p-4 rounded-2xl transition-all flex flex-col items-center gap-1"
                          >
                            <Settings2 className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase">{t('edit')}</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => setSelectedClientIdForPrevious(client.id)}
                          className="w-full bg-text-main/5 text-accent hover:bg-accent/10 p-3 rounded-2xl transition-all flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest border border-accent/10 mb-3"
                        >
                          <History className="w-3 h-3" />
                          VER TREINOS ANTERIORES
                        </button>

                        {!client.appEnabled && (
                          <button 
                            disabled={isEnablingApp}
                            onClick={() => handleEnableApp(client)}
                            className="w-full bg-accent/10 text-accent hover:bg-accent hover:text-page-bg p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest border border-accent/20"
                          >
                            {isEnablingApp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Smartphone className="w-3 h-3" />}
                            {t('enable_app')}
                          </button>
                        )}
                      </div>
                      {client.status === 'Inativo' && (
                        <div className="absolute inset-0 bg-page-bg/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 p-6 text-center">
                          <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-4 border border-red-500/20">{t('inactive')}</span>
                          <p className="text-text-dim text-[10px] font-medium leading-relaxed mb-6 px-4">{t('inactive_msg')}</p>
                          <div className="flex flex-col w-full gap-2">
                            <button 
                              onClick={() => handleQuickStatusToggle(client, 'Ativo')}
                              className="w-full bg-accent text-page-bg font-black uppercase text-[10px] tracking-widest py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
                            >
                              {t('reactivate_student')}
                            </button>
                            <button 
                              onClick={() => setEditingClient(client)}
                              className="w-full bg-text-main/5 text-text-dim font-black uppercase text-[10px] tracking-widest py-3 rounded-xl hover:bg-text-main/10 transition-all"
                            >
                              {t('edit_data')}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-text-main/5 rounded-[3rem]">
                    <Users className="w-12 h-12 text-text-main/5 mx-auto mb-4" />
                    <p className="font-black text-text-dim/20 uppercase tracking-widest italic">{t('empty_student_list')}</p>
                    <button 
                      onClick={() => setShowAddClientModal(true)}
                      className="text-accent text-[10px] font-black uppercase tracking-widest mt-4 hover:underline"
                    >
                      {t('click_to_add_first')}
                    </button>
                  </div>
                )}
              </div>
              {/* Previous Workouts Modal */}
              <AnimatePresence>
                {selectedClientIdForPrevious && (
                   <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedClientIdForPrevious(null)}
                      className="absolute inset-0 bg-page-bg/90 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative bg-card-bg border border-white/10 w-full max-w-2xl rounded-[3rem] p-4 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                       <div className="flex justify-between items-center mb-8">
                         <h3 className="text-2xl font-black text-text-main italic uppercase tracking-tighter">TREINOS ANTERIORES</h3>
                         <button onClick={() => setSelectedClientIdForPrevious(null)} className="p-2 hover:bg-text-main/5 rounded-full">
                           <X className="w-6 h-6 text-text-dim" />
                         </button>
                       </div>
                       
                       <div className="space-y-4">
                         {dbWorkouts.filter(w => w.clientId === selectedClientIdForPrevious && w.archived).length > 0 ? (
                           dbWorkouts.filter(w => w.clientId === selectedClientIdForPrevious && w.archived).map(w => (
                             <div key={w.id} className="bg-text-main/5 p-6 rounded-2xl border border-text-main/5 group hover:border-accent/40 transition-all">
                               <div className="flex justify-between items-start mb-4">
                                 <div>
                                   <span className="text-[9px] font-black text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-md">
                                     {w.type}
                                   </span>
                                   <h4 className="font-black text-text-main uppercase mt-2">{w.objective}</h4>
                                   <p className="text-[10px] text-text-dim uppercase font-bold mt-1">
                                     {w.createdAt?.toDate().toLocaleDateString('pt-BR')}
                                   </p>
                                 </div>
                                 <button 
                                   onClick={() => {
                                      setClientName(w.clientName);
                                      setSelectedClientId(w.clientId || '');
                                      setSelectedType(w.type);
                                      setSelectedObjective(w.objective);
                                      setBlocks(w.blocks.map((b: any, i: number) => ({ ...b, id: i + 1 })));
                                      setActiveTab('sistema');
                                      setSelectedClientIdForPrevious(null);
                                   }}
                                   className="text-accent text-[9px] font-black uppercase tracking-widest hover:underline"
                                 >
                                   VISUALIZAR/EDITAR
                                 </button>
                               </div>
                               <div className="flex gap-2 flex-wrap">
                                 {w.blocks.slice(0, 3).map((b: any, i: number) => {
                                   const ex = allExercises.find(e => e.id === b.mainExerciseId);
                                   return (
                                     <span key={i} className="text-[8px] bg-text-main/5 px-2 py-1 rounded text-text-dim/60 font-black uppercase">
                                       {ex?.name.substring(0, 15)}...
                                     </span>
                                   );
                                 })}
                                 {w.blocks.length > 3 && <span className="text-[8px] text-text-dim/40 font-black">+{w.blocks.length - 3} MAIS</span>}
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-12 text-center">
                             <p className="text-text-dim font-black uppercase tracking-widest text-xs">Nenhum treino arquivado para este aluno.</p>
                           </div>
                         )}
                       </div>
                    </motion.div>
                   </div>
                )}
              </AnimatePresence>

              {/* Edit Client Modal */}
              <AnimatePresence>
                {editingClient && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setEditingClient(null)}
                      className="absolute inset-0 bg-page-bg/90 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative bg-card-bg border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl"
                    >
                      <h3 className="text-3xl font-black text-text-main italic uppercase tracking-tighter mb-8 text-center underline decoration-accent underline-offset-8">{t('edit_student')}</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('full_name')}</label>
                          <div className="relative">
                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                            <input 
                              type="text"
                              className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all uppercase italic"
                              value={editingClient.name}
                              onChange={(e) => setEditingClient({...editingClient, name: e.target.value.toUpperCase()})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">E-mail</label>
                          <div className="relative">
                            <Info className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                            <input 
                              type="email"
                              className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all italic"
                              value={editingClient.email || ''}
                              onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('student_fee')}</label>
                          <div className="relative">
                            <Coins className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                            <input 
                              type="number"
                              className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all italic"
                              value={editingClient.fee || 150}
                              onChange={(e) => setEditingClient({...editingClient, fee: Number(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('consultancy_status')}</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingClient({...editingClient, status: 'Ativo'})}
                              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingClient.status === 'Ativo' ? 'bg-accent text-page-bg shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]' : 'bg-text-main/5 text-text-dim border border-text-main/5'}`}
                            >
                              {t('active')}
                            </button>
                            <button 
                              onClick={() => setEditingClient({...editingClient, status: 'Inativo'})}
                              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingClient.status === 'Inativo' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-text-main/5 text-text-dim border border-text-main/5'}`}
                            >
                              {t('deactivate_student')}
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={handleUpdateClient}
                          disabled={isAddingClient || !editingClient.name}
                          className="w-full bg-white text-black font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-accent disabled:opacity-20 transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
                        >
                          {isAddingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          {t('save_changes')}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'historico' && (
            <motion.div
              key="historico"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Previous Workout Notice */}
              {userRole === 'student' && lastWorkoutType && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-accent/10 border border-accent/20 rounded-3xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-accent text-page-bg p-3 rounded-2xl">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-white italic uppercase tracking-tighter text-xl">{t('last_workout')}: {lastWorkoutType.toUpperCase()}</h3>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('consistency_msg')}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dbWorkouts.length > 0 ? (
                  dbWorkouts.slice(0, historyLimit).map((workout) => (
                    <motion.div 
                      key={workout.id}
                      layoutId={workout.id}
                      className="bg-card-bg border border-white/5 rounded-[2rem] p-8 hover:border-accent/20 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Dumbbell className="w-20 h-20" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-md border border-accent/20">
                              {workout.type}
                            </span>
                            <h3 className="text-xl font-black text-text-main italic uppercase tracking-tighter mt-3">{workout.clientName}</h3>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div>
                              <p className="text-[10px] font-bold text-text-dim/40 uppercase tracking-widest">{t('date')}</p>
                              <p className="text-xs font-black text-text-dim/60">{workout.createdAt?.toDate().toLocaleDateString('pt-BR') || '---'}</p>
                            </div>
                            <button 
                              onClick={() => setItemToDelete({ id: workout.id, type: 'workout' })}
                              className="p-2 hover:bg-red-500/10 rounded-lg group/del transition-all"
                              title={t('delete_workout')}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-text-dim/20 group-hover/del:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-8">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                             <span className="text-text-dim/60">{t('objective')}</span>
                             <span className="text-text-main">{workout.objective}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-text-main/5 pb-2">
                             <span className="text-text-dim/60">{t('volume')}</span>
                             <span className="text-text-main">{workout.blocks.length} {t('biplex_blocks')}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setClientName(workout.clientName);
                            setSelectedType(workout.type);
                            setSelectedObjective(workout.objective);
                            setBlocks(workout.blocks.map((b: any, i: number) => ({ ...b, id: i + 1 })));
                            setActiveTab('sistema');
                          }}
                          className="w-full bg-text-main/5 text-text-main font-black uppercase text-[10px] tracking-widest py-4 rounded-xl hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                          {t('load_workout')}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-text-main/5 rounded-[3rem]">
                    <History className="w-12 h-12 text-text-main/5 mx-auto mb-4" />
                    <p className="font-black text-text-dim/40 uppercase tracking-widest">{t('no_workout_saved')}</p>
                    <p className="text-[9px] font-bold text-text-dim/20 uppercase tracking-widest mt-2 italic">{t('prescribe_to_start_history')}</p>
                  </div>
                )}
              </div>

              {dbWorkouts.length > historyLimit && (
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setHistoryLimit(prev => prev + 10)}
                    className="bg-card-bg border border-text-main/10 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-accent/40 transition-all active:scale-95 text-text-main"
                  >
                    {t('load_more')}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'assinatura' && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-card-bg rounded-[3rem] p-10 md:p-16 border border-text-main/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                
                <div className="relative z-10 space-y-12">
                   <div className="flex items-center gap-4">
                      <div className="bg-accent text-page-bg p-4 rounded-2xl">
                         <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black italic uppercase tracking-tighter text-text-main">{t('tabs.assinatura')}</h2>
                         <p className="text-xs font-bold text-text-dim uppercase tracking-widest">{t('revenue_expenses_tracking')}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-text-main text-page-bg p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                         <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{t('revenue')}</p>
                            <p className="text-4xl font-black italic tracking-tighter">R$ {revenueStats.totalMonthlyRevenue.toFixed(2).replace('.', ',')}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-4 opacity-40 italic">{revenueStats.payingStudents} {t('paying_students')}</p>
                         </div>
                         <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-page-bg/10 -rotate-12" />
                      </div>

                      <div className="bg-text-main/5 border border-text-main/10 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                         <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-2">{t('expenses')}</p>
                            <p className="text-4xl font-black italic tracking-tighter text-text-main">R$ {revenueStats.expenses.toFixed(2).replace('.', ',')}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-4 text-text-dim/40 italic">{t('app_cost')}</p>
                         </div>
                         <ArrowDownRight className="absolute -right-4 -bottom-4 w-24 h-24 text-text-main/5 -rotate-12" />
                      </div>

                      <div className="bg-accent border border-accent p-8 rounded-[2rem] shadow-2xl shadow-accent/20 relative overflow-hidden group">
                         <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">{t('net_profit')}</p>
                            <p className="text-4xl font-black italic tracking-tighter text-black">R$ {revenueStats.netProfit.toFixed(2).replace('.', ',')}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-4 text-black/40 italic">{t('total_monthly')}</p>
                         </div>
                         <Coins className="absolute -right-4 -bottom-4 w-24 h-24 text-black/10 -rotate-12" />
                      </div>
                   </div>

                   <div className="bg-page-bg/50 border border-text-main/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                         <Info className="w-4 h-4 text-accent" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-main italic">{t('subscription_status')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                         <span className="text-text-dim uppercase tracking-widest text-[10px]">{t('monthly_subscription')}</span>
                         <span className="text-green-500 font-black italic uppercase italic">Ativa (Standard)</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-card-bg rounded-[3rem] p-10 md:p-16 border border-text-main/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-24 h-24 bg-accent text-page-bg rounded-3xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-10 h-10" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-text-main italic uppercase tracking-tighter">{t('my_profile')}</h2>
                      <p className="text-sm font-bold text-text-dim uppercase tracking-[0.2em]">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('full_name')}</label>
                        <div className="relative">
                           <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40" />
                           <input 
                             type="text"
                             className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all"
                             placeholder="Ex: João da Silva"
                             value={profileFullName}
                             onChange={(e) => setProfileFullName(e.target.value)}
                           />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('birth_date')}</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <History className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/40" />
                            <input 
                              type="date"
                              className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all appearance-none"
                              value={profileBirthDate}
                              onChange={(e) => setProfileBirthDate(e.target.value)}
                            />
                          </div>
                          <div className="bg-text-main/5 border border-text-main/5 px-6 flex items-center justify-center rounded-2xl">
                             <div className="text-center">
                               <p className="text-[9px] font-black text-text-dim uppercase">{t('age')}</p>
                               <p className="text-xl font-black text-accent">{calculateAge(profileBirthDate) ?? '--'}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('student_objective')}</label>
                        <div className="relative">
                           <Target className="absolute left-5 top-8 w-4 h-4 text-text-dim/40" />
                           <textarea 
                             className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all min-h-[160px] resize-none"
                             placeholder="Ex: Hipertrofia e melhora no condicionamento físico..."
                             value={profileObjective}
                             onChange={(e) => setProfileObjective(e.target.value)}
                           />
                        </div>
                      </div>

                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="w-full bg-text-main text-page-bg font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-accent disabled:opacity-20 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                      >
                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSavingProfile ? t('saving') : t('update_profile')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Modal: Add Client */}
        <AnimatePresence>
          {showAddClientModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddClientModal(false)}
                className="absolute inset-0 bg-page-bg/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-card-bg border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl"
              >
                <h3 className="text-3xl font-black text-text-main italic uppercase tracking-tighter mb-8 text-center underline decoration-accent underline-offset-8">{t('new_student')}</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('full_name')}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                      <input 
                        type="text"
                        className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all uppercase italic"
                        placeholder={t('student_name_placeholder')}
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('email_optional')}</label>
                    <div className="relative">
                      <Info className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                      <input 
                        type="email"
                        className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all italic"
                        placeholder="email@aluno.com"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3 italic">{t('student_fee')}</label>
                    <div className="relative">
                      <Coins className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim/20" />
                      <input 
                        type="number"
                        className="w-full bg-page-bg border border-text-main/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-text-main focus:ring-1 focus:ring-accent focus:outline-none transition-all italic"
                        placeholder="150"
                        value={newClientFee}
                        onChange={(e) => setNewClientFee(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAddClient}
                    disabled={isAddingClient || !newClientName}
                    className="w-full bg-text-main text-page-bg font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-accent disabled:opacity-20 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                  >
                    {isAddingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {isAddingClient ? t('adding') : t('register_student')}
                  </button>

                  <button 
                    onClick={() => setShowAddClientModal(false)}
                    className="w-full text-[10px] font-black text-text-dim uppercase tracking-widest mt-2 hover:text-text-main transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Removed lower Save Success Feedback since it's now at the top */}

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-text-main/5 mt-20 flex flex-col md:flex-row items-center justify-between gap-6 text-text-dim/20 uppercase tracking-widest font-black text-[9px] relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-text-main/5 p-2 rounded">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="font-display font-bold tracking-tight">GU<span className="logo-fix">FIX</span> © 2024</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-accent cursor-help transition-colors">Digital Product</span>
          <span className="hover:text-accent cursor-help transition-colors">Biplex Protocol 2.0</span>
        </div>
      </footer>

      {/* Role Selection Overlay */}
      <AnimatePresence>
        {showRoleSelection && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-page-bg/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-card-bg border border-text-main/10 w-full max-w-xl rounded-[3rem] p-12 md:p-16 shadow-2xl text-center"
            >
              <div className="bg-accent/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/20">
                <Dumbbell className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-4xl font-display font-black text-text-main italic uppercase tracking-tighter mb-4 leading-none">
                {t('welcome_msg')}
              </h2>
              <p className="text-text-dim text-[11px] font-bold uppercase tracking-[0.2em] mb-12 italic opacity-60">
                GJ PERSONAL TRAINING SYSTEM v2.0
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => handleSetRole('personal')}
                  className="group relative overflow-hidden bg-text-main/5 hover:bg-accent border border-text-main/10 rounded-[2rem] p-8 transition-all active:scale-95"
                >
                  <Users className="w-8 h-8 text-accent group-hover:text-page-bg mb-4 mx-auto" />
                  <span className="block text-xl font-black uppercase italic tracking-tighter text-text-main group-hover:text-page-bg">{t('role_personal')}</span>
                  <span className="block text-[8px] font-bold text-text-dim/60 group-hover:text-page-bg/60 uppercase tracking-widest mt-1">{t('management_and_prescription')}</span>
                </button>
                <button 
                  onClick={() => handleSetRole('student')}
                  className="group relative overflow-hidden bg-text-main/5 hover:bg-accent border border-text-main/10 rounded-[2rem] p-8 transition-all active:scale-95"
                >
                  <Target className="w-8 h-8 text-accent group-hover:text-page-bg mb-4 mx-auto" />
                  <span className="block text-xl font-black uppercase italic tracking-tighter text-text-main group-hover:text-page-bg">{t('role_student')}</span>
                  <span className="block text-[8px] font-bold text-text-dim/60 group-hover:text-page-bg/60 uppercase tracking-widest mt-1">{t('workouts_and_results')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {/* Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-page-bg/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-card-bg border border-white/5 w-full max-w-sm rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
              
              <div className="relative mb-10">
                <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trash2 className="w-10 h-10 text-red-500" />
                  </motion.div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -z-0" />
              </div>

              <h3 className="text-3xl font-black text-text-main italic uppercase tracking-tighter mb-4 leading-none">
                {itemToDelete.type === 'workout' ? t('confirm_delete_title') : t('confirm_delete_exercise_title')}
              </h3>
              <p className="text-text-dim text-[11px] font-bold leading-relaxed mb-10 italic uppercase tracking-tight opacity-60">
                {itemToDelete.type === 'workout' ? t('confirm_delete_workout') : t('confirm_delete_exercise')}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={async () => {
                    if (itemToDelete.type === 'workout') {
                      await handleDeleteWorkout(itemToDelete.id);
                    } else {
                      await handleDeleteExercise(itemToDelete.id);
                    }
                    setItemToDelete(null);
                  }}
                  className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                >
                  {t('confirm_delete_btn')}
                </button>
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-text-main/5 text-text-dim hover:bg-text-main/10 transition-all active:scale-95"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Video Preview Modal */}
      <AnimatePresence>
        {videoPreviewUrl && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoPreviewUrl(null)}
              className="absolute inset-0 bg-page-bg/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setVideoPreviewUrl(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-red-500 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
              
              {videoPreviewUrl.includes('youtube.com') || videoPreviewUrl.includes('youtu.be') ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${videoPreviewUrl.split('v=')[1] || videoPreviewUrl.split('/').pop()}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={videoPreviewUrl} 
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Badge for Method */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 no-print">
        <div className="bg-card-bg/80 backdrop-blur-xl text-text-main px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-text-main/10 hover:border-accent/40 transition-all cursor-default">
           <Zap className="w-4 h-4 text-accent animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Status: <span className="text-accent">Live Prescription</span></span>
           <div className="h-1 w-8 bg-accent/20 rounded-full overflow-hidden">
             <motion.div 
               animate={{ x: [-32, 32] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               className="h-full w-full bg-accent"
             />
           </div>
        </div>
      </div>
    </div>
  );
}
