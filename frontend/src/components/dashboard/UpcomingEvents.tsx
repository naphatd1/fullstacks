'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Dot
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  attendees?: number;
  type: 'meeting' | 'deadline' | 'event' | 'reminder';
  color: string;
}

const EventItem: React.FC<{ event: Event }> = ({ event }) => {
  const getTypeColor = () => {
    switch (event.type) {
      case 'meeting':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'deadline':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'event':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'reminder':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'meeting':
        return 'ประชุม';
      case 'deadline':
        return 'กำหนดส่ง';
      case 'event':
        return 'กิจกรรม';
      case 'reminder':
        return 'เตือนความจำ';
      default:
        return 'อื่นๆ';
    }
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor()}`}>
              {getTypeLabel()}
            </span>
          </div>
          
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {event.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {event.description}
          </p>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>{event.date} • {event.time}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3 mr-1" />
                <span>{event.attendees} คน</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpcomingEvents: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock events data
  const events: Event[] = [
    {
      id: '1',
      title: 'ประชุมทีมพัฒนา',
      description: 'ประชุมรายสัปดาห์เพื่อติดตามความคืบหน้าโปรเจค',
      date: '15 ก.พ. 2025',
      time: '10:00 น.',
      location: 'ห้องประชุม A',
      attendees: 8,
      type: 'meeting',
      color: 'bg-blue-500',
    },
    {
      id: '2',
      title: 'ส่งรายงานประจำเดือน',
      description: 'ส่งรายงานสรุปผลงานประจำเดือนกุมภาพันธ์',
      date: '20 ก.พ. 2025',
      time: '17:00 น.',
      type: 'deadline',
      color: 'bg-red-500',
    },
    {
      id: '3',
      title: 'Workshop UX/UI Design',
      description: 'เวิร์คช็อปการออกแบบ User Experience และ User Interface',
      date: '22 ก.พ. 2025',
      time: '13:00 น.',
      location: 'ห้องอบรม B',
      attendees: 25,
      type: 'event',
      color: 'bg-green-500',
    },
    {
      id: '4',
      title: 'อัปเดตระบบ',
      description: 'อัปเดตระบบและตรวจสอบการทำงาน',
      date: '25 ก.พ. 2025',
      time: '02:00 น.',
      type: 'reminder',
      color: 'bg-yellow-500',
    },
  ];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            กิจกรรมที่กำลังจะมาถึง
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            กิจกรรมและนัดหมายในอนาคต
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <span className="text-sm font-medium text-gray-900 dark:text-white px-3">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {events.length > 0 ? (
          events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              ไม่มีกิจกรรมที่กำลังจะมาถึง
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              เพิ่มกิจกรรมใหม่เพื่อติดตามงานของคุณ
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {events.filter(e => e.type === 'meeting').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">ประชุม</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {events.filter(e => e.type === 'deadline').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">กำหนดส่ง</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {events.filter(e => e.type === 'event').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">กิจกรรม</p>
          </div>
        </div>
      </div>
    </div>
  );
};