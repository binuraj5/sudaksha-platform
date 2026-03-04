'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Users,
  Calendar,
  MapPin,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface Conflict {
  id: string;
  type: 'trainer_conflict' | 'room_conflict' | 'low_enrollment' | 'contract_expiry' | 'certification_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  entity: {
    id: string;
    name: string;
    type: 'trainer' | 'batch' | 'course' | 'room';
  };
  details: {
    [key: string]: any;
  };
  actions: Array<{
    label: string;
    action: () => void;
    type: 'primary' | 'secondary';
  }>;
  timestamp: string;
  resolved: boolean;
}

interface ConflictDetectionProps {
  conflicts: Conflict[];
  onResolveConflict: (conflictId: string) => void;
  onDismissConflict: (conflictId: string) => void;
}

export default function ConflictDetection({
  conflicts,
  onResolveConflict,
  onDismissConflict
}: ConflictDetectionProps) {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const filteredConflicts = conflicts.filter(conflict => {
    const statusMatch = filter === 'all' ||
      (filter === 'unresolved' && !conflict.resolved) ||
      (filter === 'resolved' && conflict.resolved);
    const severityMatch = severityFilter === 'all' || conflict.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'trainer_conflict': return <Users className="w-5 h-5" />;
      case 'room_conflict': return <MapPin className="w-5 h-5" />;
      case 'low_enrollment': return <AlertCircle className="w-5 h-5" />;
      case 'contract_expiry': return <Calendar className="w-5 h-5" />;
      case 'certification_expiry': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const displayConflicts = filteredConflicts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
          Conflict Detection
        </h2>
        <div className="flex items-center space-x-4">
          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Conflicts</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: displayConflicts.filter(c => c.severity === 'critical' && !c.resolved).length, color: 'bg-red-500' },
          { label: 'High', count: displayConflicts.filter(c => c.severity === 'high' && !c.resolved).length, color: 'bg-orange-500' },
          { label: 'Medium', count: displayConflicts.filter(c => c.severity === 'medium' && !c.resolved).length, color: 'bg-yellow-500' },
          { label: 'Low', count: displayConflicts.filter(c => c.severity === 'low' && !c.resolved).length, color: 'bg-blue-500' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <span className={`w-3 h-3 rounded-full ${stat.color}`}></span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {displayConflicts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conflicts Found</h3>
            <p className="text-gray-600">All systems are running smoothly!</p>
          </div>
        ) : (
          displayConflicts.map((conflict) => {
            const IconComponent = getConflictIcon(conflict.type);

            return (
              <div
                key={conflict.id}
                className={`bg-white rounded-lg border ${conflict.resolved ? 'border-gray-200 opacity-60' : 'border-gray-300'
                  } p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${getSeverityColor(conflict.severity)}`}>
                      {getConflictIcon(conflict.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{conflict.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(conflict.severity)}`}>
                          {conflict.severity.toUpperCase()}
                        </span>
                        {conflict.resolved && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            RESOLVED
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{conflict.description}</p>

                      {/* Details */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
                        {Object.entries(conflict.details).map(([key, value]) => (
                          <div key={key} className="text-sm text-gray-600 mb-1">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {!conflict.resolved && (
                        <div className="flex items-center space-x-3">
                          {conflict.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={action.action}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${action.type === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => onDismissConflict(conflict.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {conflict.timestamp}
                  </div>
                  {conflict.resolved && (
                    <button
                      onClick={() => onResolveConflict(conflict.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mark as Unresolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
