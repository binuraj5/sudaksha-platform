'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Building2, BookOpen, Users, BarChart3, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineBatchForm({ 
  initialData, 
  mode = 'create' 
}: { 
  initialData?: any; 
  mode?: 'create' | 'edit' 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Normalize date values - convert ISO strings to YYYY-MM-DD format
  const normalizeDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.substring(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().substring(0, 10);
    }
    return '';
  };

  const [formData, setFormData] = useState<any>(initialData ? {
    ...initialData,
    startDate: normalizeDate(initialData.startDate),
    endDate: normalizeDate(initialData.endDate),
    satisfactionScore: initialData.satisfactionScore ? parseFloat(String(initialData.satisfactionScore)) : 0,
  } : {
    programTitle: '',
    programDescription: '',
    outcomes: '',
    skillsCovered: [],
    durationDays: 0,
    durationHours: 0,
    
    clientName: '',
    clientCompanyDescription: '',
    clientIndustry: '',
    clientSize: 'ENTERPRISE',
    clientLogoUrl: '',
    showClientName: true,
    
    clientContactName: '',
    clientContactEmail: '',
    clientContactPhone: '',
    
    participantCount: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
    deliveryMode: 'ONSITE',
    city: '',
    country: 'India',
    
    completionRate: 0,
    satisfactionScore: 0,
    certificationIssued: false,
    participantTestimonial: '',
    testimonialAuthor: '',
    testimonialDesig: '',
    
    status: 'DRAFT',
    isPublic: false,
    featuredOnHomepage: false,
    coverImageUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value ? parseFloat(value) : 0) : 
              value
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skillsCovered.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skillsCovered: [...formData.skillsCovered, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skillsCovered: formData.skillsCovered.filter((s: string) => s !== skill)
    });
  };

  const handleSave = async () => {
    if (!formData.programTitle || !formData.clientIndustry) {
      toast.error('Program title and client industry are required.');
      return;
    }

    try {
      setLoading(true);
      // Format dates for Prisma
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      const url = mode === 'edit' ? `/api/admin/offlinebatches/${initialData.id}` : '/api/admin/offlinebatches';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(mode === 'edit' ? 'Batch updated' : 'Batch created');
        router.push('/admin/offlinebatches');
        router.refresh(); // Invalidate server components to show new data
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/offlinebatches')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mode === 'edit' ? 'Edit Corporate Batch' : 'Log New Corporate Batch'}</h1>
            <p className="text-gray-500">Secure registry for B2B engagements. Internal contacts remain private.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/offlinebatches')}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Main Forms */}
        <div className="md:col-span-2 space-y-6">
          
          <Card>
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-lg"><BookOpen className="w-5 h-5 mr-2 text-indigo-500"/> Program Curriculum details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Program Title *</label>
                <Input name="programTitle" value={formData.programTitle} onChange={handleChange} placeholder="e.g. Advanced AI Enterprise Transformation" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Program Description *</label>
                <textarea 
                  name="programDescription"
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  value={formData.programDescription} 
                  onChange={handleChange} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Skills Covered</label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={skillInput} 
                    onChange={e => setSkillInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="e.g. Python, Docker, Cloud" 
                  />
                  <Button variant="secondary" onClick={handleAddSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsCovered.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-500 rounded-full font-bold ml-1">&times;</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (Days)</label>
                  <Input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Total Hours</label>
                  <Input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-lg"><Building2 className="w-5 h-5 mr-2 text-blue-500"/> Client & Enterprise Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Client / Organization Name</label>
                  <Input name="clientName" value={formData.clientName} onChange={handleChange} placeholder="e.g. TechCorp Global" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Industry *</label>
                  <Input name="clientIndustry" value={formData.clientIndustry} onChange={handleChange} placeholder="e.g. FinTech" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Client Display Option</label>
                <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      id="show_name" 
                      name="showClientName"
                      value="true"
                      checked={formData.showClientName === true}
                      onChange={() => setFormData({...formData, showClientName: true})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="show_name" className="flex-1 cursor-pointer">
                      <span className="font-medium text-gray-900">Show Company Name</span>
                      <p className="text-xs text-gray-500">Display the actual company/organization name</p>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      id="show_desc" 
                      name="showClientName"
                      value="false"
                      checked={formData.showClientName === false}
                      onChange={() => setFormData({...formData, showClientName: false})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="show_desc" className="flex-1 cursor-pointer">
                      <span className="font-medium text-gray-900">Show Company Description (NDA)</span>
                      <p className="text-xs text-gray-500">Display a descriptive phrase instead of the company name</p>
                    </label>
                  </div>
                </div>
              </div>

              {formData.showClientName === false && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Company Description (for NDA Clients) *</label>
                  <Input 
                    name="clientCompanyDescription" 
                    value={formData.clientCompanyDescription} 
                    onChange={handleChange} 
                    placeholder="e.g., Biggest Steel Manufacturer in South India, Largest Car Manufacturer in Asia" 
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be shown instead of the company name on the public portfolio</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Company Size</label>
                  <select name="clientSize" value={formData.clientSize} onChange={handleChange} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm shadow-sm">
                    <option value="STARTUP">Startup</option>
                    <option value="SME">SME</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="GOVERNMENT">Government</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Logo URL</label>
                  <Input name="clientLogoUrl" value={formData.clientLogoUrl} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg space-y-3">
                <h4 className="font-semibold text-orange-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Private Contact Information (Internal Only)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-orange-800">Sponsor Name</label>
                    <Input name="clientContactName" value={formData.clientContactName} onChange={handleChange} className="bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-orange-800">Email</label>
                    <Input name="clientContactEmail" value={formData.clientContactEmail} onChange={handleChange} className="bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-orange-800">Phone</label>
                    <Input name="clientContactPhone" value={formData.clientContactPhone} onChange={handleChange} className="bg-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-lg"><BarChart3 className="w-5 h-5 mr-2 text-green-500"/> Engagement Metrics & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Completion Rate (%)</label>
                  <Input type="number" name="completionRate" value={formData.completionRate} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">NPS / Satisfaction (0-5)</label>
                  <Input type="number" step="0.1" name="satisfactionScore" value={formData.satisfactionScore} onChange={handleChange} />
                </div>
                <div className="flex items-center pt-6">
                  <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="certificationIssued" checked={formData.certificationIssued} onChange={handleChange} className="w-4 h-4 rounded text-indigo-600" />
                    Certifications Issued
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Client Testimonial Quote</label>
                <textarea 
                  name="participantTestimonial"
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  value={formData.participantTestimonial} 
                  onChange={handleChange} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium mb-1 block">Quoted By (Name)</label>
                   <Input name="testimonialAuthor" value={formData.testimonialAuthor} onChange={handleChange} />
                </div>
                <div>
                   <label className="text-sm font-medium mb-1 block">Designation</label>
                   <Input name="testimonialDesig" value={formData.testimonialDesig} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Col: Logistics & Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-lg"><Users className="w-5 h-5 mr-2 text-purple-500"/> Logistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Participant Count *</label>
                <Input type="number" name="participantCount" value={formData.participantCount} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date *</label>
                  <Input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Delivery Modality</label>
                <select name="deliveryMode" value={formData.deliveryMode} onChange={handleChange} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm shadow-sm">
                  <option value="ONSITE">On-site (Premises)</option>
                  <option value="OFFSITE">Off-site / Facility</option>
                  <option value="HYBRID">Hybrid (Mix)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">City</label>
                  <Input name="city" value={formData.city || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Country</label>
                  <Input name="country" value={formData.country || ''} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-lg"><Globe className="w-5 h-5 mr-2 text-teal-500"/> Publishing</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Record Status</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                   {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => (
                     <button
                       key={s}
                       type="button"
                       onClick={() => setFormData({...formData, status: s})}
                       className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-all ${formData.status === s ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       {s}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5">
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 rounded text-teal-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block group-hover:text-teal-700">List in Public Portfolio</span>
                    <span className="text-xs text-gray-500">Makes the engagement visible on `/corporate-training/our-work`</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5">
                    <input type="checkbox" name="featuredOnHomepage" checked={formData.featuredOnHomepage} onChange={handleChange} className="w-4 h-4 rounded text-teal-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block group-hover:text-teal-700">Feature on Homepage</span>
                    <span className="text-xs text-gray-500">Highlights this engagement in the active ticker</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t">
                <label className="text-sm font-medium mb-1 block">Hero Image URL</label>
                <Input name="coverImageUrl" value={formData.coverImageUrl || ''} onChange={handleChange} placeholder="https://..." />
                {formData.coverImageUrl && (
                  <img src={formData.coverImageUrl} alt="preview" className="mt-3 rounded-md w-full h-32 object-cover border" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
