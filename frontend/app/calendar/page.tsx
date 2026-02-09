'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Boss } from '@/types';
import { bossApi } from '@/lib/api';
import PasswordModal from '@/components/PasswordModal';
import EditBossModal from '@/components/EditBossModal';

export default function CalendarPage() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [password, setPassword] = useState('');

  const fetchBosses = async () => {
    try {
      const data = await bossApi.getAllBosses();
      setBosses(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load bosses');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBosses();
  }, []);

  const events = bosses
    .filter((boss) => boss.nextSpawnAt)
    .map((boss) => ({
      id: boss.id.toString(),
      title: boss.name,
      start: boss.nextSpawnAt!,
      backgroundColor: boss.attackType === 'melee' ? '#ef4444' : '#a855f7',
      borderColor: boss.attackType === 'melee' ? '#dc2626' : '#9333ea',
      extendedProps: {
        boss,
      },
    }));

  const handleEventClick = (info: any) => {
    const boss = info.event.extendedProps.boss as Boss;
    setSelectedBoss(boss);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (pwd: string): Promise<boolean> => {
    const isValid = await bossApi.checkPassword(pwd);
    if (isValid) {
      setPassword(pwd);
      setShowPasswordModal(false);
      setShowEditModal(true);
    }
    return isValid;
  };

  const handleSaveEdit = async (updates: any) => {
    if (!selectedBoss || !password) return;

    try {
      await bossApi.updateBoss(selectedBoss.id, password, updates);
      await fetchBosses();
      setSelectedBoss(null);
      setPassword('');
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Boss Spawn Calendar</h1>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          ← Back to List
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="mb-4 flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-melee rounded"></div>
            <span className="text-sm">Melee</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-magic rounded"></div>
            <span className="text-sm">Magic</span>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }}
        />
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedBoss(null);
        }}
        onSubmit={handlePasswordSubmit}
        title="Enter Password to Edit"
      />

      {selectedBoss && (
        <EditBossModal
          boss={selectedBoss}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBoss(null);
            setPassword('');
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
