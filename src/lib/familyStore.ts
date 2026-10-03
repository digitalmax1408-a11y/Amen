import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  UserProfile, 
  Task, 
  Reward, 
  RewardClaim, 
  Challenge, 
  Message, 
  AppNotification, 
  AuditLog 
} from '../types';

export const DEFAULT_MEMBERS: UserProfile[] = [
  {
    uid: 'admin_father',
    name: 'الوالد (المدير)',
    email: 'anoooy14371437@gmail.com',
    role: 'admin',
    points: 0,
    level: 1,
    levelTitle: 'عميد العائلة 👑',
    streak: 1,
    avatar: '👨‍💼',
    isAllowed: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'member_omayah',
    name: 'أمية',
    role: 'member',
    points: 0,
    level: 1,
    levelTitle: 'فارس التحدي 🌟',
    streak: 1,
    avatar: '👦',
    isAllowed: true,
    accessCode: '1001',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'member_ayman',
    name: 'أيمن',
    role: 'member',
    points: 0,
    level: 1,
    levelTitle: 'المبادر النشيط ⚡',
    streak: 1,
    avatar: '🧑',
    isAllowed: true,
    accessCode: '1002',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'member_anas',
    name: 'أنس',
    role: 'member',
    points: 0,
    level: 1,
    levelTitle: 'النجم الصاعد 🚀',
    streak: 1,
    avatar: '🧒',
    isAllowed: true,
    accessCode: '1003',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  {
    title: 'أداء صلاة الفجر في وقتها مع الجماعة',
    description: 'المحافظة على صلاة الفجر في المسجد أو جماعة مع الأهل وكتابة تأكيد الإنجاز.',
    points: 0,
    difficulty: 'medium',
    assigneeType: 'all',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    proofType: 'text',
    status: 'pending',
    createdBy: 'admin_father',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: 'ترتيب وتنظيم الغرفة والمكتب بالكامل',
    description: 'تنظيم السرير، ترتيب الكتب والأدوات، ومسح سطح المكتب بصورة منظمة ومتقنة.',
    points: 0,
    difficulty: 'easy',
    assigneeType: 'specific',
    assignedToUid: 'member_omayah',
    assignedToName: 'أمية',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    proofType: 'photo',
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    createdBy: 'admin_father',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: 'قراءة جزء أو 10 صفحات من كتاب مفيد',
    description: 'قراءة مركزة مع كتابة سطرين تلخص أهم فائدة تعلمتها اليوم.',
    points: 0,
    difficulty: 'medium',
    assigneeType: 'specific',
    assignedToUid: 'member_ayman',
    assignedToName: 'أيمن',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    proofType: 'text',
    status: 'pending',
    createdBy: 'admin_father',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: 'مساعدة الوالدة في إعداد طاولة الغداء',
    description: 'المبادرة اللطيفة والمساعدة في تحضير وترتيب مائدة الطعام والتعاون الأسري.',
    points: 0,
    difficulty: 'easy',
    assigneeType: 'specific',
    assignedToUid: 'member_anas',
    assignedToName: 'أنس',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    proofType: 'any',
    status: 'submitted',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    submittedAt: new Date().toISOString(),
    submissionProof: 'قمت بمساعدة أمي في وضع الأطباق والملاعق وترتيب الأكواب.',
    submissionType: 'text',
    createdBy: 'admin_father',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_REWARDS: Omit<Reward, 'id'>[] = [
  {
    title: 'نزهة عائلية مميزة من اختيارك',
    description: 'اختيار وجهة النزهة الأسبوعية مع العائلة والأنشطة المحببة لك.',
    points: 300,
    icon: 'Car',
    category: 'رحلات وترفيه',
    stock: -1,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'اختيار وجبة العشاء المفضلة',
    description: 'تحديد مطعم العشاء أو الوجبة المنزلية المحببة لجميع أفراد الأسرة.',
    points: 150,
    icon: 'Utensils',
    category: 'طعام ومرح',
    stock: -1,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'ساعة إضافية لألعاب الفيديو أو الشاشة',
    description: 'وقت لعب إضافي في عطلة نهاية الأسبوع بعد إتمام المهام الدراسية والمنزلية.',
    points: 100,
    icon: 'Gamepad2',
    category: 'إلكترونيات',
    stock: -1,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'كتاب أو هدية تقديرية من الوالد',
    description: 'هدية خاصة يتم اختيارها وشراؤها لك تقديراً لالتزامك وتفوقك المستمر.',
    points: 250,
    icon: 'Gift',
    category: 'هدايا قيمة',
    stock: -1,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'يوم حر بدون مهام منزلية',
    description: 'إعفاء كامل من مهام ترتيب الصالة أو المائدة ليوم إجازة كامل.',
    points: 200,
    icon: 'Sparkles',
    category: 'امتيازات خاصة',
    stock: -1,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CHALLENGES: Omit<Challenge, 'id'>[] = [
  {
    title: 'تحدي الأسبوع: إنجاز 5 مهام بكفاءة',
    description: 'أكمل 5 مهام معتمدة من المدير خلال هذا الأسبوع واكسب المكافأة الذهبية الكبرى.',
    targetCount: 5,
    currentCount: 3,
    rewardPoints: 200,
    type: 'weekly',
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    isActive: true,
  },
  {
    title: 'تحدي القراءة الشهري: 4 كتب أو ملخصات',
    description: 'قراءة مستمرة واكتساب مهارات جديدة مع نقاش عائلي هادف في نهاية الشهر.',
    targetCount: 4,
    currentCount: 1,
    rewardPoints: 350,
    type: 'monthly',
    endDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
    isActive: true,
  },
];

export const DEFAULT_MESSAGES: Omit<Message, 'id'>[] = [
  {
    senderId: 'admin_father',
    senderName: 'الوالد (المدير)',
    senderRole: 'admin',
    recipientType: 'all',
    title: 'مرحباً بجميع أفراد الأسرة في تحدّي العائلة 🏆',
    content: 'فخور بكم جميعاً وبهمتكم العالية. هذا التطبيق صُمم لنبني عادات عظيمة ونتنافس بروح المحبة والتقدير. تنتظركم مكافآت وجوائز قيمة في متجر الجوائز!',
    readBy: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    senderId: 'admin_father',
    senderName: 'الوالد (المدير)',
    senderRole: 'admin',
    recipientType: 'user',
    recipientId: 'member_omayah',
    recipientName: 'أمية',
    title: 'ملاحظة تشجيعية ممتازة',
    content: 'أحسنت في التزامك بالأمس يا أمية، استمر بنفس الروح الرائعة وستحصل على مكافأة التحدي قريباً.',
    readBy: ['member_omayah'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// Helper to seed initial collections if database is empty
export async function seedInitialDatabaseIfNeeded() {
  const usersPath = 'users';
  try {
    const snap = await getDocs(collection(db, usersPath));
    if (snap.empty) {
      console.log('Seeding initial family challenge database...');
      // Seed Users
      for (const user of DEFAULT_MEMBERS) {
        await setDoc(doc(db, 'users', user.uid), user);
      }
      // Seed Tasks
      for (let i = 0; i < DEFAULT_TASKS.length; i++) {
        const taskId = `task_${Date.now()}_${i}`;
        await setDoc(doc(db, 'tasks', taskId), { ...DEFAULT_TASKS[i], id: taskId });
      }
      // Seed Rewards
      for (let i = 0; i < DEFAULT_REWARDS.length; i++) {
        const rewardId = `reward_${Date.now()}_${i}`;
        await setDoc(doc(db, 'rewards', rewardId), { ...DEFAULT_REWARDS[i], id: rewardId });
      }
      // Seed Challenges
      for (let i = 0; i < DEFAULT_CHALLENGES.length; i++) {
        const chId = `ch_${Date.now()}_${i}`;
        await setDoc(doc(db, 'challenges', chId), { ...DEFAULT_CHALLENGES[i], id: chId });
      }
      // Seed Messages
      for (let i = 0; i < DEFAULT_MESSAGES.length; i++) {
        const msgId = `msg_${Date.now()}_${i}`;
        await setDoc(doc(db, 'messages', msgId), { ...DEFAULT_MESSAGES[i], id: msgId });
      }
      // Seed Initial Notification
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: 'all',
        title: 'انطلاق تحدّي العائلة!',
        message: 'تم إطلاق تحديات ومهام جديدة، تصفح مهامك واكسب أولى نقاطك الآن ⭐',
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      // Seed Audit Log
      const auditId = `audit_${Date.now()}`;
      await setDoc(doc(db, 'auditLogs', auditId), {
        id: auditId,
        performerName: 'النظام',
        performerUid: 'system',
        actionType: 'system',
        reason: 'تهيئة نظام تحدّي العائلة وإعداد حسابات أفراد الأسرة',
        createdAt: new Date().toISOString(),
      });
      console.log('Family database seeded successfully.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, usersPath);
  }
}

// Subscriptions
export function subscribeUsers(callback: (users: UserProfile[]) => void) {
  const path = 'users';
  return onSnapshot(collection(db, path), (snap) => {
    const list: UserProfile[] = [];
    snap.forEach((d) => list.push(d.data() as UserProfile));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeTasks(callback: (tasks: Task[]) => void) {
  const path = 'tasks';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list: Task[] = [];
    snap.forEach((d) => list.push(d.data() as Task));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeRewards(callback: (rewards: Reward[]) => void) {
  const path = 'rewards';
  return onSnapshot(collection(db, path), (snap) => {
    const list: Reward[] = [];
    snap.forEach((d) => list.push(d.data() as Reward));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeClaims(callback: (claims: RewardClaim[]) => void) {
  const path = 'claims';
  return onSnapshot(collection(db, path), (snap) => {
    const list: RewardClaim[] = [];
    snap.forEach((d) => list.push(d.data() as RewardClaim));
    callback(list.sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeChallenges(callback: (challenges: Challenge[]) => void) {
  const path = 'challenges';
  return onSnapshot(collection(db, path), (snap) => {
    const list: Challenge[] = [];
    snap.forEach((d) => list.push(d.data() as Challenge));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeMessages(callback: (messages: Message[]) => void) {
  const path = 'messages';
  return onSnapshot(collection(db, path), (snap) => {
    const list: Message[] = [];
    snap.forEach((d) => list.push(d.data() as Message));
    callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeNotifications(callback: (notifications: AppNotification[]) => void) {
  const path = 'notifications';
  return onSnapshot(collection(db, path), (snap) => {
    const list: AppNotification[] = [];
    snap.forEach((d) => list.push(d.data() as AppNotification));
    callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const path = 'auditLogs';
  return onSnapshot(collection(db, path), (snap) => {
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push(d.data() as AuditLog));
    callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

// Task Actions
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const path = 'tasks';
  const id = `task_${Date.now()}`;
  const now = new Date().toISOString();
  const newTask: Task = {
    ...taskData,
    id,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(doc(db, path, id), newTask);
    // Send Notification to assignee
    await sendNotification({
      userId: taskData.assigneeType === 'all' ? 'all' : taskData.assignedToUid || 'all',
      title: 'مهمة عائلية جديدة 📋',
      message: `أضاف الوالد مهمة جديدة: «${taskData.title}» برصيد ${taskData.points} نقطة.`,
      type: 'task',
      isRead: false,
      createdAt: now,
    });
    // Log Audit
    await addAuditLog({
      performerName: 'الوالد (المدير)',
      performerUid: taskData.createdBy,
      actionType: 'create_task',
      targetUserName: taskData.assigneeType === 'all' ? 'الجميع' : taskData.assignedToName,
      targetUid: taskData.assignedToUid,
      pointsDelta: taskData.points,
      reason: `إنشاء مهمة: ${taskData.title}`,
      createdAt: now,
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function startTask(taskId: string) {
  const path = `tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitTaskProof(
  taskId: string, 
  proof: string, 
  submissionType: string,
  user: UserProfile
) {
  const path = `tasks/${taskId}`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'submitted',
      submissionProof: proof,
      submissionType,
      submittedAt: now,
      updatedAt: now,
    });
    // Notify admin
    await sendNotification({
      userId: 'admin_father',
      title: 'طلب اعتماد إنجاز مهمة ✨',
      message: `أنجز ${user.name} المهمة وينتظر اعتمادك لإضافة النقاط.`,
      type: 'task',
      isRead: false,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function approveTask(
  task: Task, 
  adminUser: UserProfile,
  evaluation?: {
    awardedPoints: number;
    rating?: number;
    feedback?: string;
  }
) {
  const path = `tasks/${task.id}`;
  const now = new Date().toISOString();
  const pointsToAdd = evaluation !== undefined ? Number(evaluation.awardedPoints) : (task.points || 0);
  const rating = evaluation?.rating || 5;
  const feedback = evaluation?.feedback || '';

  try {
    // 1. Update task status with father's evaluation
    await updateDoc(doc(db, 'tasks', task.id), {
      status: 'approved',
      points: pointsToAdd,
      evaluationRating: rating,
      evaluationFeedback: feedback,
      updatedAt: now,
    });

    // 2. Add evaluated points to target user
    if (task.assignedToUid && pointsToAdd > 0) {
      await adjustUserPoints(
        task.assignedToUid, 
        pointsToAdd, 
        'approve_task', 
        adminUser, 
        `تقييم واعتماد مهمة: ${task.title} (${rating} نجوم ⭐ | +${pointsToAdd} نقطة)`
      );
    }

    // 3. Send congratulatory notification
    await sendNotification({
      userId: task.assignedToUid || 'all',
      title: 'تم تقييم واعتماد إنجازك! 🎉',
      message: `قيّم الوالد إنجازك لمهمة «${task.title}» بـ (${rating} ⭐) ومنحك ${pointsToAdd} نقطة! ${feedback ? `ملاحظة الوالد: ${feedback}` : ''}`,
      type: 'points',
      isRead: false,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function resetAllMembersPointsToZero(adminUser: UserProfile) {
  const path = 'users';
  const now = new Date().toISOString();
  try {
    const snap = await getDocs(collection(db, 'users'));
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'users', d.id), {
        points: 0,
        level: 1,
        levelTitle: 'المستوى الأول 🌟',
        updatedAt: now,
      });
    }
    await addAuditLog({
      performerName: adminUser.name,
      performerUid: adminUser.uid,
      actionType: 'system',
      reason: 'تصفير نقاط جميع الأبناء لبدء التقييم من الصفر بقرار الوالد',
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rejectTask(task: Task, reason: string, adminUser: UserProfile) {
  const path = `tasks/${task.id}`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'tasks', task.id), {
      status: 'rejected',
      rejectionReason: reason || 'يرجى استكمال متطلبات المهمة وإعادة الإرسال',
      updatedAt: now,
    });
    // Notify member
    await sendNotification({
      userId: task.assignedToUid || 'all',
      title: 'تنبيه بشأن المهمة ⚠️',
      message: `تمت مراجعة مهمة «${task.title}» من الوالد: ${reason || 'يرجى مراجعة المتطلبات'}`,
      type: 'task',
      isRead: false,
      createdAt: now,
    });
    // Audit Log
    await addAuditLog({
      performerName: adminUser.name,
      performerUid: adminUser.uid,
      actionType: 'reject_task',
      targetUserName: task.assignedToName,
      targetUid: task.assignedToUid,
      reason: `رفض مهمة (${task.title}): ${reason}`,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(taskId: string) {
  const path = `tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Points Management
export async function adjustUserPoints(
  targetUid: string, 
  delta: number, 
  actionType: 'add_points' | 'deduct_points' | 'approve_task' | 'redeem_reward',
  performer: UserProfile, 
  reason: string
) {
  const path = `users/${targetUid}`;
  const now = new Date().toISOString();
  try {
    const snap = await getDocs(query(collection(db, 'users')));
    let targetDoc: UserProfile | null = null;
    snap.forEach((d) => {
      if (d.data().uid === targetUid) targetDoc = d.data() as UserProfile;
    });

    if (targetDoc) {
      const newPoints = Math.max(0, ((targetDoc as UserProfile).points || 0) + delta);
      const newLevel = Math.max(1, Math.floor(newPoints / 100) + 1);
      
      let levelTitle = (targetDoc as UserProfile).levelTitle;
      if (newLevel === 1) levelTitle = 'المبادر النشيط ⚡';
      else if (newLevel === 2) levelTitle = 'النجم الصاعد 🚀';
      else if (newLevel === 3) levelTitle = 'فارس التحدي 🌟';
      else if (newLevel >= 4) levelTitle = 'بطل العائلة الذهبي 👑';

      await updateDoc(doc(db, 'users', targetUid), {
        points: newPoints,
        level: newLevel,
        levelTitle,
        updatedAt: now,
      });

      // Send Notification to user
      const isPositive = delta > 0;
      await sendNotification({
        userId: targetUid,
        title: isPositive ? 'إضافة نقاط جديدة ⭐' : 'تعديل في رصيد النقاط',
        message: isPositive 
          ? `مبروك! تمت إضافة ${delta} نقطة إلى رصيدك (${reason}).`
          : `تم خصم ${Math.abs(delta)} نقطة من رصيدك (${reason}).`,
        type: 'points',
        isRead: false,
        createdAt: now,
      });

      // Audit Log
      await addAuditLog({
        performerName: performer.name,
        performerUid: performer.uid,
        actionType,
        targetUserName: (targetDoc as UserProfile).name,
        targetUid,
        pointsDelta: delta,
        reason,
        createdAt: now,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Rewards Store
export async function createReward(reward: Omit<Reward, 'id' | 'createdAt'>) {
  const path = 'rewards';
  const id = `reward_${Date.now()}`;
  try {
    await setDoc(doc(db, path, id), {
      ...reward,
      id,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReward(rewardId: string) {
  const path = `rewards/${rewardId}`;
  try {
    await deleteDoc(doc(db, 'rewards', rewardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function claimReward(reward: Reward, user: UserProfile) {
  if (user.points < reward.points) {
    throw new Error('رصيدك من النقاط غير كافٍ لاستبدال هذه الجائزة.');
  }
  const path = 'claims';
  const id = `claim_${Date.now()}`;
  const now = new Date().toISOString();
  try {
    const claim: RewardClaim = {
      id,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsSpent: reward.points,
      userId: user.uid,
      userName: user.name,
      status: 'pending',
      claimedAt: now,
    };
    await setDoc(doc(db, path, id), claim);

    // Deduct points
    await adjustUserPoints(
      user.uid, 
      -reward.points, 
      'redeem_reward', 
      user, 
      `استبدال جائزة: ${reward.title}`
    );

    // Notify admin
    await sendNotification({
      userId: 'admin_father',
      title: 'طلب استبدال جائزة جديد 🎁',
      message: `طلب ${user.name} استبدال «${reward.title}» مقابل ${reward.points} نقطة.`,
      type: 'reward',
      isRead: false,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deliverClaim(claimId: string, adminUser: UserProfile) {
  const path = `claims/${claimId}`;
  try {
    await updateDoc(doc(db, 'claims', claimId), {
      status: 'delivered',
    });
    // Log
    await addAuditLog({
      performerName: adminUser.name,
      performerUid: adminUser.uid,
      actionType: 'redeem_reward',
      reason: `تسليم الجائزة للمستفيد بنجاح`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Challenges
export async function createChallenge(challenge: Omit<Challenge, 'id'>) {
  const path = 'challenges';
  const id = `ch_${Date.now()}`;
  try {
    await setDoc(doc(db, path, id), {
      ...challenge,
      id,
    });
    await sendNotification({
      userId: 'all',
      title: 'تحدي عائلي جديد! 🔥',
      message: `أطلق الوالد تحدياً جديداً: «${challenge.title}» بمكافأة +${challenge.rewardPoints} نقطة!`,
      type: 'challenge',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Internal Messages
export async function sendMessage(msg: Omit<Message, 'id' | 'createdAt' | 'readBy'>) {
  const path = 'messages';
  const id = `msg_${Date.now()}`;
  const now = new Date().toISOString();
  try {
    await setDoc(doc(db, path, id), {
      ...msg,
      id,
      readBy: [],
      createdAt: now,
    });
    // Send Notification
    await sendNotification({
      userId: msg.recipientType === 'all' ? 'all' : (msg.recipientId || 'all'),
      title: `رسالة جديدة من ${msg.senderName} ✉️`,
      message: msg.title || msg.content.slice(0, 60),
      type: 'message',
      isRead: false,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markMessageRead(messageId: string, userId: string, currentReadBy: string[] = []) {
  if (currentReadBy.includes(userId)) return;
  const path = `messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      readBy: [...currentReadBy, userId],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Notifications
export async function sendNotification(notif: Omit<AppNotification, 'id'>) {
  const path = 'notifications';
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  try {
    await setDoc(doc(db, path, id), {
      ...notif,
      id,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationRead(notifId: string) {
  const path = `notifications/${notifId}`;
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      isRead: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Audit Logs
export async function addAuditLog(log: Omit<AuditLog, 'id'>) {
  const path = 'auditLogs';
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  try {
    await setDoc(doc(db, path, id), {
      ...log,
      id,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Profiles
export async function toggleUserPermission(userId: string, isAllowed: boolean, adminUser: UserProfile) {
  const path = `users/${userId}`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'users', userId), {
      isAllowed,
      status: isAllowed ? 'active' : 'suspended',
      updatedAt: now,
    });
    // Log in audit log
    await addAuditLog({
      performerName: adminUser.name,
      performerUid: adminUser.uid,
      actionType: 'system',
      targetUid: userId,
      reason: isAllowed ? 'منح الإذن والسماح بالدخول للتطبيق' : 'تعليق الإذن بالدخول للتطبيق',
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserAccessCode(userId: string, accessCode: string) {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      accessCode,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addNewMember(member: { name: string; avatar: string; initialPoints?: number; accessCode?: string; isAllowed?: boolean }) {
  const path = 'users';
  const uid = `member_${Date.now()}`;
  const now = new Date().toISOString();
  const points = member.initialPoints || 100;
  const newProfile: UserProfile = {
    uid,
    name: member.name,
    role: 'member',
    points,
    level: 1,
    levelTitle: 'عضو جديد 🌟',
    streak: 1,
    avatar: member.avatar || '👦',
    isAllowed: member.isAllowed !== undefined ? member.isAllowed : true,
    accessCode: member.accessCode || Math.floor(1000 + Math.random() * 9000).toString(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(doc(db, path, uid), newProfile);
    await addAuditLog({
      performerName: 'الوالد (المدير)',
      performerUid: 'admin_father',
      actionType: 'system',
      targetUserName: member.name,
      targetUid: uid,
      pointsDelta: points,
      reason: `إضافة فرد جديد للأسرة: ${member.name} وتفعيل الإذن`,
      createdAt: now,
    });
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveGoogleUserToFamily(user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }) {
  const path = 'users';
  try {
    const isFather = user.email === 'anoooy14371437@gmail.com';
    const profile: UserProfile = {
      uid: user.uid,
      name: user.displayName || (isFather ? 'الوالد (المدير)' : 'عضو في العائلة'),
      email: user.email || undefined,
      role: isFather ? 'admin' : 'member',
      points: isFather ? 1000 : 250,
      level: isFather ? 10 : 2,
      levelTitle: isFather ? 'عميد العائلة 👑' : 'المبادر النشيط ⚡',
      streak: 5,
      avatar: user.photoURL || (isFather ? '👨‍💼' : '🧑'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, path, user.uid), profile, { merge: true });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
