export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  role: UserRole;
  points: number;
  level: number;
  levelTitle: string;
  streak: number;
  avatar: string;
  pin?: string;
  isAllowed?: boolean; // Granted by Father
  accessCode?: string; // Quick passcode for the child
  status?: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type ProofType = 'photo' | 'video' | 'text' | 'any';

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: TaskDifficulty;
  assigneeType: 'specific' | 'all';
  assignedToUid?: string;
  assignedToName?: string;
  dueDate: string;
  proofType: ProofType;
  status: TaskStatus;
  startedAt?: string;
  submittedAt?: string;
  submissionProof?: string;
  submissionType?: string;
  rejectionReason?: string;
  evaluationRating?: number; // Father's 1-5 star rating
  evaluationFeedback?: string; // Father's encouraging note
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  createdAt: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'delivered';
  claimedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardPoints: number;
  type: 'weekly' | 'monthly' | 'special';
  endDate: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: UserRole;
  recipientType: 'all' | 'user';
  recipientId?: string;
  recipientName?: string;
  title: string;
  content: string;
  readBy?: string[]; // user IDs who have read it
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // user ID or 'all'
  title: string;
  message: string;
  type: 'task' | 'points' | 'message' | 'challenge' | 'reward' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  performerName: string;
  performerUid: string;
  actionType: 'add_points' | 'deduct_points' | 'approve_task' | 'reject_task' | 'create_task' | 'redeem_reward' | 'create_challenge' | 'system';
  targetUserName?: string;
  targetUid?: string;
  pointsDelta?: number;
  reason: string;
  createdAt: string;
}
