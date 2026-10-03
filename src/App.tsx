/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, testConnection } from './lib/firebase';
import { 
  seedInitialDatabaseIfNeeded, 
  subscribeUsers, 
  subscribeTasks, 
  subscribeRewards, 
  subscribeClaims, 
  subscribeChallenges, 
  subscribeMessages, 
  subscribeNotifications, 
  subscribeAuditLogs,
  DEFAULT_MEMBERS
} from './lib/familyStore';
import { triggerCelebration } from './lib/celebration';
import { sendBrowserNotification } from './lib/notifications';
import { 
  UserProfile, 
  Task, 
  Reward, 
  RewardClaim, 
  Challenge, 
  Message, 
  AppNotification, 
  AuditLog 
} from './types';

import { Header } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RewardsStore } from './components/RewardsStore';
import { ChallengesView } from './components/ChallengesView';
import { LeaderboardView } from './components/LeaderboardView';
import { MessagesView } from './components/MessagesView';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { CelebrationModal } from './components/CelebrationModal';
import { TaskAlertModal } from './components/TaskAlertModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ShieldAlert, Trophy, Heart } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_MEMBERS);
  // Default to Admin / Father as requested by user
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_MEMBERS[0]);
  const [appMode, setAppMode] = useState<'admin' | 'user'>('admin');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [activeTab, setActiveTab] = useState<string>('admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [alertTask, setAlertTask] = useState<Task | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const dismissedTaskIdsRef = useRef<Set<string>>(new Set());

  // Browser Notifications Tracking
  const initialNotifsLoadedRef = useRef(false);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const initialTasksLoadedRef = useRef(false);
  const taskStatusesRef = useRef<Map<string, string>>(new Map());

  const [celebrationData, setCelebrationData] = useState<{
    show: boolean;
    points: number;
    message?: string;
  }>({ show: false, points: 0 });

  const prevPointsRef = useRef<number>(currentUser.points);

  // 1. Initial boot & database seeding
  useEffect(() => {
    testConnection();
    seedInitialDatabaseIfNeeded();

    // Check if URL indicates Kids / User App mode: e.g. ?app=kids or ?user=member_omayah
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    const userParam = params.get('user');

    if (appParam === 'kids' || appParam === 'user' || userParam) {
      setAppMode('user');
      if (userParam) {
        const target = DEFAULT_MEMBERS.find((u) => u.uid === userParam);
        if (target) {
          setCurrentUser(target);
        }
      } else {
        // Default child for Kids App
        setCurrentUser(DEFAULT_MEMBERS[1]);
      }
      setActiveTab('home');
    } else {
      // Default to Admin / Father app mode!
      setAppMode('admin');
      setCurrentUser(DEFAULT_MEMBERS[0]);
      setActiveTab('admin');
    }
  }, []);

  // 2. Realtime listeners
  useEffect(() => {
    const unsubUsers = subscribeUsers((userList) => {
      if (userList.length > 0) {
        setUsers(userList);
        // Sync current user state if already selected
        setCurrentUser((prev) => {
          const updated = userList.find((u) => u.uid === prev.uid);
          return updated || prev;
        });
      }
    });

    const unsubTasks = subscribeTasks((taskList) => {
      setTasks(taskList);
      if (!initialTasksLoadedRef.current) {
        taskList.forEach((t) => taskStatusesRef.current.set(t.id, t.status));
        initialTasksLoadedRef.current = true;
      } else {
        taskList.forEach((t) => {
          const oldStatus = taskStatusesRef.current.get(t.id);
          taskStatusesRef.current.set(t.id, t.status);

          // 1. If brand-new task assigned to this user or all
          if (!oldStatus && (t.assigneeType === 'all' || t.assignedToUid === currentUser.uid)) {
            if (currentUser.role !== 'admin') {
              sendBrowserNotification(`📋 مهمة جديدة من الوالد: ${t.title}`, {
                body: `المكافأة: +${t.points} نقطة ⭐ | موعد التسليم: ${t.dueDate}`,
                tag: `task_new_${t.id}`,
              });
            }
          }

          // 2. If task was approved by father
          if (oldStatus && oldStatus !== 'approved' && t.status === 'approved') {
            if (t.assignedToUid === currentUser.uid || t.assigneeType === 'all') {
              sendBrowserNotification(`🎉 تم اعتماد إنجازك بنجاح!`, {
                body: `اعتمد الوالد مهمة «${t.title}» وتمت إضافة +${t.points} نقطة إلى رصيدك!`,
                tag: `task_app_${t.id}`,
              });
            }
          }
        });
      }
    });

    const unsubRewards = subscribeRewards(setRewards);
    const unsubClaims = subscribeClaims(setClaims);
    const unsubChallenges = subscribeChallenges(setChallenges);
    const unsubMessages = subscribeMessages(setMessages);

    const unsubNotifs = subscribeNotifications((notifList) => {
      setNotifications(notifList);
      if (!initialNotifsLoadedRef.current) {
        notifList.forEach((n) => seenNotifIdsRef.current.add(n.id));
        initialNotifsLoadedRef.current = true;
      } else {
        notifList.forEach((n) => {
          if (!seenNotifIdsRef.current.has(n.id)) {
            seenNotifIdsRef.current.add(n.id);
            if (n.userId === 'all' || n.userId === currentUser.uid) {
              sendBrowserNotification(n.title, {
                body: n.message,
                tag: `notif_${n.id}`,
              });
            }
          }
        });
      }
    });

    const unsubLogs = subscribeAuditLogs(setAuditLogs);

    return () => {
      unsubUsers();
      unsubTasks();
      unsubRewards();
      unsubClaims();
      unsubChallenges();
      unsubMessages();
      unsubNotifs();
      unsubLogs();
    };
  }, []);

  // 3. Listen to Firebase Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If email matches father, switch to father admin
        const matched = users.find(
          (u) => u.uid === firebaseUser.uid || (firebaseUser.email && u.email === firebaseUser.email)
        );
        if (matched) {
          setCurrentUser(matched);
        }
      }
    });
    return () => unsubAuth();
  }, [users]);

  // 4. Point increase celebration observer
  useEffect(() => {
    if (currentUser.points > prevPointsRef.current) {
      const diff = currentUser.points - prevPointsRef.current;
      setCelebrationData({
        show: true,
        points: diff,
        message: `مبروك! تمت إضافة ${diff} نقطة إلى رصيدك.`,
      });
      triggerCelebration(diff);
    }
    prevPointsRef.current = currentUser.points;
  }, [currentUser.points]);

  // 5. In-app new task alert notification for children
  useEffect(() => {
    if (currentUser.role !== 'admin' && tasks.length > 0) {
      const myPendingTasks = tasks.filter(
        (t) => (t.assigneeType === 'all' || t.assignedToUid === currentUser.uid) && 
               t.status === 'pending' &&
               !dismissedTaskIdsRef.current.has(t.id)
      );
      if (myPendingTasks.length > 0) {
        setAlertTask(myPendingTasks[0]);
      }
    }
  }, [tasks, currentUser]);

  const isAdmin = currentUser.role === 'admin';

  // Handle toggling between Admin App and User/Kids App
  const handleToggleAppMode = (mode: 'admin' | 'user') => {
    setAppMode(mode);
    if (mode === 'admin') {
      setCurrentUser(DEFAULT_MEMBERS[0]);
      setActiveTab('admin');
    } else {
      const firstChild = users.find((u) => u.role !== 'admin') || DEFAULT_MEMBERS[1];
      setCurrentUser(firstChild);
      setActiveTab('home');
    }
  };

  // Handle switching user
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    prevPointsRef.current = user.points;
    if (user.role === 'admin') {
      setAppMode('admin');
      setActiveTab('admin');
    } else {
      setAppMode('user');
      if (activeTab === 'admin') {
        setActiveTab('home');
      }
    }
  };

  const unreadMessagesCount = messages.filter(
    (m) => m.senderId !== currentUser.uid && (!m.readBy || !m.readBy.includes(currentUser.uid))
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F9FD] text-[#0F2847] flex flex-col font-['IBM_Plex_Sans_Arabic',_'Cairo',_sans-serif]">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        notifications={notifications}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchUser={handleSwitchUser}
        availableUsers={users}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        
        {/* Permission Guard for Member */}
        {!isAdmin && currentUser.isAllowed === false ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-rose-100 shadow-sm max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              🛡️
            </div>
            <h2 className="text-xl font-extrabold text-[#0F2847] mb-2">
              بانتظار موافقة وسماح الوالد
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              أهلاً بك يا <strong>{currentUser.name}</strong>. حسابك مسجل بنجاح، لكن الدخول يتطلب تفعيل الإذن والسماح لك من الوالد (المدير) من لوحة تحكم المدير.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-sm hover:bg-sky-700 transition-all"
              >
                تبديل الحساب أو دخول الوالد
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB: HOME / DASHBOARD */}
            {activeTab === 'home' && (
              <UserDashboard
                currentUser={currentUser}
                tasks={tasks}
                challenges={challenges}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* TAB: TASKS */}
            {activeTab === 'tasks' && (
              <UserDashboard
                currentUser={currentUser}
                tasks={tasks}
                challenges={challenges}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* TAB: REWARDS STORE */}
            {activeTab === 'rewards' && (
              <RewardsStore
                currentUser={currentUser}
                rewards={rewards}
                claims={claims}
                isAdmin={isAdmin}
              />
            )}

            {/* TAB: CHALLENGES */}
            {activeTab === 'challenges' && (
              <ChallengesView
                challenges={challenges}
                currentUser={currentUser}
                tasks={tasks}
              />
            )}

            {/* TAB: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <LeaderboardView
                users={users}
                tasks={tasks}
                currentUser={currentUser}
              />
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
              <MessagesView
                currentUser={currentUser}
                messages={messages}
                users={users}
              />
            )}

            {/* TAB: ADMIN (PROTECTED) */}
            {activeTab === 'admin' && (
              isAdmin ? (
                <AdminDashboard
                  currentUser={currentUser}
                  users={users}
                  tasks={tasks}
                  rewards={rewards}
                  claims={claims}
                  challenges={challenges}
                  messages={messages}
                  notifications={notifications}
                  auditLogs={auditLogs}
                />
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 shadow-sm max-w-md mx-auto my-12">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-[#0F2847] mb-2">
                    لوحة المدير محمية
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    هذه اللوحة مخصصة للوالد (المدير) فقط لإدارة المهام والنقاط والجوائز. يرجى تسجيل الدخول بحساب الوالد للوصول.
                  </p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="py-2.5 px-6 rounded-xl bg-sky-600 text-white font-bold text-xs"
                  >
                    تسجيل دخول الوالد
                  </button>
                </div>
              )
            )}
          </>
        )}

      </main>

      {/* Classic Modern Footer */}
      <footer className="mt-auto border-t border-sky-100 bg-white/70 py-6 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-[#0F2847]">
            <Trophy className="w-4 h-4 text-sky-600" />
            <span>🏆 تحدّي العائلة</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal text-[11px]">
              غرس القيم، صناعة الهمم، وتحقيق التميز الأسري
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>صُمم بعناية وفخامة للأسرة المتميزة</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        unreadMessagesCount={unreadMessagesCount}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
      />

      {/* Auth / Profile Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        availableUsers={users}
        onSelectUser={handleSwitchUser}
        currentUser={currentUser}
      />

      {/* Celebration Modal on Points Award */}
      {celebrationData.show && (
        <CelebrationModal
          points={celebrationData.points}
          message={celebrationData.message}
          onClose={() => setCelebrationData({ show: false, points: 0 })}
        />
      )}

      {/* In-App Task Alert Modal for Child */}
      {alertTask && (
        <TaskAlertModal
          task={alertTask}
          onOpenTask={(t) => {
            setSelectedTaskForDetail(t);
            setAlertTask(null);
            setActiveTab('tasks');
          }}
          onClose={() => {
            if (alertTask) dismissedTaskIdsRef.current.add(alertTask.id);
            setAlertTask(null);
          }}
        />
      )}

      {/* Task Details Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}
