'use client';

export default function CaseStudiesPreview() {
  const caseStudies = [
    {
      client: 'Leading FinTech Unicorn',
      challenge: 'Migrate 50-person team from monolithic architecture to microservices',
      solution: '8-week custom training on Spring Cloud, Docker, Kubernetes, and service mesh architecture',
      results: [
        'Migration completed 3 months ahead of schedule',
        '40% reduction in deployment time',
        'Zero production incidents during migration'
      ]
    },
    {
      client: 'Global E-commerce Platform',
      challenge: 'Scale engineering team from 100 to 200 developers in 6 months',
      solution: 'Train-Hire-Deploy program: 100 candidates trained for 14 weeks, 87 deployed',
      results: [
        '87% deployment success rate',
        'Average onboarding time reduced from 8 weeks to 2 weeks',
        'Cost per hire 35% lower than traditional recruitment'
      ]
    },
    {
      client: 'Healthcare SaaS Provider',
      challenge: 'Upskill existing Java team on HIPAA compliance and secure healthcare data handling',
      solution: 'Custom 6-week intensive on HIPAA, FHIR standards, secure APIs, and healthcare architecture',
      results: [
        'Achieved HIPAA certification 2 months early',
        'Zero security vulnerabilities in audit',
        '50% faster development of compliant features'
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Real Results, Real Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how we've helped companies like yours solve their biggest challenges
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-blue-600 mb-2">{study.client}</h3>
                <p className="text-gray-600 text-sm mb-3">{study.challenge}</p>
                <p className="text-gray-700 text-sm">{study.solution}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Results:</h4>
                <ul className="space-y-2">
                  {study.results.map((result, resultIndex) => (
                    <li key={resultIndex} className="flex items-start text-sm text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="mt-6 w-full text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors duration-200">
                Read Full Case Study →
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200">
            View All Case Studies
          </button>
        </div>
      </div>
    </section>
  );
}
