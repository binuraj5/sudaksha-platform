// API-based seeding script for FAQs


const existingFAQsFromPages = [
  // From /faq page - General category
  {
    question: 'What is Sudaksha?',
    answer: 'Sudaksha is a leading skill development platform offering comprehensive training programs for individuals, institutions, and corporations across India and emerging markets. We specialize in IT, non-IT, functional, and personal development courses.',
    category: 'General',
    order: 1,
  },
  {
    question: 'Where is Sudaksha located?',
    answer: 'Our headquarters is located in Hyderabad, India. We offer both in-person and online training options to cater to learners nationwide.',
    category: 'General',
    order: 2,
  },
  {
    question: 'What makes Sudaksha different from other training providers?',
    answer: 'Sudaksha focuses on practical, industry-aligned training with a unique emphasis on brain circulation and creating skilled workforces in emerging markets. We offer customized programs, experienced trainers, and strong placement support.',
    category: 'General',
    order: 3,
  },
  
  // From /faq page - Courses & Programs
  {
    question: 'What types of courses do you offer?',
    answer: 'We offer courses across four main categories: IT (software development, data analytics, cloud, AI/ML, cybersecurity), Non-IT (project management, business analysis), Functional (domain-specific skills), and Personal Development (soft skills, leadership).',
    category: 'Courses & Programs',
    order: 1,
  },
  {
    question: 'How long are the courses?',
    answer: 'Course duration varies based on the program. We offer short-term workshops (1-2 days), intensive bootcamps (4-12 weeks), and comprehensive programs (3-6 months). Check individual course pages for specific durations.',
    category: 'Courses & Programs',
    order: 2,
  },
  {
    question: 'Are the courses online or in-person?',
    answer: 'We offer multiple delivery modes: fully online (live instructor-led), in-person (at our centers or your location), and hybrid (combination of both). The available modes are specified on each course page.',
    category: 'Courses & Programs',
    order: 3,
  },
  {
    question: 'Do you offer certifications?',
    answer: 'Yes, all our courses include a Sudaksha completion certificate. Many of our programs also prepare you for industry-recognized certifications from providers like AWS, Microsoft, Google, PMI, and others.',
    category: 'Courses & Programs',
    order: 4,
  },

  // From /faq page - Enrollment & Pricing
  {
    question: 'How do I enroll in a course?',
    answer: 'Browse our course catalog, select your desired course, and click "Enroll Now" or "Contact Us". Our team will guide you through the enrollment process, payment options, and batch schedules.',
    category: 'Enrollment & Pricing',
    order: 1,
  },
  {
    question: 'What are the payment options?',
    answer: 'We accept various payment methods including credit/debit cards, bank transfers, and installment plans. Corporate clients can request invoice-based billing. Contact us for specific payment arrangements.',
    category: 'Enrollment & Pricing',
    order: 2,
  },
  {
    question: 'Do you offer group discounts?',
    answer: 'Yes! We offer attractive discounts for group enrollments (3+ individuals) and special corporate packages. Contact our sales team for customized pricing.',
    category: 'Enrollment & Pricing',
    order: 3,
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a refund within 7 days of course commencement if you\'re not satisfied. Please refer to our Terms of Service for complete refund policy details.',
    category: 'Enrollment & Pricing',
    order: 4,
  },

  // From /faq page - Corporate Training
  {
    question: 'Do you offer customized corporate training?',
    answer: 'Yes, we specialize in customized training programs tailored to your organization\'s specific needs, skill gaps, and business objectives. We can deliver training at your location or our facilities.',
    category: 'Corporate Training',
    order: 1,
  },
  {
    question: 'What is the minimum group size for corporate training?',
    answer: 'We can accommodate groups of any size, from small teams of 5 to large batches of 100+. We\'ll design the program to suit your group size and learning objectives.',
    category: 'Corporate Training',
    order: 2,
  },
  {
    question: 'How do you measure training effectiveness?',
    answer: 'We use pre and post-training assessments, practical projects, feedback surveys, and performance metrics to measure learning outcomes and ROI. We provide detailed reports to corporate clients.',
    category: 'Corporate Training',
    order: 3,
  },

  // From /faq page - Placement & Support
  {
    question: 'Do you provide placement assistance?',
    answer: 'Yes, we offer comprehensive placement support including resume building, interview preparation, and job referrals to our corporate partners. Placement success depends on individual performance and market conditions.',
    category: 'Placement & Support',
    order: 1,
  },
  {
    question: 'Do you guarantee job placement?',
    answer: 'While we provide strong placement support and have excellent placement rates, we cannot guarantee job placement as it depends on various factors including market conditions, individual skills, and performance.',
    category: 'Placement & Support',
    order: 2,
  },
  {
    question: 'What kind of support is available after course completion?',
    answer: 'We offer lifetime access to course materials, alumni network access, continued career guidance, and updates on new courses and industry trends.',
    category: 'Placement & Support',
    order: 3,
  },

  // From /resources page - Quick FAQs
  {
    question: 'Which program is best for freshers?',
    answer: 'Depends on interest. Most popular: Java Full Stack (enterprise), MERN Stack (startups), Data Science (analytics). Take assessment to find your fit.',
    category: 'Getting Started',
    order: 1,
    featured: true,
  },
  {
    question: 'Do you provide placement guarantee?',
    answer: 'We guarantee placement support (not placement itself, as no one can legally). 85% of students get placed within 6 months.',
    category: 'Getting Started',
    order: 2,
    featured: true,
  },
  {
    question: 'Can I pay after getting a job?',
    answer: 'Yes! Pay After Placement option available for select programs. Learn more',
    category: 'Getting Started',
    order: 3,
  },
  {
    question: 'I\'m 35 years old. Can I switch to tech?',
    answer: 'Yes! We\'ve helped 800+ career switchers aged 25-42. Read their stories',
    category: 'Getting Started',
    order: 4,
  },
  {
    question: 'How long does it take to become job-ready?',
    answer: '3-6 months for intensive programs, 6-8 months for weekend batches.',
    category: 'Getting Started',
    order: 5,
  },
  {
    question: 'What\'s the difference between online and offline classes?',
    answer: 'Online: Flexible timing, same curriculum. Offline: Bangalore campus, networking. Both have same placement support.',
    category: 'Getting Started',
    order: 6,
  },
  {
    question: 'Do you provide job referrals?',
    answer: 'Yes! We have partnerships with 200+ companies and provide direct referrals. Many students get interviews before completing the course.',
    category: 'Getting Started',
    order: 7,
    featured: true,
  },
  {
    question: 'What if I miss classes?',
    answer: 'Recorded sessions available. Weekend batches for working professionals. Doubt-clearing sessions every week.',
    category: 'Getting Started',
    order: 8,
  },
  {
    question: 'Can I get a demo class before joining?',
    answer: 'Absolutely! Free demo classes every Saturday & Sunday. Experience our teaching methodology.',
    category: 'Getting Started',
    order: 9,
  },
  {
    question: 'What documents do I need for enrollment?',
    answer: 'ID proof, educational certificates. No experience required for most programs. Detailed list provided after admission.',
    category: 'Getting Started',
    order: 10,
  },
];

async function seedExistingFAQs() {
  try {
    console.log('🌱 Starting to seed existing FAQs...\n');
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const faq of existingFAQsFromPages) {
      try {
        // Check if FAQ already exists (to avoid duplicates) via API
        const getRes = await fetch('http://localhost:3000/api/admin/faqs');
        if (!getRes.ok) throw new Error('Could not fetch existing FAQs');
        
        const { faqs: existingFaqs } = await getRes.json();
        const exists = existingFaqs?.some(f => f.question === faq.question);

        if (!exists) {
          const createRes = await fetch('http://localhost:3000/api/admin/faqs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': 'admin_session={"email":"admin@sudaksha.com"}'
            },
            body: JSON.stringify({
              question: faq.question,
              answer: faq.answer,
              category: faq.category,
              order: faq.order,
              featured: faq.featured || false,
              status: 'PUBLISHED',
            }),
          });

          if (createRes.ok) {
            console.log(`✅ Migrated: "${faq.question}"`);
            migratedCount++;
          } else {
            const error = await createRes.json();
            console.error(`❌ Failed to migrate "${faq.question}": ${error.error}`);
          }
        } else {
          console.log(`⏭️  Already exists: "${faq.question}"`);
          skippedCount++;
        }
      } catch (itemError) {
        console.error(`❌ Error migrating "${faq.question}": ${itemError.message}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Migration Complete!`);
    console.log(`   📊 Total FAQs: ${migratedCount + skippedCount}`);
    console.log(`   ✨ Newly migrated: ${migratedCount}`);
    console.log(`   ⏭️  Already existed: ${skippedCount}`);
    console.log(`${'='.repeat(60)}\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical error during seeding:', error.message);
    process.exit(1);
  }
}

seedExistingFAQs();
