'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Phone } from 'lucide-react';

const departments = [
  {
    name: 'Admissions & Enrollment',
    email: 'admissions@sudaksha.com',
    phone: '+91-XXXXX-XXXXX',
  },
  {
    name: 'Corporate Training',
    email: 'corporate@sudaksha.com',
    phone: '+91-XXXXX-XXXXX',
  },
  {
    name: 'Institution Partnerships',
    email: 'institutions@sudaksha.com',
    phone: '+91-XXXXX-XXXXX',
  },
  {
    name: 'Career Switchers',
    email: 'careerswitch@sudaksha.com',
    phone: '+91-XXXXX-XXXXX',
  },
  {
    name: 'Placement Support (Current Students)',
    email: 'placements@sudaksha.com',
    phone: null,
  },
  {
    name: 'Technical Support',
    email: 'support@sudaksha.com',
    phone: null,
  },
  {
    name: 'Media & Press',
    email: 'media@sudaksha.com',
    phone: null,
  },
];

export function DepartmentContacts() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Department-Wise Contacts
          </h2>
          <p className="text-xl text-gray-600">
            For Specific Needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {dept.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
                  >
                    {dept.email}
                  </a>
                </div>

                {dept.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a
                      href={`tel:${dept.phone}`}
                      className="text-blue-600 hover:text-blue-700 text-sm hover:underline font-mono"
                    >
                      {dept.phone}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}





