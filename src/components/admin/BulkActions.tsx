'use client';

import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  UserMinus, 
  Move, 
  Trash2, 
  Edit, 
  Download,
  CheckSquare,
  Square
} from 'lucide-react';

interface BulkActionsProps {
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
  items: any[];
  onBulkAction: (action: string, selectedItems: string[]) => void;
  itemType: 'batches' | 'students' | 'trainers';
}

export default function BulkActions({
  selectedItems,
  onSelectionChange,
  items,
  onBulkAction,
  itemType
}: BulkActionsProps) {
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const getBulkActions = () => {
    switch (itemType) {
      case 'batches':
        return [
          { id: 'reschedule', label: 'Reschedule Batches', icon: Calendar, color: 'blue' },
          { id: 'assign_trainer', label: 'Assign Trainer', icon: UserPlus, color: 'green' },
          { id: 'change_status', label: 'Change Status', icon: Edit, color: 'purple' },
          { id: 'export', label: 'Export Data', icon: Download, color: 'gray' },
          { id: 'delete', label: 'Delete Batches', icon: Trash2, color: 'red' }
        ];
      case 'students':
        return [
          { id: 'enroll', label: 'Enroll in Batch', icon: UserPlus, color: 'blue' },
          { id: 'unenroll', label: 'Unenroll from Batch', icon: UserMinus, color: 'orange' },
          { id: 'assign_trainer', label: 'Assign Trainer', icon: Users, color: 'green' },
          { id: 'export', label: 'Export Data', icon: Download, color: 'gray' },
          { id: 'delete', label: 'Delete Students', icon: Trash2, color: 'red' }
        ];
      case 'trainers':
        return [
          { id: 'assign_batch', label: 'Assign to Batch', icon: Calendar, color: 'blue' },
          { id: 'remove_batch', label: 'Remove from Batch', icon: UserMinus, color: 'orange' },
          { id: 'update_status', label: 'Update Status', icon: Edit, color: 'purple' },
          { id: 'export', label: 'Export Data', icon: Download, color: 'gray' },
          { id: 'delete', label: 'Delete Trainers', icon: Trash2, color: 'red' }
        ];
      default:
        return [];
    }
  };

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      red: 'bg-red-100 text-red-700 hover:bg-red-200'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  if (selectedItems.length === 0) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm">Select All ({items.length})</span>
        </button>
        <span className="text-sm text-gray-500">
          Select items to perform bulk actions
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-sm font-medium">
              {selectedItems.length} of {items.length} selected
            </span>
          </button>
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Clear selection
          </button>
        </div>

        {/* Bulk Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowBulkMenu(!showBulkMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Move className="w-4 h-4" />
            <span>Bulk Actions</span>
          </button>

          {showBulkMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                {getBulkActions().map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        onBulkAction(action.id, selectedItems);
                        setShowBulkMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${getActionColor(
                        action.color
                      )}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Selected Items:</strong> {selectedItems.length} {itemType} ready for bulk operations
        </div>
      </div>
    </div>
  );
}
