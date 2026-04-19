import { prismaCore as prisma } from '@sudaksha/db-core';

async function seedOfflineBatches() {
  console.log('🌱 Seeding OfflineBatch records...');

  const batches = [
    {
      slug: 'advanced-enterprise-ai-transformation-811',
      programTitle: 'Advanced Enterprise AI Transformation',
      programDescription:
        'Comprehensive program on implementing AI/ML solutions across enterprise systems, covering strategy, architecture, and deployment best practices.',
      outcomes:
        'Participants learn to design AI solutions, implement ML pipelines, manage data infrastructure, and drive organizational AI transformation.',
      skillsCovered: ['Machine Learning', 'AI Architecture', 'Data Engineering', 'Enterprise AI Strategy', 'Deep Learning'],
      durationDays: 10,
      durationHours: 80,
      clientName: 'TechCorp Global',
      clientIndustry: 'TECHNOLOGY',
      clientSize: 'ENTERPRISE',
      clientLogoUrl: 'https://via.placeholder.com/200x100?text=TechCorp',
      showClientName: true,
      clientContactName: 'Raj Patel',
      clientContactEmail: 'raj@techcorp.com',
      clientContactPhone: '+91-9876543210',
      participantCount: 65,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-24'),
      deliveryMode: 'ONSITE',
      city: 'Bangalore',
      country: 'India',
      completionRate: 98,
      satisfactionScore: 4.9,
      certificationIssued: true,
      participantTestimonial:
        'This program provided exactly what we needed to accelerate our AI initiatives. The hands-on labs and real-world case studies made all the difference.',
      testimonialAuthor: 'Dr. Vikram Kumar',
      testimonialDesig: 'VP, Data & Analytics',
      status: 'PUBLISHED',
      isPublic: true,
      featuredOnHomepage: true,
      coverImageUrl: 'https://via.placeholder.com/800x400?text=AI+Transformation',
    },
    {
      slug: 'fintech-compliance-regulatory-framework',
      programTitle: 'Fintech Compliance & Regulatory Framework',
      programDescription:
        'In-depth training on RBI regulations, KYC compliance, AML procedures, and regulatory frameworks specific to fintech organizations.',
      outcomes:
        'Deep understanding of RBI guidelines, compliance procedures, regulatory reporting, and risk management in fintech.',
      skillsCovered: ['RBI Regulations', 'KYC/AML', 'Compliance', 'Risk Management', 'Regulatory Reporting'],
      durationDays: 5,
      durationHours: 40,
      clientName: 'FinServe Solutions',
      clientIndustry: 'FINTECH',
      clientSize: 'ENTERPRISE',
      clientLogoUrl: 'https://via.placeholder.com/200x100?text=FinServe',
      showClientName: true,
      clientContactName: 'Anjali Desai',
      clientContactEmail: 'anjali@finserve.com',
      clientContactPhone: '+91-9876543211',
      participantCount: 45,
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-02-14'),
      deliveryMode: 'HYBRID',
      city: 'Mumbai',
      country: 'India',
      completionRate: 100,
      satisfactionScore: 4.8,
      certificationIssued: true,
      participantTestimonial:
        'Excellent coverage of regulatory requirements. The compliance frameworks are now embedded in our organizational processes.',
      testimonialAuthor: 'Priya Sharma',
      testimonialDesig: 'Compliance Officer',
      status: 'PUBLISHED',
      isPublic: true,
      featuredOnHomepage: false,
      coverImageUrl: 'https://via.placeholder.com/800x400?text=Fintech+Compliance',
    },
    {
      slug: 'healthcare-data-security-hipaa',
      programTitle: 'Healthcare Data Security & HIPAA Compliance',
      programDescription:
        'Comprehensive training on healthcare data protection, HIPAA compliance requirements, cybersecurity best practices, and patient data privacy.',
      outcomes:
        'HIPAA compliance expertise, secure data handling procedures, incident response capabilities, healthcare security standards knowledge.',
      skillsCovered: ['HIPAA Compliance', 'Data Encryption', 'Access Controls', 'Incident Response', 'Security Audit'],
      durationDays: 3,
      durationHours: 24,
      clientName: 'MediCare Hospitals',
      clientIndustry: 'HEALTHCARE',
      clientSize: 'ENTERPRISE',
      clientLogoUrl: 'https://via.placeholder.com/200x100?text=MediCare',
      showClientName: true,
      clientContactName: 'Dr. Amit Patel',
      clientContactEmail: 'amit@medicare.com',
      clientContactPhone: '+91-9876543212',
      participantCount: 32,
      startDate: new Date('2024-03-05'),
      endDate: new Date('2024-03-07'),
      deliveryMode: 'ONSITE',
      city: 'Delhi',
      country: 'India',
      completionRate: 97,
      satisfactionScore: 4.9,
      certificationIssued: true,
      participantTestimonial:
        'Outstanding training that transformed our security posture. The practical implementations are now live across our infrastructure.',
      testimonialAuthor: 'Dr. Neha Kapoor',
      testimonialDesig: 'Head of IT Security',
      status: 'PUBLISHED',
      isPublic: true,
      featuredOnHomepage: true,
      coverImageUrl: 'https://via.placeholder.com/800x400?text=Healthcare+Security',
    },
    {
      slug: 'retail-operations-excellence-program',
      programTitle: 'Retail Operations Excellence Program',
      programDescription:
        'Strategic training on retail operations optimization, inventory management, customer service excellence, and digital transformation.',
      outcomes:
        'Operational efficiency improvements, inventory optimization techniques, enhanced customer satisfaction, digital retail strategy.',
      skillsCovered: ['Operations Management', 'Inventory Control', 'Customer Service', 'Digital Retail', 'Analytics'],
      durationDays: 4,
      durationHours: 32,
      clientName: 'Mega Retail Chain',
      clientIndustry: 'RETAIL',
      clientSize: 'ENTERPRISE',
      clientLogoUrl: 'https://via.placeholder.com/200x100?text=MegaRetail',
      showClientName: true,
      clientContactName: 'Arjun Desai',
      clientContactEmail: 'arjun@megaretail.com',
      clientContactPhone: '+91-9876543213',
      participantCount: 58,
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-03-23'),
      deliveryMode: 'OFFSITE',
      city: 'Pune',
      country: 'India',
      completionRate: 96,
      satisfactionScore: 4.7,
      certificationIssued: true,
      participantTestimonial:
        'Practical frameworks that we immediately implemented. The case studies are directly applicable to our business challenges.',
      testimonialAuthor: 'Neha Kapoor',
      testimonialDesig: 'Regional Manager',
      status: 'PUBLISHED',
      isPublic: true,
      featuredOnHomepage: false,
      coverImageUrl: 'https://via.placeholder.com/800x400?text=Retail+Operations',
    },
    {
      slug: 'supply-chain-logistics-optimization',
      programTitle: 'Supply Chain & Logistics Optimization',
      programDescription:
        'Advanced training on supply chain optimization, logistics network design, demand forecasting, and cost reduction strategies.',
      outcomes:
        'Supply chain efficiency improvement, cost reduction strategies implementation, demand forecasting expertise, logistics optimization skills.',
      skillsCovered: ['Supply Chain Management', 'Demand Forecasting', 'Logistics Optimization', 'Cost Reduction', 'Risk Management'],
      durationDays: 6,
      durationHours: 48,
      clientName: 'GlobalLogistics',
      clientIndustry: 'LOGISTICS',
      clientSize: 'ENTERPRISE',
      clientLogoUrl: 'https://via.placeholder.com/200x100?text=GlobalLogistics',
      showClientName: true,
      clientContactName: 'Suresh Nair',
      clientContactEmail: 'suresh@globallogistics.com',
      clientContactPhone: '+91-9876543214',
      participantCount: 42,
      startDate: new Date('2024-04-08'),
      endDate: new Date('2024-04-13'),
      deliveryMode: 'HYBRID',
      city: 'Bangalore',
      country: 'India',
      completionRate: 95,
      satisfactionScore: 4.6,
      certificationIssued: true,
      participantTestimonial:
        'Highly industry-relevant training with measurable ROI. The optimization techniques are delivering real results.',
      testimonialAuthor: 'Priya Verma',
      testimonialDesig: 'Supply Chain Director',
      status: 'PUBLISHED',
      isPublic: true,
      featuredOnHomepage: false,
      coverImageUrl: 'https://via.placeholder.com/800x400?text=Supply+Chain',
    },
  ];

  for (const batch of batches) {
    try {
      const existing = await prisma.offlineBatch.findUnique({
        where: { slug: batch.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${batch.slug} (already exists)`);
        continue;
      }

      await prisma.offlineBatch.create({
        data: batch,
      });

      console.log(`✅ Created: ${batch.programTitle}`);
    } catch (error) {
      console.error(`❌ Error creating ${batch.slug}:`, error);
    }
  }

  console.log('✨ OfflineBatch seeding complete!');
}

seedOfflineBatches()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
