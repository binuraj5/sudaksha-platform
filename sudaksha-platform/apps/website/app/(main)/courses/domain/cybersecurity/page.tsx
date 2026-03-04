import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cybersecurity Courses - Sudaksha | Information Security & Ethical Hacking Training',
  description: 'Comprehensive cybersecurity training covering ethical hacking, network security, compliance, and modern threat protection strategies.',
  keywords: 'cybersecurity, information security, ethical hacking, network security, compliance, threat protection',
};

export default function CybersecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cybersecurity
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protect digital assets and combat cyber threats with our comprehensive cybersecurity training programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ethical Hacking</h3>
            <p className="text-gray-600 mb-4">Learn penetration testing and vulnerability assessment techniques.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Network Security</h3>
            <p className="text-gray-600 mb-4">Master network protection, firewalls, and intrusion detection systems.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Compliance</h3>
            <p className="text-gray-600 mb-4">Understand regulatory frameworks and compliance requirements.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cloud Security</h3>
            <p className="text-gray-600 mb-4">Secure cloud infrastructure and applications on AWS, Azure, and GCP.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Forensics</h3>
            <p className="text-gray-600 mb-4">Learn incident response and digital investigation techniques.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Operations</h3>
            <p className="text-gray-600 mb-4">Master SIEM tools, threat hunting, and security monitoring.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
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
