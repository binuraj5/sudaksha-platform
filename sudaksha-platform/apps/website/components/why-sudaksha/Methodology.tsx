'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const pillars = [
  {
    title: 'LEARN BY DOING (70% Practical, 30% Theory)',
    traditional: '80% Theory: Lectures, slides, notes. 20% Practical: Lab exercises (if lucky)',
    sudaksha: '30% Theory: Concepts explained concisely. 70% Practical: Live coding, exercises, projects',
    structure: 'Daily Structure: First hour: Concept explanation + live demo. Next 2-3 hours: You code with trainer supervision. Last 30 min: Doubt clearing + assignment',
  },
  {
    title: 'SPACED REPETITION',
    description: 'Learn → Practice → Revise → Apply → Master',
    example: 'Week 1: Learn React components. Week 2: Build mini-project using components. Week 4: Revise components while learning state management. Week 8: Apply components in capstone project. Result: Mastery, not memorization',
  },
  {
    title: 'PEER LEARNING',
    description: 'Pair programming exercises, Code review sessions, Group projects, Study groups, Teach to learn',
    benefit: 'Learn from others\' mistakes, Different problem-solving approaches, Interview-ready teamwork skills',
  },
  {
    title: 'CONTINUOUS ASSESSMENT',
    description: 'Not one final exam. Continuous checkpoints.',
    structure: 'Weekly: 2-3 assignments, Quiz (optional), Code review. Bi-Weekly: Mini project submission, Peer review. Monthly: Major assessment, 1-on-1 feedback session with trainer',
    benefit: 'Early identification of weak areas, Timely intervention, No surprises at end',
  },
  {
    title: 'REAL-WORLD CONTEXT',
    description: 'Every concept taught with real industry context.',
    example: 'Example: Teaching Authentication. Bad way: "Here\'s JWT. Here\'s how to encode/decode." Sudaksha way: "You\'re building an e-commerce app. Users need to login. You can\'t store passwords in plain text (security risk). You can\'t use sessions (doesn\'t scale in microservices). Let me show you how PayTM handles authentication using JWT. Here\'s the architecture. Now let\'s build it." Result: You understand WHY, not just HOW.',
  },
  {
    title: 'GROWTH MINDSET CULTIVATION',
    description: 'Coding is 20% skill, 80% mindset.',
    teaching: 'We Actively Teach: Debugging mindset ("Errors are learning opportunities"), Googling skills (80% of coding is research), Stack Overflow etiquette, Asking good questions, Persistence through frustration, Imposter syndrome management, Continuous learning habits',
    quote: '"Sudaksha didn\'t just teach me Java. They taught me how to learn. Now when I encounter new tech at work, I\'m not scared. I know how to learn it." — Amit, Software Engineer',
  },
];

export function Methodology() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How We Teach: The Sudaksha Method
          </h2>
          <p className="text-xl text-gray-600">
            6 Pillars of Our Pedagogy
          </p>
        </motion.div>

        <div className="space-y-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 lg:p-12"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {index + 1}. {pillar.title}
              </h3>

              {pillar.traditional && pillar.sudaksha && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-red-600 mb-2">Traditional Approach:</h4>
                    <p className="text-gray-600">{pillar.traditional}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">Sudaksha Approach:</h4>
                    <p className="text-gray-700">{pillar.sudaksha}</p>
                  </div>
                </div>
              )}

              {pillar.structure && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-600 mb-2">Daily Structure:</h4>
                  <p className="text-gray-700">{pillar.structure}</p>
                </div>
              )}

              {pillar.description && (
                <div className="mb-6">
                  <p className="text-gray-700 text-lg">{pillar.description}</p>
                </div>
              )}

              {pillar.example && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-600 mb-2">Example:</h4>
                  <p className="text-gray-600 italic">{pillar.example}</p>
                </div>
              )}

              {pillar.benefit && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-600 mb-2">Benefit:</h4>
                  <p className="text-gray-700">{pillar.benefit}</p>
                </div>
              )}

              {pillar.teaching && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">We Actively Teach:</h4>
                  <p className="text-gray-700">{pillar.teaching}</p>
                </div>
              )}

              {pillar.quote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 italic">{pillar.quote}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}





