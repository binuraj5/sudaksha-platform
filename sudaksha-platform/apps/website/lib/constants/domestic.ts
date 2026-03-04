// Constants and data for Domestic B2B Training Solutions Page

// Temporarily using any types to avoid import issues
// TODO: Fix imports when types are properly resolved

export const domesticPageData: any = {
  hero: {
    eyebrow: "DOMESTIC B2B TRAINING SOLUTIONS",
    headline: "Building India's Workforce, One Capability at a Time",
    subheadline: "From technical skills to behavioral transformation. From individual excellence to organizational capability. We don't just train—we transform through precision-curation and measurable outcomes.",
    valuePropositions: [
      { id: "1", text: "IT Training: Cloud, AI/ML, Full Stack, DevOps, Data Engineering" },
      { id: "2", text: "Non-IT Training: Leadership, Sales, Process Excellence, OB Interventions" },
      { id: "3", text: "Employment Models: Train-Hire-Deploy & Deploy-Hire-Train" },
      { id: "4", text: "Organizational Transformation: Change Management & Culture Building" }
    ],
    primaryCTA: {
      text: "Design Your Training Program",
      href: "/contact"
    },
    secondaryCTA: {
      text: "Explore Training Categories",
      href: "#training-categories"
    },
    trustBanner: "500+ Programs Delivered | 50,000+ Professionals Trained | 200+ Indian Enterprises",
    heroVisual: {
      leftImage: "/images/domestic/technical-team.jpg",
      rightImage: "/images/domestic/leadership-workshop.jpg",
      centerOverlay: "360° Capability Building"
    }
  },
  
  differentiator: {
    headline: "Beyond Generic Training: The Sudaksha Domestic Advantage",
    comparisons: [
      {
        aspect: "Approach",
        traditional: "Catalogue-based selection",
        sudaksha: "Problem-first diagnosis"
      },
      {
        aspect: "Customization",
        traditional: "Minor tweaks",
        sudaksha: "100% custom-curated"
      },
      {
        aspect: "Trainers",
        traditional: "Career trainers",
        sudaksha: "Working practitioners + OB experts"
      },
      {
        aspect: "Content Mix",
        traditional: "Pure technical OR pure soft skills",
        sudaksha: "Integrated technical + behavioral"
      },
      {
        aspect: "Assessment",
        traditional: "Pre & post tests",
        sudaksha: "Diagnostic → Baseline → Continuous → Impact"
      },
      {
        aspect: "Follow-up",
        traditional: "Certificate delivery",
        sudaksha: "90-day integration support"
      },
      {
        aspect: "Business Alignment",
        traditional: "Training KPIs",
        sudaksha: "Business outcome metrics"
      },
      {
        aspect: "Scalability",
        traditional: "Limited by trainer pool",
        sudaksha: "THD/DHT employment models"
      }
    ]
  },

  ecosystem: {
    headline: "Our 360° Training Ecosystem",
    innerCircle: {
      title: "INDIVIDUAL CAPABILITY",
      items: [
        "Technical Skills (IT Training)",
        "Functional Skills (Business Skills)",
        "Behavioral Skills (OB Interventions)",
        "Leadership Skills"
      ]
    },
    middleCircle: {
      title: "TEAM CAPABILITY",
      items: [
        "Team Dynamics",
        "Collaboration Tools",
        "Process Excellence",
        "Agile Ways of Working"
      ]
    },
    outerCircle: {
      title: "ORGANIZATIONAL CAPABILITY",
      items: [
        "Culture Transformation",
        "Change Management",
        "Digital Transformation",
        "Performance Systems"
      ]
    },
    bottomText: "We build capability at all three levels: Individual → Team → Organization"
  },

  trainingCategories: [
    {
      id: "it-technical",
      title: "IT & TECHNICAL TRAINING",
      icon: "Code",
      coverage: "Software Development, Cloud, Data, AI/ML, Cybersecurity, DevOps",
      whatWeCover: [
        "Full Stack Development (Java, Python, .NET, MERN, MEAN)",
        "Cloud Technologies (AWS, Azure, GCP)",
        "Data Engineering & Analytics (Big Data, Spark, Kafka)",
        "AI/ML & Generative AI",
        "Cybersecurity & Compliance",
        "DevOps & SRE Practices",
        "Mobile Development",
        "Quality Engineering & Test Automation"
      ],
      typicalPrograms: [
        { title: "Java Full Stack with Microservices", duration: "320 hours", hours: 320 },
        { title: "AWS Cloud Architect Track", duration: "280 hours", hours: 280 },
        { title: "Data Engineering with Azure", duration: "360 hours", hours: 360 },
        { title: "Python for AI/ML", duration: "240 hours", hours: 240 }
      ],
      businessOutcomes: [
        "Faster time-to-market",
        "Reduced technical debt",
        "Cloud migration success",
        "Modern architecture adoption"
      ],
      cta: {
        text: "Explore IT Training",
        href: "/for-corporates/domestic/it-training"
      }
    },
    {
      id: "functional-skills",
      title: "FUNCTIONAL SKILLS TRAINING",
      icon: "Briefcase",
      coverage: "Business Analysis, Project Management, Product Management, Agile",
      whatWeCover: [
        "Business Analysis (BABOK, Requirements Engineering)",
        "Project Management (PMP, PRINCE2, Agile PM)",
        "Product Management (Product Strategy, Roadmapping, User Research)",
        "Scrum Master & Agile Coaching",
        "Digital Marketing & Growth",
        "UI/UX Design Thinking",
        "Technical Writing & Documentation"
      ],
      typicalPrograms: [
        { title: "Business Analyst Certification Track", duration: "160 hours", hours: 160 },
        { title: "Product Management Fundamentals", duration: "120 hours", hours: 120 },
        { title: "Certified Scrum Master + Advanced", duration: "80 hours", hours: 80 },
        { title: "Digital Marketing Strategy", duration: "100 hours", hours: 100 }
      ],
      businessOutcomes: [
        "Better requirement clarity",
        "Improved project success rates",
        "Customer-centric products",
        "Cross-functional effectiveness"
      ],
      cta: {
        text: "Explore Functional Training",
        href: "/for-corporates/domestic/functional"
      }
    },
    {
      id: "process-excellence",
      title: "PROCESS EXCELLENCE",
      icon: "Settings",
      coverage: "Six Sigma, Lean, Kaizen, Process Optimization",
      whatWeCover: [
        "Lean Six Sigma (Yellow, Green, Black Belt)",
        "Lean Management & Kaizen",
        "Business Process Reengineering",
        "Process Mining & Optimization",
        "ITIL (IT Service Management)",
        "Quality Management Systems (ISO 9001)",
        "Continuous Improvement Culture"
      ],
      typicalPrograms: [
        { title: "Six Sigma Green Belt Certification", duration: "120 hours", hours: 120 },
        { title: "Lean Six Sigma Black Belt", duration: "200 hours", hours: 200 },
        { title: "ITIL 4 Foundation to Practitioner", duration: "80 hours", hours: 80 },
        { title: "Process Excellence for Leaders", duration: "60 hours", hours: 60 }
      ],
      businessOutcomes: [
        "Cost reduction (15-40%)",
        "Cycle time improvement",
        "Quality enhancement",
        "Operational excellence culture"
      ],
      cta: {
        text: "Explore Process Excellence",
        href: "/for-corporates/domestic/process-excellence"
      }
    },
    {
      id: "ob-interventions",
      title: "ORGANIZATIONAL BEHAVIOR (OB) INTERVENTIONS",
      icon: "Users",
      coverage: "Behavioral Assessment, Team Dynamics, Culture Building",
      whatWeCover: [
        "Diagnostic Interventions: Climate Surveys, 360-Degree Feedback, Team Effectiveness Assessments",
        "Learning Interventions: Communication Skills, Conflict Resolution, Emotional Intelligence, Stress Management",
        "Team Interventions: Team Building, Cross-Functional Integration, High-Performance Team Development",
        "Organizational Interventions: Change Management, Culture Transformation, Leadership Alignment"
      ],
      typicalPrograms: [
        { title: "Communication Excellence Program", duration: "40 hours", hours: 40 },
        { title: "Emotional Intelligence for Leaders", duration: "32 hours", hours: 32 },
        { title: "Team Effectiveness Workshop", duration: "16-24 hours" },
        { title: "Organization-wide Culture Transformation", duration: "6-12 months" }
      ],
      businessOutcomes: [
        "Improved employee engagement",
        "Reduced attrition",
        "Better collaboration",
        "Stronger organizational culture"
      ],
      cta: {
        text: "Explore OB Interventions",
        href: "/for-corporates/domestic/ob-interventions"
      }
    },
    {
      id: "leadership-development",
      title: "LEADERSHIP DEVELOPMENT",
      icon: "Award",
      coverage: "First-Time Managers to C-Suite Leadership",
      whatWeCover: [
        "New Managers: Transition to Management, Delegation, Performance Conversations, Coaching Skills",
        "Middle Management: Strategic Thinking, Cross-Functional Leadership, Change Leadership, Talent Development",
        "Senior Leadership: Executive Presence, Strategic Decision Making, Organizational Vision, Board Communication",
        "C-Suite Programs: CEO/CXO Leadership Forums, Digital Leadership, Corporate Governance, Crisis Management"
      ],
      typicalPrograms: [
        { title: "First-Time Manager Program", duration: "80 hours over 3 months", hours: 80 },
        { title: "Middle Management Leadership", duration: "120 hours over 6 months", hours: 120 },
        { title: "Senior Executive Program", duration: "160 hours over 12 months", hours: 160 },
        { title: "Custom Leadership Development Academies", duration: "Custom" }
      ],
      businessOutcomes: [
        "Leadership pipeline strength",
        "Succession planning success",
        "Manager effectiveness scores",
        "Strategic execution capability"
      ],
      cta: {
        text: "Explore Leadership Programs",
        href: "/for-corporates/domestic/leadership"
      }
    },
    {
      id: "sales-business-development",
      title: "SALES & BUSINESS DEVELOPMENT",
      icon: "TrendingUp",
      coverage: "B2B Sales, Consultative Selling, Account Management",
      whatWeCover: [
        "Foundational Sales: Sales Process, Prospecting, Needs Analysis, Negotiation, Objection Handling",
        "Advanced Sales: Consultative Selling, Solution Selling, Value-Based Selling, Complex Sales, Account Management",
        "Sales Leadership: Team Management, Pipeline Management, Sales Forecasting, Sales Strategy",
        "Industry-Specific Sales: IT/SaaS, BFSI, Healthcare, Manufacturing"
      ],
      typicalPrograms: [
        { title: "B2B Sales Fundamentals", duration: "60 hours", hours: 60 },
        { title: "Consultative Selling Mastery", duration: "80 hours", hours: 80 },
        { title: "Sales Leadership Program", duration: "120 hours", hours: 120 },
        { title: "Account Management Excellence", duration: "60 hours", hours: 60 }
      ],
      businessOutcomes: [
        "Revenue growth",
        "Win rate improvement",
        "Deal size increase",
        "Sales cycle reduction"
      ],
      cta: {
        text: "Explore Sales Training",
        href: "/for-corporates/domestic/sales"
      }
    },
    {
      id: "hr-talent-management",
      title: "HR & TALENT MANAGEMENT",
      icon: "UserCheck",
      coverage: "HR Business Partnering, Talent Acquisition, L&D",
      whatWeCover: [
        "HR Fundamentals: Policies & Compliance, Compensation & Benefits, HR Analytics, HRIS Implementation",
        "Talent Acquisition: Recruitment Strategy, Interview Skills, Employer Branding, Candidate Experience",
        "Learning & Development: Training Needs Analysis, Instructional Design, Facilitation Skills, L&D Strategy",
        "Talent Management: Performance Management, Succession Planning, Career Development, Retention Strategies"
      ],
      typicalPrograms: [
        { title: "HR Business Partner Certification", duration: "100 hours", hours: 100 },
        { title: "Talent Acquisition Excellence", duration: "60 hours", hours: 60 },
        { title: "L&D Professional Program", duration: "80 hours", hours: 80 },
        { title: "Performance Management Redesign", duration: "40 hours", hours: 40 }
      ],
      businessOutcomes: [
        "Quality of hire improvement",
        "Reduced time-to-fill",
        "Employee development effectiveness",
        "Retention improvement"
      ],
      cta: {
        text: "Explore HR Training",
        href: "/for-corporates/domestic/hr-training"
      }
    },
    {
      id: "finance-operations",
      title: "FINANCE & OPERATIONS",
      icon: "DollarSign",
      coverage: "Finance for Non-Finance, Operations Management",
      whatWeCover: [
        "Finance Training: Finance for Non-Finance, Financial Analysis, Budgeting & Forecasting, Working Capital Management",
        "Operations Training: Operations Management, Supply Chain Management, Inventory Optimization, Demand Planning",
        "Combined Programs: FP&A, Operations Excellence, Business Acumen for Leaders"
      ],
      typicalPrograms: [
        { title: "Finance for Non-Finance", duration: "40 hours", hours: 40 },
        { title: "Operations Management", duration: "80 hours", hours: 80 },
        { title: "Supply Chain Excellence", duration: "100 hours", hours: 100 },
        { title: "Business Acumen Program", duration: "60 hours", hours: 60 }
      ],
      businessOutcomes: [
        "Better financial decisions",
        "Cost optimization",
        "Operational efficiency",
        "Cross-functional understanding"
      ],
      cta: {
        text: "Explore Finance & Operations Training",
        href: "/for-corporates/domestic/finance-operations"
      }
    }
  ],

  curationProcess: {
    headline: "Our Six-Sigma Approach to Training Design",
    subheadline: "Not off-the-shelf. Not generic. Precision-curated for your needs.",
    steps: [
      {
        step: 1,
        title: "DIAGNOSTIC PHASE",
        duration: "1-2 weeks",
        activities: [
          "Organizational needs analysis",
          "Current state assessment",
          "Skill gap identification",
          "Business context understanding",
          "Stakeholder interviews",
          "Culture & readiness assessment"
        ],
        deliverable: "Diagnostic Report with Gap Analysis",
        specialNotes: "For OB Interventions: Climate surveys, 360-degree assessments, Team effectiveness diagnostics, Leadership style assessments"
      },
      {
        step: 2,
        title: "OBJECTIVE SETTING",
        duration: "3-5 days",
        activities: [
          "Define business outcomes",
          "Set learning objectives",
          "Establish success metrics",
          "Identify behavioral indicators",
          "Create measurement framework"
        ],
        deliverable: "Objectives & Success Criteria Document"
      },
      {
        step: 3,
        title: "CURATION & DESIGN",
        duration: "2-3 weeks",
        activities: [
          "For Technical Training: Map to your tech stack, Incorporate your code standards, Design hands-on labs with your tools",
          "For Non-Technical/OB Training: Customize scenarios to your industry, Include your organizational context, Design experiential activities"
        ],
        deliverable: "Custom Curriculum Blueprint"
      },
      {
        step: 4,
        title: "ASSESSMENT DESIGN",
        duration: "1 week",
        activities: [
          "Create baseline assessments",
          "Design mid-point checks",
          "Build final evaluations",
          "Define competency rubrics"
        ],
        deliverable: "Complete Assessment Framework",
        specialNotes: "For OB Interventions: Behavioral observation frameworks, Self-reflection tools, Peer feedback instruments"
      },
      {
        step: 5,
        title: "TRAINER/FACILITATOR MATCHING",
        duration: "1 week",
        activities: [
          "For Technical Training: Match with practitioner SMEs, Verify current industry experience, Ensure tech stack expertise",
          "For OB/Behavioral Training: Match with certified facilitators, Psychology/OB backgrounds, Coaching credentials"
        ],
        deliverable: "Confirmed Trainer/Facilitator Profiles"
      },
      {
        step: 6,
        title: "EXECUTION",
        duration: "Program length (typically 4-16 weeks)",
        activities: [
          "Daily sessions with activities",
          "Real-time engagement tracking",
          "Daily conduct reports",
          "Immediate issue resolution"
        ],
        deliverable: "Daily Reports + Weekly Summaries",
        specialNotes: "For OB Interventions: Experiential exercises, Role plays & simulations, Group processing & reflection"
      },
      {
        step: 7,
        title: "INTEGRATION & FOLLOW-UP",
        duration: "90 days post-training",
        activities: [
          "Application tracking",
          "Manager coaching support",
          "Reinforcement sessions",
          "Impact measurement",
          "Adjustment recommendations"
        ],
        deliverable: "Impact Report with ROI Analysis"
      }
    ]
  },

  employmentModels: {
    thd: {
      title: "TRAIN-HIRE-DEPLOY (THD)",
      bestFor: ["New project launches", "Quality-critical roles"],
      phases: [],
      investmentModel: {
        description: "No upfront fee",
        details: ["Pay only for deployed candidates"]
      },
      successMetrics: [],
      caseStudyPreview: {
        title: "E-commerce Platform Scaling",
        results: ["89 deployed successfully"]
      },
      cta: {
        text: "Explore THD Model",
        href: "/for-corporates/domestic/thd"
      }
    },
    dht: {
      title: "DEPLOY-HIRE-TRAIN (DHT)",
      bestFor: ["Urgent project deadlines", "Seasonal scaling"],
      phases: [],
      investmentModel: {
        description: "Monthly resource cost",
        details: ["Flexible engagement"]
      },
      successMetrics: [],
      caseStudyPreview: {
        title: "FinTech Startup Scaling",
        results: ["25 developers deployed in 3 weeks"]
      },
      cta: {
        text: "Explore DHT Model",
        href: "/for-corporates/domestic/dht"
      }
    }
  },

  transformation: {
    headline: "Beyond Individual Training: Systemic Organizational Change",
    pillars: [
      {
        title: "CHANGE MANAGEMENT",
        whatItIs: "Structured approach to transition",
        whenYouNeedIt: ["Major technology implementations"],
        approach: ["Stakeholder analysis"],
        typicalDuration: "3-12 months",
        cta: {
          text: "Learn More",
          href: "/for-corporates/domestic/change-management"
        }
      }
    ]
  },

  learningJourney: {
    headline: "Example: How We Integrate IT + OB Training",
    scenario: "Full Stack Developer Program",
    months: [],
    result: "Not just technically skilled developers, but professionals who can collaborate"
  },

  deliveryFormats: {
    headline: "Flexible Delivery to Suit Your Needs",
    options: [
      {
        title: "ON-SITE/IN-PERSON",
        features: ["Trainers at your location"],
        bestFor: "Large batches (25+)"
      }
    ]
  },

  pricingModels: {
    headline: "Transparent, Flexible Pricing",
    models: [
      {
        title: "PER-SEAT PRICING",
        description: "Fixed fee per participant",
        suitableFor: "Standard programs",
        example: "₹40,000/seat for 320-hour Java Full Stack",
        minimum: "15 participants"
      }
    ],
    addOnServices: []
  },

  successMetrics: {
    headline: "How We Measure Success",
    categories: [
      {
        category: "Technical Training",
        metrics: ["Competency improvement", "Code quality metrics"]
      }
    ]
  },

  caseStudies: [],

  faq: {
    category: "About Scope",
    questions: [
      {
        question: "Can you combine technical and non-technical training?",
        answer: "Absolutely. In fact, we recommend it."
      }
    ]
  },

  finalCTA: {
    headline: "Ready to Build Capability at Scale?",
    subheadline: "Whether you need technical upskilling, behavioral transformation, or systemic organizational change—we've done it 500+ times.",
    actionCards: [
      {
        title: "SCHEDULE DIAGNOSTIC SESSION",
        description: "Let's understand your challenges together. 2-hour session with our experts.",
        buttonText: "Book Diagnostic Session",
        href: "/contact"
      }
    ],
    contact: {
      phone: "+91-XXXXX-XXXXX",
      email: "corporate@sudaksha.com",
      hours: "Mon-Sat, 9 AM - 7 PM IST"
    }
  }
};
