'use client';

import { Shield, Award, CheckCircle, Globe, Users, FileText, Star, TrendingUp } from 'lucide-react';

export default function ComplianceStandards() {
  const certifications = [
    {
      name: 'ISO 9001:2015 Quality Management',
      category: 'Quality Management',
      scope: 'Training delivery, curriculum development, assessment processes',
      validUntil: '2026',
      description: 'Ensures consistent quality in all training and delivery processes',
      icon: '🏆'
    },
    {
      name: 'ISO 27001 Information Security Management',
      category: 'Information Security',
      scope: 'Data protection, secure infrastructure, risk management',
      validUntil: '2025',
      description: 'Comprehensive information security and data protection standards',
      icon: '🔒'
    },
    {
      name: 'ISO/IEC 27032 Cybersecurity',
      category: 'Cybersecurity',
      scope: 'Security controls, threat management, incident response',
      validUntil: '2024',
      description: 'Advanced cybersecurity controls and threat Management',
      icon: '🛡️'
    }
  ];

  const complianceFrameworks = [
    {
      name: 'GDPR (General Data Protection Regulation)',
      region: 'Europe & Africa Operations',
      type: 'Data Protection',
      description: 'Comprehensive data protection and privacy regulations',
      requirements: ['Data subject rights', 'Consent management', 'Breach notification', 'Data portability']
    },
    {
      name: 'POPIA (Protection of Personal Information Act)',
      region: 'South Africa',
      type: 'Data Protection',
      description: 'South African data protection and privacy legislation',
      requirements: ['Processing limitation', 'Purpose specification', 'Security safeguards', 'Data subject access']
    },
    {
      name: 'NDPR (Nigeria Data Protection Regulation)',
      region: 'Nigeria',
      type: 'Data Protection',
      description: 'Nigerian data protection and privacy regulations',
      requirements: ['Data processing principles', 'Rights of data subjects', 'Cross-border transfers']
    },
    {
      name: 'CCPA (California Consumer Privacy Act)',
      region: 'US Operations',
      type: 'Data Protection',
      description: 'California state privacy regulations',
      requirements: ['Consumer rights', 'Business transparency', 'Data breach notification']
    }
  ];

  const qualityStandards = [
    {
      standard: 'Training Excellence Framework',
      description: 'Structured approach to curriculum design, delivery, and assessment',
      components: ['Learning objectives', 'Competency mapping', 'Assessment methodology', 'Continuous improvement']
    },
    {
      standard: 'Global Delivery Standards',
      description: 'Consistent training quality across all international operations',
      components: ['Standardized curriculum', 'Qualified instructors', 'Quality assurance', 'Performance metrics']
    },
    {
      standard: 'Industry-Specific Compliance',
      description: 'Sector-specific requirements for banking, government, and technology',
      components: ['Banking compliance', 'Government standards', 'IT security frameworks', 'Audit readiness']
    }
  ];

  const auditProcesses = [
    {
      process: 'Internal Quality Audits',
      frequency: 'Quarterly',
      scope: 'Training delivery, curriculum effectiveness, instructor performance',
      outcomes: ['Quality improvement', 'Process optimization', 'Risk identification']
    },
    {
      process: 'External Compliance Reviews',
      frequency: 'Bi-annual',
      scope: 'Regulatory compliance, data security, privacy standards',
      outcomes: ['Compliance certification', 'Gap identification', 'Remediation planning']
    },
    {
      process: 'Client-Specific Audits',
      frequency: 'Project-based',
      scope: 'Custom requirements, industry standards, security protocols',
      outcomes: ['Custom compliance', 'Quality assurance', 'Client satisfaction']
    }
  ];

  const globalOperations = [
    {
      region: 'Africa Operations',
      headquarters: 'Nairobi, Kenya',
      complianceOfficer: 'Regional Compliance Director',
      standards: ['ISO 9001', 'GDPR', 'Local data protection laws'],
      certifications: ['ISO 9001:2015', 'GDPR Compliant', 'African Data Protection Certified']
    },
    {
      region: 'MENA Operations',
      headquarters: 'Dubai, UAE',
      complianceOfficer: 'MENA Compliance Manager',
      standards: ['ISO 27001', 'CCPA', 'Regional privacy laws'],
      certifications: ['ISO 27001', 'CCPA Compliant', 'Middle East Privacy Certified']
    },
    {
      region: 'Latin America Operations',
      headquarters: 'São Paulo, Brazil',
      complianceOfficer: 'LATAM Compliance Lead',
      standards: ['LGPD', 'ISO 9001', 'Local regulations'],
      certifications: ['ISO 9001', 'LGPD Compliant', 'Brazil Data Protection Certified']
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Compliance & Standards: Global Excellence, Local Trust
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Our commitment to international standards, data protection, and quality assurance 
            ensures trusted partnerships across Africa, MENA, and emerging markets.
          </p>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">International Certifications</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">{cert.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{cert.name}</h4>
                  <div className="text-sm text-gray-600 mb-3">{cert.category}</div>
                  <p className="text-sm text-gray-700 mb-4">{cert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Valid Until:</span>
                    <span className="text-sm font-semibold text-green-600">{cert.validUntil}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Frameworks */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Regulatory Compliance</h3>
          <div className="grid grid-cols-4 gap-6">
            {complianceFrameworks.map((framework, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{framework.name}</h4>
                    <div className="text-sm text-gray-600 mb-2">{framework.region}</div>
                    <p className="text-sm text-gray-700 mb-3">{framework.description}</p>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Key Requirements:</span>
                      <ul className="mt-2 space-y-1">
                        {framework.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Standards */}
        <div className="grid grid-cols-3 gap-6">
          {qualityStandards.map((standard, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">{standard.standard}</h4>
              <p className="text-sm text-gray-700 mb-3">{standard.description}</p>
              <div>
                <span className="text-sm font-medium text-gray-600">Components:</span>
                <ul className="mt-2 space-y-1">
                  {standard.components.map((component, compIndex) => (
                    <li key={compIndex} className="flex items-start text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{component}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Audit Processes */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Audit & Assurance Processes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {auditProcesses.map((process, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-purple-600 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{process.process}</h4>
                    <div className="text-sm text-gray-600 mb-2">Frequency: {process.frequency}</div>
                    <div className="text-sm text-gray-700 mb-3">{process.scope}</div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Key Outcomes:</span>
                      <ul className="mt-2 space-y-1">
                        {process.outcomes.map((outcome, outcomeIndex) => (
                          <li key={outcomeIndex} className="flex items-start text-sm text-gray-700">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Operations */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Global Operations Compliance</h3>
          <div className="grid grid-cols-3 gap-6">
            {globalOperations.map((operation, index) => (
              <div key={index} className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Globe className="w-6 h-6 text-green-600 mr-3" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{operation.region}</h4>
                    <div className="text-sm text-gray-600 mb-2">
                      Headquarters: {operation.headquarters}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Compliance Officer: {operation.complianceOfficer}
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <span className="text-sm font-medium text-gray-600">Standards:</span>
                      <div className="flex flex-wrap gap-2">
                        {operation.standards.map((standard, stdIndex) => (
                          <span key={stdIndex} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                            {standard}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Certifications:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {operation.certifications.map((cert, certIndex) => (
                          <span key={certIndex} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Partner with Confidence: Certified & Compliant
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our comprehensive compliance framework and international certifications ensure 
              your projects meet global standards while respecting local regulations. 
              Partner with us for trusted, compliant, and secure international operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                <Users className="w-5 h-5 mr-2 inline" />
                Schedule Compliance Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
