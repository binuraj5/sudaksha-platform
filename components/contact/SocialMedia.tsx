'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';

const socialLinks = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    followers: '15K followers',
    description: 'Industry insights, job postings',
    url: '#',
    color: 'hover:text-blue-600',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    followers: '8K subscribers',
    description: 'Tutorial videos, success stories',
    url: '#',
    color: 'hover:text-red-600',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    followers: '12K followers',
    description: 'Student life, tips',
    url: '#',
    color: 'hover:text-pink-600',
  },
  {
    name: 'Twitter/X',
    icon: Twitter,
    followers: '5K followers',
    description: 'Tech news, quick tips',
    url: '#',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    followers: '10K followers',
    description: 'Community, events',
    url: '#',
    color: 'hover:text-blue-700',
  },
];

export function SocialMedia() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Follow Us for Updates
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-200`}>
                  <social.icon className={`w-6 h-6 text-gray-600 ${social.color}`} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{social.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{social.followers}</p>
                  <p className="text-xs text-gray-600 mt-2">{social.description}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}





