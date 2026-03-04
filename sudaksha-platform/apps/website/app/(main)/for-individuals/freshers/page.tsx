'use client';

import { GraduationCap, Clock, Target, Users, Award, BookOpen, Briefcase, TrendingUp, Play, Star, ChevronRight } from 'lucide-react';

export default function FreshersOverview() {
  const programs = [
    {
      title: "Java Full Stack Plus",
      duration: "320 hrs",
      description: "Complete Java ecosystem with Spring Boot, Microservices, and enterprise development",
      placementRate: "87%",
      avgSalary: "₹6.5 LPA",
      modules: ["Core Java & OOPs", "Spring Framework", "Microservices", "React Frontend", "MySQL/MongoDB", "AWS Deployment"],
      projects: ["E-commerce Platform", "Banking System", "Social Media Dashboard"],
      companies: ["TCS", "Infosys", "Wipro", "Accenture", "Capgemini"]
    },
    {
      title: "Python Full Stack",
      duration: "280 hrs",
      description: "Python-based development with Django, Flask, and modern web technologies",
      placementRate: "84%",
      avgSalary: "₹6 LPA",
      modules: ["Python Fundamentals", "Django/Flask", "React/Vue", "PostgreSQL", "REST APIs", "Cloud Deployment"],
      projects: ["Blog Platform", "Data Analytics Dashboard", "API Gateway"],
      companies: ["Infosys", "Wipro", "HCL", "Tech Mahindra", "Startups"]
    },
    {
      title: "Data Science & Analytics",
      duration: "360 hrs",
      description: "Complete data science journey from Python basics to machine learning deployment",
      placementRate: "82%",
      avgSalary: "₹7 LPA",
      modules: ["Python for Data Science", "Statistics", "Machine Learning", "Deep Learning", "Tableau/Power BI", "Big Data"],
      projects: ["Sales Prediction", "Customer Segmentation", "Recommendation Engine"],
      companies: ["Amazon", "Microsoft", "Flipkart", "Swiggy", "Data Analytics Firms"]
    },
    {
      title: "MERN Stack",
      duration: "300 hrs",
      description: "Modern JavaScript full-stack with MongoDB, Express, React, and Node.js",
      placementRate: "89%",
      avgSalary: "₹6 LPA",
      modules: ["JavaScript ES6+", "React.js", "Node.js", "Express.js", "MongoDB", "GraphQL"],
      projects: ["Social Media App", "Real-time Chat", "E-commerce Backend"],
      companies: ["Startups", "Product Companies", "MNCs", "Tech Companies"]
    },
    {
      title: "Cloud Computing (AWS/Azure)",
      duration: "280 hrs",
      description: "Cloud architecture and DevOps with AWS, Azure, and container technologies",
      placementRate: "85%",
      avgSalary: "₹6.5 LPA",
      modules: ["AWS/Azure Fundamentals", "Compute Services", "Storage & Databases", "Networking", "Security", "DevOps Tools"],
      projects: ["Cloud Migration", "Auto-scaling Web App", "CI/CD Pipeline"],
      companies: ["AWS Partners", "Azure Partners", "Cloud Companies", "MNCs"]
    },
    {
      title: "DevOps Engineering",
      duration: "260 hrs",
      description: "Complete DevOps lifecycle from code to deployment and monitoring",
      placementRate: "81%",
      avgSalary: "₹6.5 LPA",
      modules: ["Linux & Shell Scripting", "Git & GitHub", "Jenkins", "Docker", "Kubernetes", "Monitoring"],
      projects: ["DevOps Pipeline", "Container Orchestration", "Infrastructure as Code"],
      companies: ["DevOps Companies", "MNCs", "Product Companies", "Startups"]
    },
    {
      title: "Cyber Security",
      duration: "320 hrs",
      description: "Comprehensive cybersecurity covering ethical hacking, security analysis, and compliance",
      placementRate: "79%",
      avgSalary: "₹6 LPA",
      modules: ["Network Security", "Ethical Hacking", "Security Tools", "Compliance", "Incident Response", "Cloud Security"],
      projects: ["Security Audit", "Penetration Testing", "Security Dashboard"],
      companies: ["Security Firms", "Banks", "MNCs", "Government Agencies"]
    },
    {
      title: "Mobile Development",
      duration: "280 hrs",
      description: "Native and cross-platform mobile app development for iOS and Android",
      placementRate: "83%",
      avgSalary: "₹6 LPA",
      modules: ["React Native", "Flutter", "iOS/Android Basics", "Mobile UI/UX", "API Integration", "App Deployment"],
      projects: ["E-commerce App", "Social Media App", "Fitness Tracker"],
      companies: ["Mobile Companies", "Startups", "Product Companies", "MNCs"]
    },
    {
      title: "QA & Test Automation",
      duration: "240 hrs",
      description: "Manual and automated testing with modern tools and frameworks",
      placementRate: "86%",
      avgSalary: "₹5.5 LPA",
      modules: ["Manual Testing", "Selenium", "API Testing", "Performance Testing", "Test Management", "Agile Testing"],
      projects: ["Test Automation Framework", "API Test Suite", "Performance Test Plan"],
      companies: ["Testing Companies", "MNCs", "Product Companies", "Startups"]
    }
  ];

  const learningJourney = [
    {
      phase: "Foundation Building",
      duration: "Weeks 1-4",
      description: "Strong fundamentals in programming, databases, and web technologies",
      activities: ["Daily coding practice", "Concept clarity sessions", "Mini projects", "Weekly assessments"],
      outcome: "Solid technical foundation"
    },
    {
      phase: "Core Skills Development",
      duration: "Weeks 5-12",
      description: "Deep dive into program-specific technologies and frameworks",
      activities: ["Advanced concepts", "Hands-on labs", "Team projects", "Code reviews"],
      outcome: "Program-specific expertise"
    },
    {
      phase: "Project & Portfolio Building",
      duration: "Weeks 13-16",
      description: "Build real projects and create impressive GitHub portfolio",
      activities: ["Capstone project", "Portfolio creation", "Code optimization", "Documentation"],
      outcome: "Industry-ready portfolio"
    },
    {
      phase: "Placement Preparation",
      duration: "Weeks 17-20",
      description: "Interview preparation, resume building, and placement drives",
      activities: ["Mock interviews", "Resume workshops", "Company-specific prep", "Placement drives"],
      outcome: "Job-ready with multiple offers"
    }
  ];

  const placementStats = {
    overall: "85%",
    byProgram: {
      "Java Full Stack": "87%",
      "Python Full Stack": "84%",
      "Data Science": "82%",
      "MERN Stack": "89%",
      "Cloud Computing": "85%",
      "DevOps": "81%",
      "Cyber Security": "79%",
      "Mobile Development": "83%",
      "QA & Test Automation": "86%"
    },
    salaryRanges: {
      "₹4-6 LPA": "35%",
      "₹6-8 LPA": "42%",
      "₹8-10 LPA": "18%",
      "₹10+ LPA": "5%"
    },
    topCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini", "HCL", "LTI", "Amazon", "Microsoft", "Oracle", "100+ Startups"],
    roles: ["Software Developer", "Full Stack Developer", "Data Analyst", "QA Engineer", "DevOps Engineer", "Cloud Engineer", "Mobile Developer"]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-100 mb-4">FINISHING SCHOOL FOR FRESHERS</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              From Campus to Career in 4-6 Months
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12">
              Industry-aligned programs that transform fresh graduates into job-ready professionals. 
              Real projects, placement support, and guaranteed interviews with top companies.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold mb-2">3,500+</div>
                <div className="text-sm text-blue-100">Freshers Placed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold mb-2">85%</div>
                <div className="text-sm text-blue-100">Placement Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold mb-2">₹6.5 LPA</div>
                <div className="text-sm text-blue-100">Average Salary</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold mb-2">200+</div>
                <div className="text-sm text-blue-100">Hiring Partners</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <Target className="w-5 h-5 mr-2 inline" />
                Explore Programs
              </button>
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                <Users className="w-5 h-5 mr-2 inline" />
                Talk to Counselor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Choose Your Career Path</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              9 industry-proven programs designed specifically for fresh graduates. 
              Each program guarantees placement support and real project experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                  <div className="text-sm font-semibold text-blue-600">{program.duration}</div>
                </div>
                
                <p className="text-gray-700 mb-6">{program.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{program.placementRate}</div>
                    <div className="text-sm text-gray-600">Placement Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{program.avgSalary}</div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Modules:</h4>
                  <div className="flex flex-wrap gap-2">
                    {program.modules.slice(0, 4).map((module, moduleIndex) => (
                      <span key={moduleIndex} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {module}
                      </span>
                    ))}
                    {program.modules.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        +{program.modules.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Projects:</h4>
                  <div className="space-y-1">
                    {program.projects.map((project, projectIndex) => (
                      <div key={projectIndex} className="text-sm text-gray-600">• {project}</div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Top Recruiters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {program.companies.slice(0, 3).map((company, companyIndex) => (
                      <span key={companyIndex} className="px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-700">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Your 20-Week Journey to Job</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Structured learning path that takes you from zero to job-ready professional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningJourney.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="text-sm font-semibold text-blue-600">{phase.duration}</div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{phase.phase}</h3>
                  <p className="text-gray-700 mb-4">{phase.description}</p>
                  
                  <div className="space-y-2">
                    {phase.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-green-600">Outcome: {phase.outcome}</div>
                  </div>
                </div>
                
                {index < learningJourney.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placement Success */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Placement Success Metrics</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Real numbers that speak for our commitment to your career success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">{placementStats.overall}</div>
              <div className="text-sm text-gray-600">Overall Placement Rate</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-green-600 mb-2">₹6.5 LPA</div>
              <div className="text-sm text-gray-600">Average Starting Salary</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">3,500+</div>
              <div className="text-sm text-gray-600">Freshers Placed</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">200+</div>
              <div className="text-sm text-gray-600">Hiring Partners</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Placement Rate by Program</h3>
              <div className="space-y-3">
                {Object.entries(placementStats.byProgram).map(([program, rate]) => (
                  <div key={program} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{program}</span>
                    <span className="text-sm font-semibold text-green-600">{rate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Salary Distribution</h3>
              <div className="space-y-3">
                {Object.entries(placementStats.salaryRanges).map(([range, percentage]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{range}</span>
                    <span className="text-sm font-semibold text-blue-600">{percentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Hiring Companies</h3>
            <div className="flex flex-wrap gap-3">
              {placementStats.topCompanies.map((company, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 3,500+ freshers who transformed their careers with Sudaksha. Your journey from campus to corporate starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <Target className="w-5 h-5 mr-2 inline" />
              Explore Programs
            </button>
            <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
              <Users className="w-5 h-5 mr-2 inline" />
              Talk to Counselor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
