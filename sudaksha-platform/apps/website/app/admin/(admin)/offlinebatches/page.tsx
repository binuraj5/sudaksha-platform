'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Building2, GlobeLock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/offlinebatches');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setBatches(data.batches);
    } catch (error) {
      toast.error('Error fetching batches');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(b =>
    b.programTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.clientIndustry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the record for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/offlinebatches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Record deleted');
        fetchBatches();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const togglePublic = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/offlinebatches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentVal }),
      });
      if (res.ok) {
        toast.success(!currentVal ? 'Made Public' : 'Made Private');
        fetchBatches();
      }
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const togglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/offlinebatches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(newStatus === 'PUBLISHED' ? 'Published ✓' : 'Moved to Draft');
        fetchBatches();
      } else {
        const errorData = await res.json();
        toast.error(`Failed: ${errorData.error || 'Unknown error'}`);
        console.error('API Error:', errorData);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Toggle error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Corporate Engagements
          </h1>
          <p className="text-gray-600 mt-1">Registry of all B2B offline batches and university capabilities</p>
        </div>
        <Link href="/admin/offlinebatches/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Log Engagement
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Total Records</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{batches.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Publicly Listed</p>
          <p className="text-xl font-bold text-green-600 mt-1">{batches.filter(b => b.isPublic).length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Total Participants</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{batches.reduce((sum, b) => sum + (b.participantCount || 0), 0)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Avg Satisfaction</p>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {(batches.reduce((sum, b) => sum + Number(b.satisfactionScore || 0), 0) / (batches.filter(b => b.satisfactionScore).length || 1)).toFixed(1)}
          </p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by program, client, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading history...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-gray-600 font-medium">
                    <th className="text-left p-3">Program Details</th>
                    <th className="text-left p-3">Client</th>
                    <th className="text-left p-3">Timeline</th>
                    <th className="text-left p-3">Metrics</th>
                    <th className="text-left p-3">Visibility</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr key={batch.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{batch.programTitle}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {batch.deliveryMode} • {batch.participantCount} learners
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{batch.clientName || 'Confidential Client'}</div>
                        <Badge variant="secondary" className="mt-1 text-[10px]">{batch.clientIndustry}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-900">{new Date(batch.startDate).toLocaleDateString()}</div>
                        {batch.endDate && <div className="text-xs text-gray-500">to {new Date(batch.endDate).toLocaleDateString()}</div>}
                      </td>
                      <td className="p-3">
                        {batch.satisfactionScore ? (
                          <span className="font-medium text-green-700">{Number(batch.satisfactionScore).toFixed(1)}/5 CSAT</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={batch.status === 'PUBLISHED' ? 'default' : 'secondary'} className={`${batch.status === 'PUBLISHED' ? 'bg-indigo-100 text-indigo-800 cursor-pointer hover:bg-indigo-200' : 'bg-gray-200 text-gray-800 cursor-pointer hover:bg-gray-300'}`} onClick={() => togglePublish(batch.id, batch.status)} title="Click to toggle publish status">
                            {batch.status}
                          </Badge>
                          {batch.isPublic && <Badge variant="outline" className="text-green-600 border-green-200">Public Listed</Badge>}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" title={batch.isPublic ? "Unlist from Public" : "List Publicly"} onClick={() => togglePublic(batch.id, batch.isPublic)}>
                            {batch.isPublic ? <GlobeLock className="h-4 w-4 text-orange-500" /> : <Globe className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Link href={`/admin/offlinebatches/${batch.id}/edit`}>
                            <Button size="icon" variant="outline" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {batch.isPublic && (
                             <Link href={`/our-work/${batch.slug}`} target="_blank">
                               <Button size="icon" variant="outline" title="View Live">
                                 <Eye className="h-4 w-4" />
                               </Button>
                             </Link>
                          )}
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(batch.id, batch.programTitle)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBatches.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No corporate engagements found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
