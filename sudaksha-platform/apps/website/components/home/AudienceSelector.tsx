'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building, User, GraduationCap, ArrowRight } from 'lucide-react';
import { AUDIENCE_CARDS } from '../../lib/constants/home';

export function AudienceSelector() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building': return Building;
      case 'User': return User;
      case 'GraduationCap': return GraduationCap;
      default: return User;
    }
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'blue':
        return 'from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500';
      case 'orange':
        return 'from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500';
      case 'green':
        return 'from-green-300 to-green-400 hover:from-green-400 hover:to-green-500';
      default:
        return 'from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500';
    }
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Path
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-8">
            Whether you're an individual looking to grow, a corporate scaling your team, or an institution building careers — we have a solution for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {AUDIENCE_CARDS.map((card: any, index: number) => {
            const Icon = getIcon(card.icon);
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getThemeClasses(card.theme)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-br ${getThemeClasses(card.theme)} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-lg text-gray-700 mb-4">{card.subtitle}</p>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-6">
                    {card.benefits.map((benefit: string, benefitIndex: number) => (
                      <motion.li
                        key={benefitIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.2 + benefitIndex * 0.1 + 0.5 }}
                        className="flex items-start space-x-2"
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getThemeClasses(card.theme)} flex items-center justify-center flex-shrink-0 mt-1`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-base">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.a
                    href={card.link}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${getThemeClasses(card.theme)} text-white rounded-2xl font-bold transition-all duration-300`}
                  >
                    {card.cta}
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
