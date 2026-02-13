import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud & DevOps Courses - Sudaksha | AWS, Azure & DevOps Training',
  description: 'Master cloud computing platforms (AWS, Azure, GCP) and DevOps practices including CI/CD, containers, and infrastructure as code.',
  keywords: 'cloud computing, AWS, Azure, DevOps, CI/CD, Docker, Kubernetes, infrastructure as code',
};

export default function CloudDevOpsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cloud & DevOps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master cloud platforms and DevOps practices to build, deploy, and manage modern applications at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AWS Solutions Architect</h3>
            <p className="text-gray-600 mb-4">Design and deploy scalable solutions on Amazon Web Services.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Azure Cloud Engineer</h3>
            <p className="text-gray-600 mb-4">Master Microsoft Azure services and cloud architecture.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Docker & Kubernetes</h3>
            <p className="text-gray-600 mb-4">Learn containerization and orchestration for modern applications.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">CI/CD Pipeline Engineering</h3>
            <p className="text-gray-600 mb-4">Build automated deployment pipelines with Jenkins, GitLab CI, and GitHub Actions.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Infrastructure as Code</h3>
            <p className="text-gray-600 mb-4">Automate infrastructure provisioning with Terraform and CloudFormation.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">DevOps Engineering</h3>
            <p className="text-gray-600 mb-4">Comprehensive DevOps practices covering tools, culture, and methodologies.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
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
