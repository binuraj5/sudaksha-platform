'use client';

import DomesticHero from '@/components/domestic/DomesticHero';
import DifferentiatorTable from '@/components/domestic/DifferentiatorTable';
import TrainingEcosystem from '@/components/domestic/TrainingEcosystem';
import TrainingCategories from '@/components/domestic/TrainingCategories';
import CurationProcess from '@/components/domestic/CurationProcess';
import EmploymentModels from '@/components/domestic/EmploymentModels';
import OrgTransformation from '@/components/domestic/OrgTransformation';
import LearningJourneys from '@/components/domestic/LearningJourneys';
import DeliveryFormats from '@/components/domestic/DeliveryFormats';
import SuccessMetrics from '@/components/domestic/SuccessMetrics';
import CaseStudies from '@/components/domestic/CaseStudies';
import FinalCTA from '@/components/domestic/FinalCTA';
import { Calendar, FileText, BookOpen } from 'lucide-react';

// Temporary data until we fix imports
const mockData = {
  hero: {
    eyebrow: "DOMESTIC B2B TRAINING SOLUTIONS",
    headline: "Building India's Workforce, One Capability at a Time",
    subheadline: "From technical skills to behavioral transformation. From individual excellence to organizational capability. We don't just train—we transform through precision-curation and measurable outcomes.",
    valuePropositions: [
      { id: 1, text: "IT Training: Cloud, AI/ML, Full Stack, DevOps, Data Engineering" },
      { id: 2, text: "Non-IT Training: Leadership, Sales, Process Excellence, OB Interventions" },
      { id: 3, text: "Employment Models: Train-Hire-Deploy & Deploy-Hire-Train" },
      { id: 4, text: "Organizational Transformation: Change Management & Culture Building" }
    ],
    primaryCTA: { text: "Design Your Training Program", href: "#training-categories" },
    secondaryCTA: { text: "Explore Training Categories", href: "#training-categories" },
    trustBanner: "500+ Programs Delivered | 50,000+ Professionals Trained | 200+ Indian Enterprises",
    heroVisual: {
      type: "split",
      leftImage: "/images/domestic/hero-left.jpg",
      rightImage: "/images/domestic/hero-right.jpg",
      centerOverlay: "360° Capability Building"
    }
  },
  differentiator: {
    headline: "Beyond Generic Training: The Sudaksha Domestic Advantage",
    subheadline: "We don't just train—we transform through precision-curation and measurable outcomes",
    comparisons: [
      { aspect: "Approach", traditional: "Catalogue-based selection", sudaksha: "Problem-first diagnosis" },
      { aspect: "Customization", traditional: "Minor tweaks", sudaksha: "100% custom-curated" },
      { aspect: "Trainers", traditional: "Career trainers", sudaksha: "Working practitioners + OB experts" },
      { aspect: "Content Mix", traditional: "Pure technical OR pure soft skills", sudaksha: "Integrated technical + behavioral" },
      { aspect: "Assessment", traditional: "Pre & post tests", sudaksha: "Diagnostic → Baseline → Continuous → Impact" },
      { aspect: "Follow-up", traditional: "Certificate delivery", sudaksha: "90-day integration support" },
      { aspect: "Business Alignment", traditional: "Training KPIs", sudaksha: "Business outcome metrics" },
      { aspect: "Scalability", traditional: "Limited by trainer pool", sudaksha: "THD/DHT employment models" }
    ]
  },
  ecosystem: {
    headline: "Our 360° Training Ecosystem",
    innerCircle: {
      title: "INDIVIDUAL CAPABILITY",
      items: ["Technical Skills (IT Training)", "Functional Skills (Business Skills)", "Behavioral Skills (OB Interventions)", "Leadership Skills"]
    },
    middleCircle: {
      title: "TEAM CAPABILITY",
      items: ["Team Dynamics", "Collaboration Tools", "Process Excellence", "Agile Ways of Working"]
    },
    outerCircle: {
      title: "ORGANIZATIONAL CAPABILITY",
      items: ["Culture Transformation", "Change Management", "Digital Transformation", "Performance Systems"]
    },
    bottomText: "We build capability at all three levels: Individual → Team → Organization"
  },
  trainingCategories: [
    {
      id: "technical",
      title: "Technical Training",
      icon: "Code",
      coverage: "IT and software development skills",
      whatWeCover: ["Full Stack Development", "Cloud Computing", "DevOps", "Data Science", "Mobile Development"],
      typicalPrograms: [
        { title: "Full Stack Developer", duration: "6 months", hours: 480 },
        { title: "Cloud Architect", duration: "4 months", hours: 320 }
      ],
      businessOutcomes: ["Improved code quality", "Faster development cycles", "Reduced technical debt"],
      cta: { text: "Explore Technical Programs", href: "#employment-models" }
    },
    {
      id: "behavioral",
      title: "Behavioral Training",
      icon: "Users",
      coverage: "Soft skills and professional development",
      whatWeCover: ["Communication Skills", "Leadership", "Team Building", "Time Management", "Emotional Intelligence"],
      typicalPrograms: [
        { title: "Leadership Excellence", duration: "3 months", hours: 120 },
        { title: "Communication Mastery", duration: "2 months", hours: 80 }
      ],
      businessOutcomes: ["Better team collaboration", "Improved productivity", "Enhanced employee satisfaction"],
      cta: { text: "Explore Behavioral Programs", href: "#employment-models" }
    },
    {
      id: "leadership",
      title: "Leadership Development",
      icon: "Award",
      coverage: "Management and executive training",
      whatWeCover: ["Strategic Thinking", "Decision Making", "Change Management", "Executive Presence", "Team Leadership"],
      typicalPrograms: [
        { title: "Executive Leadership", duration: "4 months", hours: 160 },
        { title: "Management Excellence", duration: "3 months", hours: 120 }
      ],
      businessOutcomes: ["Stronger leadership pipeline", "Better strategic decisions", "Improved organizational culture"],
      cta: { text: "Explore Leadership Programs", href: "#employment-models" }
    }
  ],
  curationProcess: {
    headline: "Our Six-Sigma Curation Process",
    subheadline: "Precision methodology for perfect talent solutions",
    steps: [
      {
        step: 1,
        title: "Discovery",
        duration: "1-2 weeks",
        activities: ["Needs assessment", "Stakeholder interviews", "Gap analysis"],
        deliverable: "Comprehensive requirement document"
      },
      {
        step: 2,
        title: "Assessment",
        duration: "1 week",
        activities: ["Skill evaluation", "Team analysis", "Current state review"],
        deliverable: "Detailed assessment report"
      },
      {
        step: 3,
        title: "Design",
        duration: "2-3 weeks",
        activities: ["Curriculum design", "Content creation", "Methodology selection"],
        deliverable: "Custom training program blueprint"
      },
      {
        step: 4,
        title: "Development",
        duration: "3-4 weeks",
        activities: ["Content development", "Material preparation", "Trainer briefing"],
        deliverable: "Complete training materials"
      },
      {
        step: 5,
        title: "Implementation",
        duration: "Ongoing",
        activities: ["Training delivery", "Progress monitoring", "Feedback collection"],
        deliverable: "Live training execution"
      },
      {
        step: 6,
        title: "Evaluation",
        duration: "2 weeks",
        activities: ["Impact assessment", "ROI analysis", "Success measurement"],
        deliverable: "Performance impact report"
      }
    ]
  },
  employmentModels: {
    thd: {
      title: "Train-Hire-Deploy (THD)",
      bestFor: ["Large-scale hiring", "Long-term talent needs", "Complete talent solutions"],
      phases: [
        {
          title: "Training Phase",
          duration: "3-6 months",
          activities: ["Skill development", "Certification programs", "Practical projects"]
        },
        {
          title: "Deployment Phase",
          duration: "1 month",
          activities: ["Onboarding", "Team integration", "Performance monitoring"]
        },
        {
          title: "Support Phase",
          duration: "Ongoing",
          activities: ["Continuous learning", "Career development", "Performance coaching"]
        }
      ],
      investmentModel: {
        description: "Fixed fee per candidate with success-based milestones",
        details: ["Training costs included", "Deployment support", "3-month guarantee"]
      },
      successMetrics: [
        { label: "Time to Productivity", value: "60% faster" },
        { label: "Retention Rate", value: "95% after 1 year" },
        { label: "Cost Savings", value: "30% vs traditional hiring" }
      ],
      caseStudyPreview: {
        title: "TechCorp IT Team Expansion",
        results: ["50 developers deployed", "95% retention", "40% cost reduction"]
      },
      cta: { text: "Explore THD Model", href: "#success-metrics" }
    },
    dht: {
      title: "Deploy-Hire-Train (DHT)",
      bestFor: ["Immediate needs", "Critical projects", "Talent shortages"],
      phases: [
        {
          title: "Deployment Phase",
          duration: "Immediate",
          activities: ["Rapid onboarding", "Project integration", "Initial training"]
        },
        {
          title: "Training Phase",
          duration: "3-6 months",
          activities: ["Skill enhancement", "Certification", "On-the-job training"]
        },
        {
          title: "Evaluation Phase",
          duration: "1 month",
          activities: ["Performance assessment", "Skill validation", "Hiring decision"]
        }
      ],
      investmentModel: {
        description: "Try-before-hire model with conversion option",
        details: ["No upfront hiring cost", "Performance-based evaluation", "Flexible conversion"]
      },
      successMetrics: [
        { label: "Time to Deploy", value: "48 hours" },
        { label: "Conversion Rate", value: "85% to full-time" },
        { label: "Risk Reduction", value: "70% lower hiring risk" }
      ],
      caseStudyPreview: {
        title: "FinanceHub Digital Transformation",
        results: ["20 consultants deployed", "80% conversion", "Zero hiring risk"]
      },
      cta: { text: "Explore DHT Model", href: "#success-metrics" }
    }
  },
  transformation: {
    headline: "Organizational Transformation",
    pillars: [
      {
        title: "Change Management",
        whatItIs: "Systematic approach to managing organizational change and transitions",
        whenYouNeedIt: ["Mergers & acquisitions", "Digital transformation", "Process reengineering", "Leadership changes"],
        approach: ["Stakeholder analysis", "Communication strategy", "Training programs", "Feedback mechanisms"],
        typicalDuration: "3-6 months",
        keyOutcomes: ["Reduced resistance", "Faster adoption", "Higher engagement", "Sustainable change"],
        cta: { text: "Explore Change Management", href: "#success-metrics" }
      },
      {
        title: "Culture Transformation",
        whatItIs: "Strategic evolution of organizational culture to support business objectives",
        whenYouNeedIt: ["Performance issues", "Low morale", "High turnover", "Innovation challenges"],
        approach: ["Culture assessment", "Leadership alignment", "Team workshops", "Behavioral coaching"],
        typicalDuration: "6-12 months",
        keyOutcomes: ["Improved performance", "Better collaboration", "Higher retention", "Innovation culture"],
        cta: { text: "Explore Culture Transformation", href: "#success-metrics" }
      },
      {
        title: "Leadership Evolution",
        whatItIs: "Development of leadership capabilities at all organizational levels",
        whenYouNeedIt: ["Leadership gaps", "Succession planning", "Team performance issues", "Strategic changes"],
        approach: ["Leadership assessment", "Coaching programs", "Skill development", "360-degree feedback"],
        typicalDuration: "4-8 months",
        keyOutcomes: ["Stronger leaders", "Better decisions", "Higher engagement", "Improved results"],
        cta: { text: "Explore Leadership Evolution", href: "#success-metrics" }
      },
      {
        title: "Performance Systems",
        whatItIs: "Design and implementation of effective performance management systems",
        whenYouNeedIt: ["Inconsistent performance", "Unclear metrics", "Low accountability", "Poor alignment"],
        approach: ["System assessment", "Metric design", "Process implementation", "Training programs"],
        typicalDuration: "2-4 months",
        keyOutcomes: ["Clear metrics", "Higher accountability", "Better alignment", "Improved results"],
        cta: { text: "Explore Performance Systems", href: "#success-metrics" }
      }
    ]
  },
  learningJourney: {
    headline: "Integrated Learning Journeys",
    scenario: "Full Stack Developer Program - 6 Month Transformation",
    months: [
      {
        month: "Foundation",
        technicalFocus: {
          topic: "Core Programming Fundamentals",
          skills: ["JavaScript", "HTML/CSS", "Git", "Command Line", "Data Structures"],
          projects: ["Personal Portfolio", "Todo App", "Weather Dashboard"]
        },
        behavioralFocus: {
          topic: "Professional Foundations",
          skills: ["Communication", "Time Management", "Team Collaboration", "Problem Solving"],
          activities: ["Team Projects", "Presentations", "Code Reviews", "Pair Programming"]
        },
        integration: {
          description: "Building foundational technical skills with professional behaviors",
          deliverables: ["Personal Portfolio", "Team Project", "Skills Assessment"]
        }
      },
      {
        month: "Frontend Development",
        technicalFocus: {
          topic: "Modern Frontend Technologies",
          skills: ["React", "TypeScript", "State Management", "API Integration", "Responsive Design"],
          projects: ["E-commerce Site", "Social Media Dashboard", "Company Website"]
        },
        behavioralFocus: {
          topic: "Client Communication",
          skills: ["Requirement Gathering", "Stakeholder Management", "Presentation Skills", "Negotiation"],
          activities: ["Client Meetings", "Project Presentations", "Requirement Workshops", "Design Reviews"]
        },
        integration: {
          description: "Developing frontend applications with client-facing skills",
          deliverables: ["E-commerce Platform", "Client Presentation", "Technical Documentation"]
        }
      },
      {
        month: "Backend Development",
        technicalFocus: {
          topic: "Server-Side Technologies",
          skills: ["Node.js", "Databases", "API Design", "Authentication", "Cloud Services"],
          projects: ["REST API", "Database Schema", "Authentication System", "Cloud Deployment"]
        },
        behavioralFocus: {
          topic: "System Thinking",
          skills: ["Architecture Design", "System Analysis", "Problem Decomposition", "Technical Leadership"],
          activities: ["System Design", "Code Reviews", "Architecture Discussions", "Technical Planning"]
        },
        integration: {
          description: "Building robust backend systems with architectural thinking",
          deliverables: ["Full API", "Database Design", "System Architecture", "Deployment Guide"]
        }
      },
      {
        month: "Full Stack Integration",
        technicalFocus: {
          topic: "End-to-End Development",
          skills: ["Full Stack Projects", "DevOps", "Testing", "Performance Optimization", "Security"],
          projects: ["Complete Web Application", "CI/CD Pipeline", "Testing Suite", "Performance Audit"]
        },
        behavioralFocus: {
          topic: "Project Management",
          skills: ["Agile Methodologies", "Project Planning", "Risk Management", "Quality Assurance"],
          activities: ["Sprint Planning", "Retrospectives", "Risk Assessment", "Quality Reviews"]
        },
        integration: {
          description: "Delivering complete full-stack solutions with project management",
          deliverables: ["Production Application", "DevOps Pipeline", "Project Documentation", "Quality Report"]
        }
      },
      {
        month: "Advanced Specialization",
        technicalFocus: {
          topic: "Advanced Topics & Specialization",
          skills: ["Microservices", "Cloud Architecture", "Advanced Security", "Performance Tuning", "AI Integration"],
          projects: ["Microservices Architecture", "Cloud Migration", "Security Audit", "Performance Optimization"]
        },
        behavioralFocus: {
          topic: "Leadership & Mentoring",
          skills: ["Technical Leadership", "Mentoring", "Knowledge Sharing", "Innovation", "Strategic Thinking"],
          activities: ["Code Reviews", "Technical Presentations", "Mentoring Sessions", "Innovation Workshops"]
        },
        integration: {
          description: "Developing specialized expertise with leadership capabilities",
          deliverables: ["Specialized Project", "Technical Leadership", "Innovation Proposal", "Knowledge Transfer"]
        }
      },
      {
        month: "Capstone Project",
        technicalFocus: {
          topic: "Enterprise-Level Application",
          skills: ["Enterprise Architecture", "Scalability", "Security", "Performance", "Monitoring"],
          projects: ["Enterprise Application", "System Architecture", "Security Implementation", "Performance Monitoring"]
        },
        behavioralFocus: {
          topic: "Professional Excellence",
          skills: ["Executive Communication", "Strategic Planning", "Business Acumen", "Professional Ethics", "Continuous Learning"],
          activities: ["Executive Presentations", "Strategic Planning", "Business Analysis", "Professional Development"]
        },
        integration: {
          description: "Delivering enterprise-level solutions with professional excellence",
          deliverables: ["Enterprise Solution", "Strategic Plan", "Business Impact Report", "Professional Portfolio"]
        }
      }
    ],
    result: "Transformed beginners into enterprise-ready full-stack developers with both technical excellence and professional behaviors",
    cta: { text: "Design Your Learning Journey", href: "#delivery-formats" }
  },
  deliveryFormats: {
    headline: "Flexible Delivery Formats",
    options: [
      {
        title: "ON-SITE/IN-PERSON",
        description: "Traditional classroom training at your location",
        features: ["Face-to-face interaction", "Hands-on labs", "Immediate feedback", "Team building"],
        bestFor: "Large teams, complex topics, hands-on training",
        techRequirements: ["Training room", "Projector", "Whiteboard", "Internet access"],
        included: ["Trainer travel", "Training materials", "Lab setup", "Certificate"],
        notIncluded: ["Participant travel", "Meals", "Accommodation"]
      },
      {
        title: "VIRTUAL/LIVE-ONLINE",
        description: "Interactive online training with live instructor",
        features: ["Live instruction", "Virtual labs", "Screen sharing", "Recording access"],
        bestFor: "Distributed teams, remote workforce, cost optimization",
        techRequirements: ["Computer with camera", "High-speed internet", "Web browser", "Headset"],
        included: ["Online platform", "Digital materials", "Lab access", "Recording"],
        notIncluded: ["Hardware setup", "Internet costs", "Physical materials"]
      },
      {
        title: "HYBRID/MIXED MODE",
        description: "Combination of in-person and online training",
        features: ["Flexible scheduling", "Location independence", "Cost optimization", "Team cohesion"],
        bestFor: "Hybrid teams, multiple locations, flexible schedules",
        techRequirements: ["Computer", "Internet", "Occasional meeting space", "Webcam"],
        included: ["Both delivery methods", "Flexible scheduling", "Digital materials", "Recording"],
        notIncluded: ["Travel for all sessions", "Full equipment setup"]
      },
      {
        title: "SELF-PACED/ONLINE",
        description: "Pre-recorded courses with flexible learning schedule",
        features: ["Learn at your pace", "Lifetime access", "Mobile friendly", "Resource library"],
        bestFor: "Individual learning, skill refresh, budget constraints",
        techRequirements: ["Computer", "Internet", "Web browser", "Email"],
        included: ["Course access", "Resource materials", "Certificate", "Email support"],
        notIncluded: ["Live instruction", "Personal feedback", "Custom content"]
      }
    ]
  },
  pricingModels: {
    headline: "Transparent, Flexible Pricing",
    models: [
      {
        title: "PER-SEAT PRICING",
        description: "Fixed fee per participant",
        suitableFor: "Standard programs, defined curriculum",
        example: "₹40,000/seat for 320-hour Java Full Stack",
        minimum: "15 participants",
        benefits: ["Predictable costs", "Easy budgeting", "Scalable pricing"],
        considerations: ["Requires minimum participants", "Fixed scope"]
      },
      {
        title: "PER-PROGRAM PRICING",
        description: "Fixed fee for entire program",
        suitableFor: "Custom programs, OB interventions, workshops",
        example: "₹8L for 3-day leadership workshop for 25 participants",
        minimum: "Custom quote",
        benefits: ["Fixed budget", "Defined scope", "Risk sharing"],
        considerations: ["Detailed scope required", "Change order process"]
      },
      {
        title: "RETAINER MODEL",
        description: "Annual/quarterly retainer",
        suitableFor: "Large enterprises, ongoing needs",
        example: "₹50L/year for up to 500 training days",
        minimum: "Custom agreement",
        benefits: ["Unlimited access", "Cost optimization", "Priority support"],
        considerations: ["Long-term commitment", "Usage tracking"]
      }
    ],
    addOnServices: [
      { title: "Pre-assessment", description: "Baseline skill evaluation", pricing: "₹5K/participant" },
      { title: "Post-training coaching", description: "3-month follow-up support", pricing: "₹15K/participant" },
      { title: "360-degree assessment", description: "Comprehensive feedback", pricing: "₹10K/participant" },
      { title: "Custom content development", description: "Tailored training materials", pricing: "Quoted separately" }
    ]
  },
  successMetrics: {
    headline: "How We Measure Success",
    categories: [
      {
        category: "Technical Training",
        metrics: [
          { category: "Competency Improvement", label: "85%", value: "Average skill level increase", description: "Pre to post training assessment", trend: "up" },
          { category: "Code Quality", label: "40%", value: "Reduction in defects", description: "Post-training code reviews", trend: "up" },
          { category: "Project Delivery", label: "87%", value: "On-time completion rate", description: "Project management metrics", trend: "up" }
        ]
      },
      {
        category: "Functional Training",
        metrics: [
          { category: "Performance", label: "78%", value: "Improvement in role performance", description: "Manager evaluations", trend: "up" },
          { category: "Project Success", label: "92%", value: "Project success rate", description: "Stakeholder feedback", trend: "up" }
        ]
      },
      {
        category: "OB Interventions",
        metrics: [
          { category: "Behavioral Change", label: "73%", value: "Observable behavior change", description: "360-degree feedback", trend: "up" },
          { category: "Team Effectiveness", label: "68%", value: "Team effectiveness score", description: "Team assessments", trend: "up" },
          { category: "Engagement", label: "+16%", value: "Employee engagement increase", description: "Survey results", trend: "up" }
        ]
      },
      {
        category: "Organizational Programs",
        metrics: [
          { category: "Culture", label: "3.8/5", value: "Culture score improvement", description: "Culture surveys", trend: "up" },
          { category: "Digital Maturity", label: "+45%", value: "Digital capability increase", description: "Digital readiness assessment", trend: "up" }
        ]
      }
    ],
    roiCalculator: {
      title: "Training ROI Calculator",
      description: "Calculate the potential return on your training investment",
      factors: [
        { name: "Productivity Gain", impact: "High", description: "Increased output and efficiency" },
        { name: "Cost Reduction", impact: "Medium", description: "Reduced errors and rework" },
        { name: "Retention Improvement", impact: "High", description: "Lower turnover costs" }
      ]
    },
    measurementApproach: {
      title: "Our Measurement Framework",
      phases: [
        {
          phase: "Baseline Assessment",
          activities: ["Skill assessment", "Performance baseline", "Current state analysis", "Gap identification"],
          tools: ["Assessment platforms", "360-degree tools", "Performance dashboards"]
        },
        {
          phase: "Continuous Monitoring",
          activities: ["Progress tracking", "Regular check-ins", "Performance metrics", "Feedback collection"],
          tools: ["Learning management systems", "Analytics platforms", "Feedback tools"]
        },
        {
          phase: "Impact Evaluation",
          activities: ["Post-training assessment", "Business impact analysis", "ROI calculation", "Stakeholder feedback"],
          tools: ["Impact assessment tools", "ROI calculators", "Survey platforms"]
        },
        {
          phase: "ROI Analysis",
          activities: ["Cost-benefit analysis", "Productivity gains", "Retention impact", "Business outcome correlation"],
          tools: ["Financial analysis tools", "ROI software", "Business intelligence platforms"]
        }
      ]
    }
  },
  caseStudies: {
    headline: "Success Stories: Real Results, Real Impact",
    subheadline: "See how organizations like yours transformed their workforce with Sudaksha",
    studies: [
      {
        title: "Integrated IT + OB Transformation",
        company: "Mid-size IT Services Company",
        industry: "Technology Services",
        challenge: "High attrition (28% annually) among junior developers, low productivity in first 6-12 months, poor collaboration between teams",
        solution: "Phase 1: Finishing School for 100 New Hires (Technical: Full Stack Development 280 hours + OB: Professional skills 40 hours). Phase 2: Team Lead Development (Technical: Architecture skills 80 hours + OB: First-time manager program 60 hours). Phase 3: Culture Building (Organization-wide communication workshops, process implementation, reinforcement program).",
        implementation: {
          duration: "12 months",
          participants: 100,
          format: "Blended learning",
          focus: ["Technical upskilling", "Behavioral transformation", "Team integration"]
        },
        results: [
          { metric: "Attrition Reduction", value: "28% → 14%", description: "50% reduction in attrition" },
          { metric: "Time-to-Productivity", value: "24 weeks → 10 weeks", description: "58% faster onboarding" },
          { metric: "Employee Engagement", value: "62% → 78%", description: "16-point improvement" },
          { metric: "Project Delivery", value: "68% → 87%", description: "On-time delivery improvement" },
          { metric: "ROI", value: "117%", description: "Return on investment in 18 months" }
        ],
        testimonial: {
          quote: "Sudaksha's THD model transformed our hiring process. We went from struggling to find talent to having a ready-to-deploy team that exceeded our expectations.",
          author: "Sarah Johnson",
          position: "CTO, TechCorp Solutions"
        }
      },
      {
        title: "Digital Banking Platform",
        company: "FinanceHub Technologies",
        industry: "Banking & Financial Services",
        challenge: "Required immediate technical expertise for digital transformation while evaluating long-term fit",
        solution: "Deployed 20 consultants through DHT model with 3-month evaluation period and conversion option",
        implementation: {
          duration: "6 months",
          participants: 20,
          format: "Virtual delivery with on-site workshops",
          focus: ["Technical expertise", "Digital transformation"]
        },
        results: [
          { metric: "Deployment Time", value: "48 hours", description: "Consultants were productive within 2 days" },
          { metric: "Conversion Rate", value: "85%", description: "Converted to full-time employees after evaluation" },
          { metric: "Project Timeline", value: "30% faster", description: "Digital transformation completed ahead of schedule" }
        ],
        testimonial: {
          quote: "The DHT model gave us the flexibility we needed. We could evaluate talent on the job while making immediate progress on our critical projects.",
          author: "Michael Chen",
          position: "VP of Technology, FinanceHub Technologies"
        }
      },
      {
        title: "Manufacturing ERP Implementation",
        company: "Global Manufacturing Co.",
        industry: "Manufacturing & Industrial",
        challenge: "Needed to upskill existing workforce for new ERP system while maintaining operations",
        solution: "Custom 6-month integrated program combining technical ERP training with change management",
        implementation: {
          duration: "6 months",
          participants: 200,
          format: "On-site training with virtual follow-up",
          focus: ["ERP implementation", "Change management", "Process optimization"]
        },
        results: [
          { metric: "Adoption Rate", value: "90%", description: "Employees successfully adopted new ERP system" },
          { metric: "Productivity Impact", value: "35% increase", description: "Process efficiency improvements" },
          { metric: "User Satisfaction", value: "88%", description: "Employee satisfaction with new system" }
        ],
        testimonial: {
          quote: "Sudaksha's integrated approach was exactly what we needed. They didn't just train on the technical skills - they helped our people embrace the change.",
          author: "Robert Williams",
          position: "Operations Director, Global Manufacturing Co."
        }
      }
    ]
  },
  finalCTA: {
    faq: {
      headline: "Frequently Asked Questions",
      categories: ["All", "Training Programs", "Employment Models", "Pricing", "Delivery", "Results"],
      faqs: [
        {
          question: "How long does a typical training program take?",
          answer: "Programs range from 2 weeks for skill-specific workshops to 6 months for comprehensive transformation programs. We customize duration based on your specific needs and goals.",
          category: "Training Programs"
        },
        {
          question: "What is the difference between THD and DHT models?",
          answer: "THD (Train-Hire-Deploy) is ideal for long-term talent needs where we train and then deploy candidates. DHT (Deploy-Hire-Train) is perfect for immediate needs where candidates start working immediately while being trained.",
          category: "Employment Models"
        },
        {
          question: "How do you measure ROI on training investment?",
          answer: "We use a comprehensive measurement approach including baseline assessment, progress monitoring, and impact evaluation. Our clients typically see 3.5x ROI within 12 months.",
          category: "Results"
        },
        {
          question: "What delivery formats are available?",
          answer: "We offer on-site, virtual, hybrid, and self-paced options. Each can be customized to your team's preferences and logistical requirements.",
          category: "Delivery"
        },
        {
          question: "How do you customize training for our organization?",
          answer: "We start with a thorough assessment of your needs, then design a custom program that addresses your specific challenges and goals. All content is tailored to your industry and context.",
          category: "Training Programs"
        },
        {
          question: "What kind of support do you provide after training?",
          answer: "We offer post-training support including performance monitoring, refresher sessions, and ongoing consultation to ensure sustained impact.",
          category: "Results"
        }
      ]
    },
    contact: {
      headline: "Ready to Transform Your Team?",
      subheadline: "Let's discuss your training needs and design a solution that drives real business results",
      options: [
        {
          title: "Schedule Consultation",
          description: "Talk to our training experts to assess your needs and design a custom solution",
          icon: Calendar,
          action: "Book a call",
          href: "tel:+91801234567"
        },
        {
          title: "Request Proposal",
          description: "Get a detailed proposal with custom training recommendations and pricing",
          icon: FileText,
          action: "Get proposal",
          href: "mailto:info@sudaksha.com"
        },
        {
          title: "Download Brochure",
          description: "Learn more about our complete range of training solutions and success stories",
          icon: BookOpen,
          action: "Download PDF",
          href: "/downloads/domestic-b2b-brochure.pdf"
        }
      ]
    }
  }
};

export default function DomesticPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <DomesticHero data={mockData.hero} />
      
      {/* Differentiator Table */}
      <DifferentiatorTable data={mockData.differentiator} />
      
      {/* Training Ecosystem */}
      <TrainingEcosystem data={mockData.ecosystem} />
      
      {/* Training Categories */}
      <TrainingCategories categories={mockData.trainingCategories} />
      
      {/* Curation Process */}
      <CurationProcess data={mockData.curationProcess} />
      
      {/* Employment Models */}
      <EmploymentModels 
        thdData={mockData.employmentModels.thd} 
        dhtData={mockData.employmentModels.dht} 
      />
      
      {/* Organizational Transformation */}
      <OrgTransformation headline={mockData.transformation.headline} pillars={mockData.transformation.pillars} />
      
      {/* Learning Journeys */}
      <LearningJourneys data={mockData.learningJourney} />
      
      {/* Delivery Formats */}
      <DeliveryFormats deliveryData={mockData.deliveryFormats} pricingData={mockData.pricingModels} />
      
      {/* Success Metrics */}
      {/* <SuccessMetrics data={mockData.successMetrics} /> */}
      
      {/* Case Studies */}
      <CaseStudies data={mockData.caseStudies} />
      
      {/* FAQ and Final CTA */}
      <FinalCTA faqData={mockData.finalCTA.faq} contactData={mockData.finalCTA.contact} />
    </div>
  );
}
