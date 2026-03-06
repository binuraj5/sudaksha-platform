'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Send, Mail, MessageSquare, Bell, Users, Calendar, Filter } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  category: 'ENROLLMENT' | 'REMINDER' | 'COMPLETION' | 'MARKETING' | 'SYSTEM';
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  targetAudience: string;
  recipientCount: number;
  sentCount: number;
  openRate?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome to Sudaksha!', type: 'EMAIL', category: 'ENROLLMENT', status: 'ACTIVE', usageCount: 245, lastUsed: '2026-02-05', createdAt: '2026-01-01' },
  { id: '2', name: 'Course Reminder', subject: 'Continue your learning journey', type: 'EMAIL', category: 'REMINDER', status: 'ACTIVE', usageCount: 1203, lastUsed: '2026-02-04', createdAt: '2026-01-05' },
  { id: '3', name: 'Certificate Ready', subject: 'Your certificate is ready!', type: 'EMAIL', category: 'COMPLETION', status: 'ACTIVE', usageCount: 89, lastUsed: '2026-01-30', createdAt: '2026-01-10' },
  { id: '4', name: 'Webinar Reminder SMS', subject: 'Webinar starts in 1 hour', type: 'SMS', category: 'REMINDER', status: 'ACTIVE', usageCount: 567, lastUsed: '2026-02-03', createdAt: '2026-01-15' },
  { id: '5', name: 'New Course Launch', subject: 'New course available!', type: 'EMAIL', category: 'MARKETING', status: 'DRAFT', usageCount: 0, createdAt: '2026-02-01' },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Feb Newsletter', templateId: '2', templateName: 'Course Reminder', type: 'EMAIL', status: 'SENT', targetAudience: 'All Students', recipientCount: 1250, sentCount: 1245, openRate: 42.3, sentAt: '2026-02-01', createdAt: '2026-01-28' },
  { id: '2', name: 'Cloud Course Launch', templateId: '5', templateName: 'New Course Launch', type: 'EMAIL', status: 'SCHEDULED', targetAudience: 'Tech Interested', recipientCount: 890, sentCount: 0, scheduledAt: '2026-03-10', createdAt: '2026-02-05' },
  { id: '3', name: 'Webinar Blast Mar', templateId: '4', templateName: 'Webinar Reminder SMS', type: 'SMS', status: 'DRAFT', targetAudience: 'Registered Users', recipientCount: 456, sentCount: 0, createdAt: '2026-02-05' },
];

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          fetch('/api/admin/communication/templates'),
          fetch('/api/admin/communication/campaigns'),
        ]);
        const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
        setTemplates(tData.templates || MOCK_TEMPLATES);
        setCampaigns(cData.campaigns || MOCK_CAMPAIGNS);
      } catch {
        setTemplates(MOCK_TEMPLATES);
        setCampaigns(MOCK_CAMPAIGNS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Delete this campaign?')) setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveTemplate = (data: Partial<Template>) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t));
    } else {
      setTemplates(prev => [...prev, { id: Date.now().toString(), usageCount: 0, createdAt: new Date().toISOString().split('T')[0], ...data } as Template]);
    }
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleSaveCampaign = (data: Partial<Campaign>) => {
    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...data } : c));
    } else {
      setCampaigns(prev => [...prev, { id: Date.now().toString(), sentCount: 0, createdAt: new Date().toISOString().split('T')[0], ...data } as Campaign]);
    }
    setShowForm(false);
    setEditingCampaign(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'SMS': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'PUSH': return <Bell className="h-4 w-4 text-orange-500" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'SENT': return 'default';
      case 'DRAFT': return 'secondary';
      case 'SCHEDULED': return 'outline';
      case 'ARCHIVED': case 'FAILED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ENROLLMENT': return 'bg-blue-100 text-blue-700';
      case 'REMINDER': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETION': return 'bg-green-100 text-green-700';
      case 'MARKETING': return 'bg-purple-100 text-purple-700';
      case 'SYSTEM': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {activeTab === 'templates'
              ? (editingTemplate ? 'Edit Template' : 'New Template')
              : (editingCampaign ? 'Edit Campaign' : 'New Campaign')}
          </h1>
          <Button variant="outline" onClick={() => { setShowForm(false); setEditingTemplate(null); setEditingCampaign(null); }}>Back</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            {activeTab === 'templates' ? (
              <TemplateForm template={editingTemplate} onSave={handleSaveTemplate} onCancel={() => { setShowForm(false); setEditingTemplate(null); }} />
            ) : (
              <CampaignForm campaign={editingCampaign} templates={templates} onSave={handleSaveCampaign} onCancel={() => { setShowForm(false); setEditingCampaign(null); }} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Communication</h1>
          <p className="text-gray-600 mt-1">Manage email templates and campaigns</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'templates' ? 'New Template' : 'New Campaign'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Templates</p><p className="text-xl font-bold text-indigo-600 mt-1">{templates.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Active Templates</p><p className="text-xl font-bold text-green-600 mt-1">{templates.filter(t => t.status === 'ACTIVE').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Campaigns</p><p className="text-xl font-bold text-blue-600 mt-1">{campaigns.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Sent Campaigns</p><p className="text-xl font-bold text-purple-600 mt-1">{campaigns.filter(c => c.status === 'SENT').length}</p></Card>
      </div>

      <div className="flex gap-4">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => { setActiveTab('templates'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Templates
          </button>
          <button
            onClick={() => { setActiveTab('campaigns'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'campaigns' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Campaigns
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={activeTab === 'templates' ? 'Search templates...' : 'Search campaigns...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {activeTab === 'templates' ? (
        <Card>
          <CardHeader><CardTitle>Email Templates</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading templates...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Template</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Usage</th>
                      <th className="text-left p-2">Last Used</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.subject}</div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(template.type)}
                            <span className="text-sm">{template.type}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                        </td>
                        <td className="p-2"><Badge variant={getStatusColor(template.status)} className="text-xs">{template.status}</Badge></td>
                        <td className="p-2"><span className="text-sm font-medium">{template.usageCount}</span></td>
                        <td className="p-2"><span className="text-xs text-gray-500">{template.lastUsed || 'Never'}</span></td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Campaign</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Audience</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Recipients</th>
                      <th className="text-left p-2">Open Rate</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium text-sm">{campaign.name}</div>
                          <div className="text-xs text-gray-500">{campaign.templateName}</div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(campaign.type)}
                            <span className="text-sm">{campaign.type}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3 text-gray-400" />
                            {campaign.targetAudience}
                          </div>
                        </td>
                        <td className="p-2"><Badge variant={getStatusColor(campaign.status)} className="text-xs">{campaign.status}</Badge></td>
                        <td className="p-2">
                          <div className="text-sm">
                            <span className="font-medium">{campaign.sentCount}</span>
                            <span className="text-gray-400">/{campaign.recipientCount}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          {campaign.openRate !== undefined ? (
                            <span className="text-sm font-medium text-green-600">{campaign.openRate}%</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {campaign.sentAt || campaign.scheduledAt || campaign.createdAt}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            {campaign.status === 'DRAFT' && (
                              <Button size="sm" variant="outline" className="text-green-600"><Send className="h-4 w-4" /></Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => { setEditingCampaign(campaign); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCampaign(campaign.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TemplateForm({ template, onSave, onCancel }: { template: Template | null; onSave: (data: Partial<Template>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    type: template?.type || 'EMAIL',
    category: template?.category || 'ENROLLMENT',
    status: template?.status || 'DRAFT',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <input type="text" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="PUSH">Push Notification</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="ENROLLMENT">Enrollment</option>
            <option value="REMINDER">Reminder</option>
            <option value="COMPLETION">Completion</option>
            <option value="MARKETING">Marketing</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{template ? 'Update Template' : 'Create Template'}</Button>
      </div>
    </form>
  );
}

function CampaignForm({ campaign, templates, onSave, onCancel }: { campaign: Campaign | null; templates: Template[]; onSave: (data: Partial<Campaign>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    templateId: campaign?.templateId || '',
    templateName: campaign?.templateName || '',
    type: campaign?.type || 'EMAIL',
    status: campaign?.status || 'DRAFT',
    targetAudience: campaign?.targetAudience || '',
    recipientCount: campaign?.recipientCount || 0,
    scheduledAt: campaign?.scheduledAt || '',
  });

  const handleTemplateChange = (templateId: string) => {
    const t = templates.find(t => t.id === templateId);
    setFormData(p => ({ ...p, templateId, templateName: t?.name || '', type: t?.type || 'EMAIL' }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template *</label>
          <select value={formData.templateId} onChange={(e) => handleTemplateChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" required>
            <option value="">Select Template</option>
            {templates.filter(t => t.status === 'ACTIVE').map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
          <input type="text" value={formData.targetAudience} onChange={(e) => setFormData(p => ({ ...p, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. All Students" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Count</label>
          <input type="number" value={formData.recipientCount} onChange={(e) => setFormData(p => ({ ...p, recipientCount: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>
        {formData.status === 'SCHEDULED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
            <input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{campaign ? 'Update Campaign' : 'Create Campaign'}</Button>
      </div>
    </form>
  );
}
