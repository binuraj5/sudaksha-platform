'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Send, Mail, MessageSquare, Bell, Users, Calendar, Loader2, Phone, Globe, Monitor, MapPin, ChevronDown, ChevronUp, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

interface Lead {
  id: string;
  formType: string;
  formName: string | null;
  pageUrl: string;
  pageName: string | null;
  formData: any;
  userAgent: string | null;
  ipAddress: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface ThreadMessage {
  from: 'admin' | 'system';
  message: string;
  timestamp: string;
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


export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'leads' | 'templates' | 'campaigns'>('leads');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'leads') loadLeads(); }, [activeTab, statusFilter, searchTerm]);

  // Auto-refresh leads when user returns to this tab
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && activeTab === 'leads') loadLeads(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/admin/communication/templates'),
        fetch('/api/admin/communication/campaigns'),
      ]);
      const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
      setTemplates(tData.templates || []);
      setCampaigns(cData.campaigns || []);
    } catch {
      toast.error('Failed to load communication data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      const res = await fetch(`/api/admin/communication/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setLeadsTotal(data.total || 0);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/communication/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplyingTo(id);
    try {
      const res = await fetch(`/api/admin/communication/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success('Reply saved');
      setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: data.lead.notes } : l));
      setReplyText('');
    } catch {
      toast.error('Failed to save reply');
    } finally {
      setReplyingTo(null);
    }
  };

  const getLeadThread = (lead: Lead): ThreadMessage[] => {
    try { return JSON.parse(lead.notes || '[]'); } catch { return []; }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
      case 'QUALIFIED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      const res = await fetch(`/api/admin/communication/templates?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Template deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      const res = await fetch(`/api/admin/communication/campaigns?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Campaign deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const handleSaveTemplate = async (data: Partial<Template>) => {
    try {
      const url = editingTemplate
        ? '/api/admin/communication/templates'
        : '/api/admin/communication/templates';
      const body = editingTemplate ? { id: editingTemplate.id, ...data } : data;
      const method = editingTemplate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editingTemplate ? 'Template updated' : 'Template created');
      setShowForm(false);
      setEditingTemplate(null);
      await loadData();
    } catch {
      toast.error('Failed to save template');
    }
  };

  const handleSaveCampaign = async (data: Partial<Campaign>) => {
    try {
      const body = editingCampaign ? { id: editingCampaign.id, ...data } : data;
      const method = editingCampaign ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/communication/campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editingCampaign ? 'Campaign updated' : 'Campaign created');
      setShowForm(false);
      setEditingCampaign(null);
      await loadData();
    } catch {
      toast.error('Failed to save campaign');
    }
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
          <p className="text-gray-600 mt-1">Leads, email templates and campaigns</p>
        </div>
        {activeTab !== 'leads' && (
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'templates' ? 'New Template' : 'New Campaign'}
          </Button>
        )}
        {activeTab === 'leads' && (
          <Button variant="outline" onClick={loadLeads}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Leads</p><p className="text-xl font-bold text-indigo-600 mt-1">{leadsTotal}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">New Leads</p><p className="text-xl font-bold text-blue-600 mt-1">{leads.filter(l => l.status === 'NEW').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Templates</p><p className="text-xl font-bold text-green-600 mt-1">{templates.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Campaigns</p><p className="text-xl font-bold text-purple-600 mt-1">{campaigns.length}</p></Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => { setActiveTab('leads'); setSearchTerm(''); setStatusFilter(''); }}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'leads' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Leads
          </button>
          <button
            onClick={() => { setActiveTab('templates'); setSearchTerm(''); loadData(); }}
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
            placeholder={activeTab === 'leads' ? 'Search by name, email, phone...' : activeTab === 'templates' ? 'Search templates...' : 'Search campaigns...'}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && activeTab === 'leads') loadLeads(); }}
            className="pl-10"
          />
        </div>
        {activeTab === 'leads' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CLOSED">Closed</option>
          </select>
        )}
      </div>

      {activeTab === 'leads' ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading leads...</div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">No leads found. Form submissions will appear here.</CardContent>
            </Card>
          ) : (
            leads.map((lead) => {
              const d = lead.formData as any;
              // Client-side fields are at top level; server-captured fields in _meta
              const serverMeta = d?._meta || {};
              const thread = getLeadThread(lead);
              const isExpanded = expandedLead === lead.id;
              const displayIp = d?.publicIp || serverMeta?.capturedIp || lead.ipAddress;

              return (
                <Card key={lead.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{d?.name || 'Unknown'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLeadStatusColor(lead.status)}`}>{lead.status}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{lead.formName || lead.formType}</span>
                          {thread.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{thread.length} repl{thread.length === 1 ? 'y' : 'ies'}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          {d?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
                          {d?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>}
                          {d?.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.city}{d.country ? `, ${d.country}` : ''}</span>}
                          {displayIp && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{displayIp}</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(lead.createdAt).toLocaleString()}</span>
                          {d?.isp && <span>ISP: {d.isp}</span>}
                          {lead.pageName && <span>Page: {lead.pageName}</span>}
                        </div>
                        {d?.message && <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2 italic">"{d.message}"</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={() => setExpandedLead(isExpanded ? null : lead.id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          <span className="ml-1 text-xs">{isExpanded ? 'Hide' : 'Thread'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4 space-y-3">
                      <div className="text-xs text-gray-500 bg-white rounded p-3 border space-y-1">
                        <p className="font-medium text-gray-700 mb-1">Submission Details</p>
                        {d?.device && <p className="flex items-start gap-1"><Monitor className="h-3 w-3 mt-0.5 flex-shrink-0" /><span className="break-all">{d.device}</span></p>}
                        {d?.timezone && <p>Timezone: {d.timezone}</p>}
                        {d?.pageUrl && <p>URL: <span className="text-blue-600 break-all">{d.pageUrl}</span></p>}
                        {d?.ctaButton && <p>CTA Button: {d.ctaButton}</p>}
                        {d?.isp && <p>ISP: {d.isp}</p>}
                        {d?.region && <p>Region: {d.region}</p>}
                        {serverMeta?.capturedIp && <p>Server IP: {serverMeta.capturedIp}</p>}
                      </div>

                      {thread.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-600">Communication Thread</p>
                          {thread.map((msg, idx) => (
                            <div key={idx} className={`rounded-lg p-3 text-sm ${msg.from === 'admin' ? 'bg-indigo-50 border border-indigo-100 ml-4' : 'bg-white border'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">{msg.from === 'admin' ? 'You (Admin)' : 'System'}</span>
                                <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-gray-800">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">Add Note / Reply</p>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your note or reply..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setReplyText('')}>Clear</Button>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={replyingTo === lead.id || !replyText.trim()}
                            onClick={() => handleReply(lead.id)}
                          >
                            {replyingTo === lead.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                            Save Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      ) : activeTab === 'templates' ? (
        <Card>
          <CardHeader><CardTitle>Email Templates</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
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
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
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
