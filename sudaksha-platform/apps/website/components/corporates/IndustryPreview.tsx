'use client';

import { useState } from 'react';
import {
  CreditCard, ShoppingCart, Heart, Pill, Truck, GraduationCap,
  Building, Shield, Plane, Hotel, ShoppingBag, Home, Flame, ChevronRight
} from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

// ── TYPES ────────────────────────────────────────────────────────────────────
interface IndustryCategory {
  domain: string[];
  technology: string[];
  behavioural: string[];
  cognitive: string[];
  specialist: string[];
  inDemand: string[];
}

interface Industry {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  slug: string;
  categories: IndustryCategory;
}

// ── DATA ─────────────────────────────────────────────────────────────────────
const INDUSTRIES: Industry[] = [
  {
    id: 'fintech', name: 'FinTech', tagline: 'Build secure, compliant financial systems your regulators trust',
    icon: CreditCard, slug: '/corporates/industries/fintech',
    categories: {
      domain: ['Core Banking Systems', 'Payment Gateway Architecture', 'Digital Lending Platforms', 'Regulatory Compliance (RBI/SEBI)', 'KYC/AML Processes', 'Credit Risk Modeling', 'Fraud Detection Systems', 'Wealth Management Platforms', 'Open Banking & APIs', 'NBFC Operations'],
      technology: ['Java Spring Boot for FinTech', 'Microservices & Event-Driven Architecture', 'Kafka for Financial Data Streaming', 'Cloud (AWS/Azure) for Banking', 'Cybersecurity for Financial Systems', 'Blockchain & Smart Contracts', 'Python for Quant Finance', 'DevSecOps for FinTech', 'Data Engineering for Financial Analytics', 'API Security & OAuth'],
      behavioural: ['Regulatory Communication & Reporting', 'Risk Culture & Ethics in Finance', 'Cross-Functional Collaboration in Agile', 'Stakeholder Presentations for Financial Products', 'Conflict Resolution in High-Stakes Environments'],
      cognitive: ['Analytical Thinking for Risk Assessment', 'Decision-Making Under Uncertainty', 'Systems Thinking for Financial Architecture', 'Problem Framing for FinTech Challenges', 'Data-Driven Decision Making'],
      specialist: ['SWIFT Messaging Systems', 'PCI-DSS Compliance Certification', 'FIX Protocol for Trading Systems', 'ISO 20022 Migration', 'Actuarial Modelling Basics'],
      inDemand: ['Microservices Migration Training', 'Fraud Detection with ML', 'Cloud-Native Banking', 'API Security Certification'],
    }
  },
  {
    id: 'ecommerce', name: 'E-Commerce', tagline: 'Scale high-transaction platforms that convert, retain and delight',
    icon: ShoppingCart, slug: '/corporates/industries/ecommerce',
    categories: {
      domain: ['E-Commerce Platform Architecture', 'Catalogue & Inventory Management', 'Order Management Systems', 'Returns & Refunds Workflows', 'Marketplace Seller Operations', 'Digital Marketing for E-Commerce', 'Conversion Rate Optimization', 'Customer Lifecycle Management', 'D2C Brand Operations', 'Omnichannel Retail Operations'],
      technology: ['React/Next.js Storefront Development', 'Headless Commerce (Shopify/Magento)', 'Elasticsearch for Product Search', 'Redis for Cart & Session Management', 'Node.js for High-Throughput APIs', 'AWS for E-Commerce Scaling', 'CDN & Performance Optimization', 'Recommendation Engines (ML)', 'Data Pipelines for E-Commerce Analytics', 'Mobile App Development for Commerce'],
      behavioural: ['Customer-Centric Product Thinking', 'Agile for E-Commerce Teams', 'Vendor & Seller Communication', 'Cross-Border Trade Communication', 'Escalation Handling'],
      cognitive: ['User Journey Mapping', 'Funnel Analysis & Optimization', 'Pricing Strategy Thinking', 'A/B Testing Mindset', 'Demand Forecasting Logic'],
      specialist: ['Logistics API Integration (Shiprocket/Delhivery)', 'Payment Gateway Integration', 'GST & E-Invoicing for E-Commerce', 'Fraud Prevention in Transactions', 'Platform SEO & Structured Data'],
      inDemand: ['Headless Commerce Migration', 'Personalization Engine Build', 'High-Scale API Architecture', 'Mobile Commerce App Development'],
    }
  },
  {
    id: 'healthcare', name: 'Healthcare', tagline: 'HIPAA-compliant systems that clinicians and patients trust',
    icon: Heart, slug: '/corporates/industries/healthcare',
    categories: {
      domain: ['Electronic Health Records (EHR/EMR)', 'Hospital Information Systems (HIS)', 'HIPAA & HL7 FHIR Compliance', 'Telemedicine Platform Development', 'Medical Billing & Coding Systems', 'Clinical Workflow Design', 'Patient Data Privacy & Governance', 'Health Insurance Processing (TPA)', 'Diagnostic Imaging Systems (DICOM)', 'Pharmacy Management Systems'],
      technology: ['FHIR API Development', 'Secure Healthcare Data Pipelines', 'AI/ML for Clinical Decision Support', 'Cloud (HIPAA-Compliant AWS/Azure)', 'Mobile Health App Development', 'IoT for Patient Monitoring', 'Interoperability Systems', 'DevSecOps for Healthcare', 'Healthcare Data Warehousing', 'NLP for Medical Records'],
      behavioural: ['Patient-Centred Communication', 'Cross-Disciplinary Team Collaboration', 'Regulatory Reporting & Documentation', 'Empathy & Bedside Manner for Digital Health', 'Change Management in Clinical Environments'],
      cognitive: ['Clinical Systems Thinking', 'Risk Assessment in Patient Safety', 'Evidence-Based Decision Making', 'Process Improvement (Lean Healthcare)', 'Data Interpretation for Clinical Insights'],
      specialist: ['DICOM Standards & Imaging Workflows', 'ICD-10 Coding Certification', 'HL7 v2/v3 & FHIR R4', 'Telemedicine Regulatory Framework (India)', 'NABH Accreditation Preparedness'],
      inDemand: ['EHR/EMR Integration', 'FHIR API Development', 'AI Diagnostics Support', 'HIPAA Compliance Certification'],
    }
  },
  {
    id: 'pharma', name: 'Pharma', tagline: 'GMP-compliant training for every phase from discovery to market',
    icon: Pill, slug: '/corporates/industries/pharma',
    categories: {
      domain: ['GMP/GLP Regulatory Compliance', 'Clinical Trial Data Management', 'Drug Safety & Pharmacovigilance', 'Regulatory Submissions (CDSCO/FDA/EMA)', 'Quality Assurance in Manufacturing', 'Cold Chain & Logistics Compliance', 'Serialization & Track & Trace', 'Medical Affairs Operations', 'Patent & IP Basics', 'Drug Discovery Informatics'],
      technology: ['LIMS (Lab Information Management Systems)', 'Clinical Data Management Systems (CDMS)', 'Python for Pharma Data Analytics', 'AI for Drug Discovery', 'Electronic Batch Records (EBR)', 'Validation (CSV/IQ/OQ/PQ)', 'eCTD Submission Systems', 'SAP for Pharma Operations', '21 CFR Part 11 Compliance Systems', 'Bioinformatics Basics'],
      behavioural: ['Regulatory Audit Communication', 'Scientific Writing & Documentation', 'Cross-Functional Project Management', 'GMP Culture & Compliance Mindset', 'Vendor & CRO Management'],
      cognitive: ['Root Cause Analysis (CAPA/RCA)', 'Risk-Based Thinking in Quality', 'Hypothesis-Driven Research Thinking', 'Data Integrity Mindset', 'Process Deviation Analysis'],
      specialist: ['ICH Guidelines Mastery (Q, E, S, M series)', 'GAMP 5 Certification Prep', 'FDA 483 Response Writing', 'Pharmacovigilance (E2B/E2E)', 'Electronic Common Technical Document (eCTD)'],
      inDemand: ['GMP Compliance Training', 'Clinical Data Systems', 'Pharmacovigilance Certification', 'CSV/Computer Systems Validation'],
    }
  },
  {
    id: 'logistics', name: 'Logistics & Supply Chain', tagline: 'Real-time visibility and optimised operations for modern supply chains',
    icon: Truck, slug: '/corporates/industries/logistics',
    categories: {
      domain: ['Supply Chain Design & Optimisation', 'Warehouse Management Systems (WMS)', 'Transportation Management Systems (TMS)', 'Last-Mile Delivery Operations', 'Freight & Customs Compliance', 'Cold Chain Logistics', 'Reverse Logistics Management', '3PL/4PL Operations', 'Demand Planning & S&OP', 'Procurement & Vendor Management'],
      technology: ['SAP SCM / Oracle SCM', 'Python for Supply Chain Analytics', 'IoT for Fleet & Asset Tracking', 'Machine Learning for Demand Forecasting', 'Robotic Process Automation in Logistics', 'API Integration (FedEx, DHL, Delhivery)', 'Data Dashboards (Power BI/Tableau)', 'Blockchain for Supply Chain Transparency', 'RFID & Barcode Systems', 'ERP Integration'],
      behavioural: ['Negotiation with Suppliers & Vendors', 'Crisis Communication in Disruptions', 'Cross-Border Trade Communication', 'Team Coordination in Distributed Operations', 'Escalation & Exception Management'],
      cognitive: ['Systems Thinking for Supply Networks', 'Risk Modelling for Disruptions', 'Scenario Planning & Resilience Thinking', 'Root Cause Analysis for Delays', 'Lean & Six Sigma Thinking'],
      specialist: ['Incoterms 2020 Certification', 'Customs & Trade Compliance', 'Hazardous Goods Handling (ADR/IATA)', 'APICS CSCP/CPIM Preparation', 'GST & E-Way Bill Compliance'],
      inDemand: ['WMS/TMS Integration Training', 'Demand Forecasting with ML', 'Last-Mile Tech Stack', 'Cold Chain Compliance'],
    }
  },
  {
    id: 'edtech', name: 'EdTech', tagline: 'Scalable learning platforms with pedagogically sound architecture',
    icon: GraduationCap, slug: '/corporates/industries/edtech',
    categories: {
      domain: ['Learning Management System (LMS) Architecture', 'Instructional Design & Curriculum Development', 'Assessment Engine Design', 'Student Journey & Engagement Design', 'Live Class Platform Operations', 'EdTech Product Management', 'Content Licensing & IP', 'Learner Analytics & Reporting', 'B2B Institutional Sales', 'Adaptive Learning Frameworks'],
      technology: ['React/Next.js for EdTech Platforms', 'Video Infrastructure (Agora/Jitsi/Zoom SDK)', 'Node.js Backend for LMS', 'PostgreSQL/MongoDB for Learning Data', 'AWS for EdTech Scaling', 'Real-Time Collaboration Tools', 'Gamification Engineering', 'Mobile-First Learning Apps', 'AI Tutors & Chatbot Integration', 'Proctoring & Assessment Tech'],
      behavioural: ['Learner Empathy & UX Thinking', 'EdTech Sales to Institutions', 'Educator Communication & Facilitation', 'Cross-Functional EdTech Teams', 'Content Collaboration with SMEs'],
      cognitive: ['Learning Science & Pedagogy', 'Outcome-Based Curriculum Design', 'Learning Analytics Interpretation', 'Retention & Engagement Psychology', 'Problem-Based Learning Design'],
      specialist: ['SCORM/xAPI/LTI Standards', 'Accessibility (WCAG) for EdTech', 'Video CDN Optimisation', 'Proctoring System Integration', 'EdTech Regulatory Compliance (India NEP 2020)'],
      inDemand: ['LMS Platform Build', 'AI Tutor Integration', 'Video Learning Infrastructure', 'Learner Analytics Dashboard'],
    }
  },
  {
    id: 'government', name: 'Government', tagline: 'Digital India compliant systems for better citizen service delivery',
    icon: Building, slug: '/corporates/industries/government',
    categories: {
      domain: ['E-Governance Platform Design', 'Public Service Delivery Systems', 'Digital India Compliance', 'RTI & Transparency Systems', 'Government ERP (NIC/PFMS)', 'Citizen Portal Development', 'Revenue & Land Records Systems', 'Smart City Operations Tech', 'National ID Systems (Aadhaar/DigiLocker)', 'Public Procurement Systems (GeM)'],
      technology: ['Java EE / Spring for Government Systems', 'API Setu & NDEAR Integration', 'NIC Cloud & Meghraj', 'Cybersecurity for Critical Infrastructure', 'Blockchain for Public Records', 'GIS & Spatial Data Systems', 'Mobile App for Citizen Services', 'Data Governance & Open Data', 'DevOps for Government IT', 'Accessibility (GIGW Standards)'],
      behavioural: ['Stakeholder Management in Government Ecosystem', 'Communication for Policy Implementation', 'Interdepartmental Coordination', 'Change Management in Public Sector', 'Documentation & Compliance Writing'],
      cognitive: ['Policy Analysis & Systems Thinking', 'Risk Management in Public Projects', 'Evidence-Based Governance', 'Process Re-engineering for Public Delivery', 'Budget Planning & Prioritisation'],
      specialist: ['CERT-In Cybersecurity Compliance', 'NeGP/Digital India Framework', 'GFR & Public Procurement Rules', 'Data Localisation & IT Act Compliance', 'GeM Vendor & Procurement Certification'],
      inDemand: ['E-Governance Platform Development', 'Cybersecurity for Critical Infrastructure', 'Citizen Services App', 'Data Governance & Open Data'],
    }
  },
  {
    id: 'defence', name: 'Defence', tagline: 'Mission-critical security systems built to military-grade standards',
    icon: Shield, slug: '/corporates/industries/defence',
    categories: {
      domain: ['Defence Acquisition & Procurement (DAP 2020)', 'Military-Grade Cybersecurity', 'Command & Control Systems', 'Satellite & Communication Systems', 'Embedded Systems for Defence', 'Defence ERP (DRDO/Ordnance)', 'ITAR/Export Control Compliance', 'Military Simulation & Modelling', 'Intelligence Systems Design', 'Logistics for Defence Supply Chain'],
      technology: ['Embedded C/C++ for Defence Systems', 'RTOS (Real-Time Operating Systems)', 'Secure Communications (PKI/Encryption)', 'GIS & Mapping for Defence', 'Cybersecurity (NCSC/NIST Frameworks)', 'FPGA/DSP Programming', 'AI for Surveillance & Threat Detection', 'Unmanned Systems Software', 'Defence-Grade DevSecOps', 'Radar & Signal Processing'],
      behavioural: ['Mission-Oriented Communication', 'Classified Information Handling', 'Leadership Under Pressure', 'Cross-Force Coordination', 'Risk Communication in High-Stakes Environments'],
      cognitive: ['Strategic & Tactical Decision Making', 'Threat Modelling & Red Team Thinking', 'Systems Engineering Mindset', 'Adversarial Problem Solving', 'Mission Planning Logic'],
      specialist: ['MIL-STD Standards Compliance', 'NATO Interoperability Standards', 'DRDO Vendor Certification', 'DO-178C (Avionics Software)', 'Export Control (ITAR/EAR) Certification'],
      inDemand: ['Cybersecurity for Defence Systems', 'Embedded Systems for Military Hardware', 'AI-Powered Surveillance', 'Secure Communication Systems'],
    }
  },
  {
    id: 'aviation', name: 'Aviation', tagline: 'Safety-critical systems trained to DGCA, EASA and DO-178C standards',
    icon: Plane, slug: '/corporates/industries/aviation',
    categories: {
      domain: ['Aviation Safety Management Systems (SMS)', 'Airline Operations & MRO Processes', 'Air Traffic Management Systems', 'Aircraft Maintenance Engineering', 'Ground Operations & Ramp Safety', 'Airline Revenue Management', 'Crew Resource Management (CRM)', 'Airport IT Systems (DCS/CUTE)', 'Cargo & Freight Operations', 'DGCA Regulatory Compliance'],
      technology: ['ARINC 653 / AFDX Networking', 'DO-178C Avionics Software', 'Aircraft Health Monitoring Systems', 'Flight Data Analytics (FDM/FOQA)', 'ERP for MRO (AMOS/SAP PM)', 'Cloud for Airline Operations', 'Cybersecurity for Aviation Systems (SITA/ACARS)', 'GIS for Airport Management', 'IoT for Aircraft Maintenance', 'Digital Twin for Fleet Management'],
      behavioural: ['CRM — Crew & Team Communication', 'Safety Culture & Reporting', 'High-Stakes Decision Communication', 'Cross-Cultural Communication in Aviation', 'Fatigue Management Awareness'],
      cognitive: ['Safety-Critical Systems Thinking', 'Human Factors & Error Management', 'Risk-Based Decision Making', 'Incident Investigation Thinking', 'Situational Awareness Training'],
      specialist: ['IATA DGR (Dangerous Goods) Certification', 'ICAO Standards & Recommended Practices', 'EASA/FAA Regulatory Frameworks', 'DO-254 (Hardware) Compliance', 'SMS & ISMS for Aviation'],
      inDemand: ['DO-178C Software Compliance', 'Flight Data Analytics', 'MRO ERP (AMOS/SAP)', 'Cybersecurity for Avionics'],
    }
  },
  {
    id: 'travel', name: 'Travel & Hospitality', tagline: 'GDS-integrated platforms delivering seamless guest experiences',
    icon: Hotel, slug: '/corporates/industries/travel',
    categories: {
      domain: ['Global Distribution Systems (GDS — Amadeus/Sabre)', 'Online Travel Agency (OTA) Platform Design', 'Hotel Property Management Systems (PMS)', 'Revenue Management & Dynamic Pricing', 'Loyalty Program Architecture', 'Travel API Integration (Flights/Hotels/Cars)', 'MICE & Events Management', 'Destination Management Operations', 'Booking Engine Design', 'Guest Experience Design'],
      technology: ['React/Node.js for Travel Platforms', 'Amadeus/Sabre API Integration', 'Payment Integration (Multi-Currency)', 'AI for Personalised Travel Recommendations', 'Mobile App for Travel & Hospitality', 'Data Analytics for Revenue Optimisation', 'CRM for Hotel Chains', 'Channel Manager Integration', 'Cloud Scaling for Peak Travel Season', 'Chatbots for Guest Services'],
      behavioural: ['Guest-First Service Excellence', 'Cross-Cultural Communication', 'Upselling & Sales Techniques', 'Crisis Communication (Cancellations/Delays)', 'Team Coordination in 24/7 Operations'],
      cognitive: ['Revenue Optimisation Thinking', 'Demand Forecasting & Pricing Logic', 'Customer Journey Mapping', 'Problem Solving in Real-Time Operations', 'Service Recovery Mindset'],
      specialist: ['IATA Travel Agent Certification', 'GDS (Amadeus/Sabre/Galileo) Certification', 'PCI-DSS for Travel Payments', 'Revenue Management (CRME Prep)', 'Sustainable Tourism Practices'],
      inDemand: ['GDS API Integration', 'Dynamic Pricing Engine', 'Mobile Travel App', 'AI Personalisation for Bookings'],
    }
  },
  {
    id: 'retail', name: 'Retail & FMCG', tagline: 'Omnichannel retail operations powered by data-driven insights',
    icon: ShoppingBag, slug: '/corporates/industries/retail',
    categories: {
      domain: ['Retail Analytics & Category Management', 'Trade Promotion Management', 'Planogram & Merchandising', 'Omnichannel Retail Operations', 'FMCG Supply Chain & Distribution', 'Retail ERP (SAP Retail/Oracle)', 'POS Systems & Payments', 'Consumer Insights & Market Research', 'Private Label Development', 'Modern Trade vs General Trade Operations'],
      technology: ['SAP Retail / Oracle Retail', 'POS & mPOS Integration', 'React Native for Retail Apps', 'Data Analytics (Power BI/Tableau) for Retail', 'ML for Demand Forecasting', 'RFID & Inventory Management', 'Loyalty Program Tech Stack', 'CRM for Retail (Salesforce/Zoho)', 'E-Commerce Integration (Omnichannel)', 'IoT for Smart Shelving & Inventory'],
      behavioural: ['Sales Force Effectiveness', 'Negotiation with Modern Trade Buyers', 'Consumer Communication', 'Field Force Management', 'Customer Complaint Handling'],
      cognitive: ['Shopper Psychology & Behaviour', 'Category Strategy Thinking', 'Margin & Profitability Analysis', 'Innovation Pipeline Thinking', 'Competitive Landscape Assessment'],
      specialist: ['GS1 Barcode & Standards', 'FSSAI Compliance for FMCG', 'APMC & Trade Regulation', 'ECR (Efficient Consumer Response) Practices', 'Nielsen/IRI Data Analytics'],
      inDemand: ['Omnichannel Integration', 'Demand Forecasting with ML', 'Retail Analytics Dashboard', 'Trade Promotion Optimisation'],
    }
  },
  {
    id: 'realestate', name: 'Real Estate', tagline: 'RERA-compliant PropTech platforms from listing to closing',
    icon: Home, slug: '/corporates/industries/real-estate',
    categories: {
      domain: ['Real Estate ERP (MagicBricks/PropTiger platforms)', 'RERA Compliance & Legal Framework', 'Property Management Systems', 'Real Estate CRM & Lead Management', 'Construction Project Management', 'Home Loan & Mortgage Processing', 'Co-Working Space Operations', 'PropTech Platform Design', 'Real Estate Financial Modelling', 'Tenant & Lease Management'],
      technology: ['React/Node.js for PropTech Platforms', 'GIS & Location Intelligence', '3D Visualisation (BIM/AR for Properties)', 'CRM Integration (Salesforce/HubSpot)', 'Payment Systems for Real Estate', 'Data Analytics for Market Intelligence', 'AI for Property Valuation', 'IoT for Smart Building Management', 'Mobile App for Property Search', 'Document Management & e-Signing'],
      behavioural: ['Sales Negotiation & Closing Techniques', 'Customer Trust & Relationship Building', 'Legal & Documentation Communication', 'Investor Presentation Skills', 'Conflict Resolution in Property Disputes'],
      cognitive: ['Property Valuation Thinking', 'Market Analysis & Investment Logic', 'Risk Assessment in Real Estate', 'Financial Modelling for Developers', 'Urban Planning & Development Thinking'],
      specialist: ['RERA Registration & Compliance', 'BIM (Building Information Modelling)', 'LEED/GRIHA Green Building Certification', 'Real Estate Finance & Structuring', 'Property Law Essentials'],
      inDemand: ['PropTech Platform Development', 'AI Property Valuation', 'Smart Building IoT', 'RERA Compliance Training'],
    }
  },
];

type CategoryKey = 'domain' | 'technology' | 'behavioural' | 'cognitive' | 'specialist';

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'domain',      label: 'Domain-Specific'  },
  { key: 'technology',  label: 'Technology'        },
  { key: 'behavioural', label: 'Behavioural'       },
  { key: 'cognitive',   label: 'Cognitive'         },
  { key: 'specialist',  label: 'Specialist'        },
];

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function IndustryTrainingSolutions() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('fintech');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('domain');

  const industry = INDUSTRIES.find(i => i.id === selectedIndustry) ?? INDUSTRIES[0];
  const programs = industry.categories[selectedCategory];
  const Icon = industry.icon;

  return (
    <section
      id="industry-training"
      className="py-20 relative overflow-hidden bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Section Header ── */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
            12 Industries • 5 Training Categories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Industry-Specific Training Solutions
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            We speak your industry&apos;s language. Domain expertise meets technical depth.
          </p>
        </div>

        {/* ── Industry Selector ── */}
        <div className="overflow-x-auto pb-3 mb-8 scrollbar-hide">
          <div className="flex gap-2 min-w-max mx-auto justify-start md:justify-center flex-wrap px-1">
            {INDUSTRIES.map((ind) => {
              const Ic = ind.icon;
              const active = ind.id === selectedIndustry;
              return (
                <button
                  key={ind.id}
                  onClick={() => { setSelectedIndustry(ind.id); setSelectedCategory('domain'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    active 
                      ? 'bg-blue-600 text-white shadow-md border-transparent' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 border'
                  }`}
                >
                  <Ic className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-500'}`} />
                  {ind.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Industry Hero Bar ── */}
        <div className="rounded-2xl p-6 mb-6 flex items-center gap-4 bg-white border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 border border-blue-100">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{industry.name}</h3>
            <p className="text-sm mt-0.5 text-gray-600">{industry.tagline}</p>
          </div>
        </div>

        {/* ── Main Grid: Programs + Solutions in Demand ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Category tabs + programs */}
          <div className="lg:col-span-2">
            {/* Category tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 bg-gray-100 border border-gray-200">
              {CATEGORY_TABS.map(({ key, label }) => {
                const active = key === selectedCategory;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 text-center ${
                      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Program cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programs.map((program, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-xl flex justify-between items-start gap-3 transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1"
                >
                  <p className="text-sm font-medium text-gray-800 leading-snug">{program}</p>
                  <button
                    className="flex-shrink-0 text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Enquire
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Solutions in Demand */}
          <div className="lg:col-span-1">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 h-full shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-orange-700">
                  Solutions in Demand
                </h4>
              </div>
              <p className="text-xs mb-4 text-orange-600/80">
                Most-requested programs for {industry.name} teams right now
              </p>
              <div className="space-y-3">
                {industry.categories.inDemand.map((program, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-orange-100 shadow-sm"
                  >
                    <span className="text-xs font-bold mt-0.5 text-orange-500">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 leading-snug">{program}</span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <CTAButton 
                variant="custom"
                className="mt-6 flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Industry Training Solutions', ctaLabel: `Design Your ${industry.name} Training Program`, audienceType: 'corporate', intent: 'design_program', prefill: { industry: industry.name } }}
              >
                <span>Design Your {industry.name} Training Program</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-white/80" />
              </CTAButton>
            </div>
          </div>
        </div>

        {/* ── Don't see your industry ── */}
        <div className="mt-10 text-center py-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Don&apos;t see your industry?</h3>
          <p className="text-sm mb-5 text-gray-600">
            We work across all sectors. Let&apos;s build a custom solution for your specific challenges.
          </p>
          <CTAButton 
            variant="custom"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Industry Training Solutions', ctaLabel: 'Discuss Your Industry', audienceType: 'corporate', intent: 'schedule_call' }}
          >
            Discuss Your Industry <ChevronRight className="w-4 h-4" />
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
