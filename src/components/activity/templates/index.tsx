import React from 'react';
import { Activity } from '@prisma/client';
import { format, parseISO } from 'date-fns';
import { CalendarDays, MapPin, Clock, Users, Target, Trophy, Book, Tag } from 'lucide-react';

interface ActivityTemplateProps {
  activity: Activity;
  design: string;
}

const formatDateTime = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'EEEE, MMMM do yyyy, h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const formatLocation = (location: any) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  
  const parts = [];
  if (location.address) parts.push(location.address);
  if (location.city) parts.push(location.city);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ');
};

export const ActivityTemplate: React.FC<ActivityTemplateProps> = ({ activity, design }) => {
  const templates = {
    modern: (
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{activity.title}</h1>
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-gray-600">{activity.description}</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <CalendarDays className="w-5 h-5" />
            <span>{formatDateTime(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="w-5 h-5" />
              <span>{formatLocation(activity.location)}</span>
            </div>
          )}
        </div>
      </div>
    ),

    classic: (
      <div className="bg-cream border-4 border-double border-gray-800 p-10 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-serif text-gray-900 mb-6">{activity.title}</h1>
        <div className="mb-8 font-serif text-gray-700">{activity.description}</div>
        <div className="space-y-4 font-serif">
          <div className="flex justify-center items-center space-x-3">
            <CalendarDays className="w-5 h-5" />
            <span>{formatDateTime(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="flex justify-center items-center space-x-3">
              <MapPin className="w-5 h-5" />
              <span>{formatLocation(activity.location)}</span>
            </div>
          )}
        </div>
      </div>
    ),

    minimalist: (
      <div className="bg-white p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-light text-gray-900 mb-6">{activity.title}</h1>
        <div className="space-y-4 text-gray-600">
          <p className="text-sm">{activity.description}</p>
          <div className="pt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(activity.startDate)}</span>
            </div>
            {activity.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{formatLocation(activity.location)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    workshop: (
      <div className="bg-white shadow-lg p-8 max-w-2xl mx-auto border-t-4 border-indigo-600">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
          {activity.capacity && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>Capacity: {activity.capacity}</span>
            </div>
          )}
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-indigo-900">Activity Description</span>
          </div>
          <p className="text-gray-700">{activity.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <span>{formatDateTime(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>{formatLocation(activity.location)}</span>
            </div>
          )}
        </div>
      </div>
    ),

    creative: (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 max-w-2xl mx-auto rounded-2xl">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          {activity.title}
        </h1>
        <div className="backdrop-blur-sm bg-white/30 rounded-xl p-6 mb-6">
          <p className="text-gray-700">{activity.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 rounded-lg p-4 flex items-center space-x-3">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <span className="text-gray-700">{formatDateTime(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="bg-white/50 rounded-lg p-4 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-pink-500" />
              <span className="text-gray-700">{formatLocation(activity.location)}</span>
            </div>
          )}
        </div>
      </div>
    ),

    sport: (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 max-w-2xl mx-auto rounded-xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-6">
            <p className="text-gray-700">{activity.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">{formatDateTime(activity.startDate)}</span>
            </div>
            {activity.location && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">{formatLocation(activity.location)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    social: (
      <div className="bg-gradient-to-r from-orange-100 to-rose-100 p-8 max-w-2xl mx-auto rounded-xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{activity.title}</h1>
          <div className="bg-white/50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">{activity.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-lg p-4 flex items-center space-x-3">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700">{formatDateTime(activity.startDate)}</span>
            </div>
            {activity.location && (
              <div className="bg-white/70 rounded-lg p-4 flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span className="text-gray-700">{formatLocation(activity.location)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    tech: (
      <div className="bg-gray-900 text-gray-100 p-8 max-w-2xl mx-auto rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">{activity.title}</h1>
          <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
            {activity.capacity ? `${activity.capacity} spots` : 'Open'}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 font-mono text-sm">
          <p className="text-gray-300">{activity.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/30 rounded-lg p-3 flex items-center space-x-3">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{formatDateTime(activity.startDate)}</span>
          </div>
          {activity.location && (
            <div className="bg-gray-800/30 rounded-lg p-3 flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>{formatLocation(activity.location)}</span>
            </div>
          )}
        </div>
      </div>
    ),
  };

  return templates[design as keyof typeof templates] || templates.modern;
};
