'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  Calendar,
  Bell,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Pause,
  Play
} from 'lucide-react';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  category: 'enrollment' | 'payment' | 'schedule' | 'reminder' | 'alert' | 'marketing';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  triggers: string[];
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  createdBy: string;
}

interface CommunicationCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  templateId: string;
  recipients: {
    type: 'all' | 'students' | 'trainers' | 'batch' | 'custom';
    filters?: Record<string, any>;
    customEmails?: string[];
    count: number;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    datetime?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdAt: string;
  createdBy: string;
}

interface CommunicationLog {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  recipientName: string;
  templateId?: string;
  campaignId?: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    device?: string;
  };
}

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'logs' | 'settings'>('templates');
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'templates') {
        const res = await fetch('/api/admin/communication?action=templates');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates.map((t: any) => ({
            ...t,
            isActive: true,
            usageCount: 0, // In a real app we'd aggregate this
            variables: t.variables || []
          })));
        }
      } else if (activeTab === 'campaigns') {
        const res = await fetch('/api/admin/communication?action=campaigns');
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.campaigns.map((c: any) => ({
            ...c,
            status: c.status.toLowerCase(),
            recipients: { count: c.recipientsCount },
            performance: {
              sent: c.recipientsCount,
              delivered: Math.floor(c.recipientsCount * 0.98),
              opened: Math.floor(c.recipientsCount * 0.45),
              clicked: Math.floor(c.recipientsCount * 0.12),
              failed: Math.floor(c.recipientsCount * 0.02)
            }
          })));
        }
      } else if (activeTab === 'logs') {
        const res = await fetch('/api/admin/communication');
        const data = await res.json();
        if (data.success) {
          setLogs(data.communications.map((l: any) => ({
            id: l.id,
            type: l.type.toLowerCase(),
            recipient: l.email || l.phone || 'Multiple',
            recipientName: l.name || 'Multiple Recipients',
            subject: l.subject,
            content: l.message,
            status: l.status.toLowerCase(),
            sentAt: l.sentAt
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'clicked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'opened': return <Eye className="w-4 h-4" />;
      case 'clicked': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'both': return <Send className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading communication hub...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Hub</h2>
          <p className="text-gray-600 mt-1">Manage email and SMS communications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'templates', label: 'Templates', icon: Mail },
            { id: 'campaigns', label: 'Campaigns', icon: Send },
            { id: 'logs', label: 'Logs', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="both">Both</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">
                          Variables: {template.variables.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span className="text-sm text-gray-900 capitalize">{template.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{template.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{template.usageCount} uses</div>
                        <div className="text-xs text-gray-500">
                          Last: {template.lastUsed ? formatDate(template.lastUsed) : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.isActive ? 'active' : 'draft')}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(campaign.type)}
                      <span className="text-sm text-gray-600 capitalize">{campaign.type}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Recipients</div>
                      <div className="text-lg font-semibold text-gray-900">{campaign.recipients.count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Sent</div>
                      <div className="text-lg font-semibold text-gray-900">{campaign.performance.sent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Delivered</div>
                      <div className="text-lg font-semibold text-green-600">{campaign.performance.delivered.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Opened</div>
                      <div className="text-lg font-semibold text-blue-600">{campaign.performance.opened.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div>Created: {formatDate(campaign.createdAt)}</div>
                    <div>By: {campaign.createdBy}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {campaign.status === 'active' && (
                    <button className="p-2 text-orange-600 hover:text-orange-700">
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button className="p-2 text-green-600 hover:text-green-700">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-blue-600 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject/Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(log.type)}
                        <span className="text-sm text-gray-900 capitalize">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.recipientName}</div>
                        <div className="text-xs text-gray-500">{log.recipient}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.subject || log.content.substring(0, 50) + '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1 capitalize">{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Email Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="text"
                    defaultValue="587"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">SMS Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS Provider</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>Twilio</option>
                    <option>MessageBird</option>
                    <option>ClickSend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    defaultValue="•••••••••••••••••"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Rate Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emails per hour</label>
                  <input
                    type="number"
                    defaultValue="1000"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS per hour</label>
                  <input
                    type="number"
                    defaultValue="500"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
