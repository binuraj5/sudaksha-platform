import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses for Senior Professionals (7+ years) - Sudaksha | Executive & Strategic Leadership',
  description: 'Executive programs for senior professionals. Develop strategic thinking, enterprise architecture, and leadership excellence.',
  keywords: 'senior professional courses, executive leadership, strategic thinking, 7+ years experience, C-level training',
};

export default function SeniorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courses for Senior Professionals (7+ years)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elevate your leadership capabilities and drive organizational transformation with our executive programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Architecture</h3>
            <p className="text-gray-600 mb-4">Design scalable enterprise systems and digital transformation strategies.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Transformation Leadership</h3>
            <p className="text-gray-600 mb-4">Lead digital initiatives and drive organizational change.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Technology Strategy</h3>
            <p className="text-gray-600 mb-4">Develop technology roadmaps and strategic business alignment.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
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
