'use client';

export default function ClientLogos() {
  const clientLogos = [
    'TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Tech Mahindra', 
    'HCL', 'Cognizant', 'DXC Technology', 'LTI', 'Mindtree', 'Mphasis'
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
            Fortune 500 companies and innovative startups trust Sudaksha
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {clientLogos.map((logo, index) => (
            <div 
              key={index}
              className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-semibold"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
