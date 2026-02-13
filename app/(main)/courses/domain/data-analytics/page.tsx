import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data & Analytics Courses - Sudaksha | Data Science & Business Intelligence Training',
  description: 'Master data analysis, visualization, machine learning, and business intelligence with our comprehensive data analytics programs.',
  keywords: 'data analytics, data science, machine learning, business intelligence, data visualization, SQL',
};

export default function DataAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data & Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform data into insights with our comprehensive analytics training programs covering tools and techniques used by industry professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Science with Python</h3>
            <p className="text-gray-600 mb-4">Learn data analysis, visualization, and machine learning with Python.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Intelligence</h3>
            <p className="text-gray-600 mb-4">Master Power BI, Tableau, and data visualization techniques.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">SQL & Database Management</h3>
            <p className="text-gray-600 mb-4">Learn advanced SQL, database design, and optimization.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Machine Learning Engineering</h3>
            <p className="text-gray-600 mb-4">Build and deploy machine learning models at scale.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Big Data Technologies</h3>
            <p className="text-gray-600 mb-4">Master Hadoop, Spark, and distributed data processing.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Engineering</h3>
            <p className="text-gray-600 mb-4">Build data pipelines and ETL processes for modern data architecture.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/demo" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Book a Free Demo
          </a>
        </div>
      </div>
    </div>
  );
}
