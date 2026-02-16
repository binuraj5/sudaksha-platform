'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getUpcomingBatches } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  MapPin, 
  Award, 
  DollarSign, 
  Calendar,
  Target,
  Bell,
  Search,
  Filter,
  Activity,
  Clock,
  BarChart3,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [upcomingBatches, setUpcomingBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await getDashboardStats();
        const batches = await getUpcomingBatches(10);
        setStats(dashboardStats);
        setUpcomingBatches(batches);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  const trainerWorkloadData = [
    { name: 'John Doe', workload: 85, status: 'overloaded', color: 'bg-red-500' },
    { name: 'Jane Smith', workload: 60, status: 'optimal', color: 'bg-green-500' },
    { name: 'Mike Johnson', workload: 75, status: 'moderate', color: 'bg-yellow-500' },
    { name: 'Sarah Wilson', workload: 45, status: 'available', color: 'bg-blue-500' },
    { name: 'David Brown', workload: 90, status: 'overloaded', color: 'bg-red-500' }
  ];

  const filteredBatches = upcomingBatches.filter(batch => 
    filterStatus === 'all' || batch.status === filterStatus
  );

  return (
    <div className="p-6 space-y-6">
      {/* At-a-Glance Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-blue-100">Total Active Batches</CardTitle>
            <Calendar className="w-5 h-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeBatches || 24}</div>
            <div className="text-blue-100 text-sm">Currently running</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-green-100">Monthly Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(stats?.monthlyRevenue || 1250000).toLocaleString()}</div>
            <div className="text-green-100 text-sm">+18% vs last month</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-purple-100">Trainer Utilization</CardTitle>
            <Users className="w-5 h-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.trainerUtilization || 78}%</div>
            <div className="text-purple-100 text-sm">Optimal range</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-orange-100">Pending Actions</CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingActions || 7}</div>
            <div className="text-orange-100 text-sm">Need attention</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed – link */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Link
              href="/admin/activity"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Live Activity Feed</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trainer Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-600" />
                Trainer Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainerWorkloadData.map((trainer, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{trainer.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${trainer.color}`}>
                        {trainer.workload}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${trainer.color} transition-all duration-500`}
                        style={{ width: `${trainer.workload}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Batch Scheduling Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Batch Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Day</button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Week</button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Month</button>
                  </div>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>January 2024</option>
                    <option>February 2024</option>
                    <option>March 2024</option>
                  </select>
                </div>
                
                {/* Mini Calendar */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="font-medium text-gray-600 mb-2">{day}</div>
                      <div className="space-y-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                              i === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {i === 2 ? '15' : i + 10}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Management Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-green-600" />
                Filter & Search Management
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, batches, trainers, students..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtered Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.slice(0, 6).map((batch) => (
                  <div key={batch.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        batch.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        batch.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Course: {batch.courseName}</div>
                      <div>Trainer: {batch.trainerName}</div>
                      <div>Start: {batch.startDate}</div>
                      <div>Students: {batch.currentStudents}/{batch.maxStudents}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <button className="p-1 text-blue-600 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-orange-600 hover:text-orange-700">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBatches.length > 6 && (
                <div className="text-center mt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Load More Results
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

