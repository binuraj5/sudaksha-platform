'use client';

import IndividualsHero from '@/components/individuals/IndividualsHero';
import AudienceSelector from '@/components/individuals/AudienceSelector';
import ProgramShowcase from '@/components/individuals/ProgramShowcase';
import ProgramComparison from '@/components/individuals/ProgramComparison';
import ProfessionalsHero from '@/components/individuals/ProfessionalsHero';
import CareerTransitions from '@/components/individuals/CareerTransitions';
import LeadershipPrograms from '@/components/individuals/LeadershipPrograms';
import CareerSwitchersHero from '@/components/individuals/CareerSwitchersHero';
import CareerSwitchersJourney from '@/components/individuals/CareerSwitchersJourney';

// Mock data for the individuals page
const mockData = {
  hero: {
    eyebrow: "FOR INDIVIDUALS - CAREER TRANSFORMATION",
    headline: "Transform Your Career, Transform Your Life",
    subheadline: "From zero to job-ready in 4-6 months. 85%+ placement rate, 10,000+ success stories, and lifetime career support.",
    valuePropositions: [
      { id: 1, text: "Programs: 9 Career-launch programs for freshers" },
      { id: 2, text: "Professionals: Weekend programs for working professionals" },
      { id: 3, text: "Switchers: Complete journey for career switchers" },
      { id: 4, text: "Support: Lifetime placement support and mentorship" }
    ],
    primaryCTA: { text: "Explore Programs", href: "#programs" },
    secondaryCTA: { text: "Talk to Counselor", href: "#counseling" },
    trustBanner: "10,000+ Placements | 85%+ Placement Rate | ₹6.5 LPA Average Salary | 200+ Hiring Partners"
  },
  audienceSelector: {
    headline: "Choose Your Career Path",
    subheadline: "We have specialized programs for every career stage and background",
    audiences: [
      {
        id: "freshers",
        title: "For Freshers",
        subtitle: "Career-Launch Programs",
        description: "Start your tech career with our comprehensive programs designed for beginners with no prior experience.",
        icon: "Code",
        stats: [
          "9 programs available",
          "85%+ placement rate",
          "₹4-8 LPA starting salary",
          "4-6 months duration"
        ],
        color: "from-green-500 to-green-700",
        programs: 9
      },
      {
        id: "professionals",
        title: "Working Professionals",
        subtitle: "Career Acceleration",
        description: "Level up your career with weekend and evening programs designed for working professionals.",
        icon: "Briefcase",
        stats: [
          "Weekend batches",
          "2-3x salary growth",
          "Career transitions",
          "6-8 months duration"
        ],
        color: "from-blue-500 to-blue-700",
        programs: 12
      },
      {
        id: "switchers",
        title: "Career Switchers",
        subtitle: "Complete Journey",
        description: "Switch to tech with our comprehensive programs that take you from any background to tech professional.",
        icon: "TrendingUp",
        stats: [
          "Non-tech to tech",
          "Personalized guidance",
          "Strong portfolio",
          "8-12 months journey"
        ],
        color: "from-purple-500 to-purple-700",
        programs: 6
      }
    ]
  },
  programShowcase: {
    headline: "9 Career-Launch Programs: Choose Your Tech Path",
    subheadline: "All programs include: Live training + Real projects + Placement support + Lifetime access",
    filterOptions: [
      "All Programs",
      "Most Popular",
      "Highest Placement Rate",
      "Duration (Short to Long)",
      "By Technology Domain"
    ],
    programs: [
      {
        id: "java-fullstack",
        title: "JAVA FULL STACK PLUS (320 HOURS)",
        duration: "4 months (Intensive) | 6 months (Weekend)",
        hours: 320,
        placementRate: 87,
        avgSalary: "₹6.5 LPA",
        fee: "₹45,000",
        emi: "₹5,000/month",
        level: "Beginner to Advanced",
        badges: ["Most Popular"],
        description: "Most Popular Badge | 85%+ Placement Rate",
        whatYouBecome: "A job-ready Full Stack Java Developer capable of building enterprise-grade applications from scratch",
        curriculum: [
          {
            phase: "Phase 1: JAVA FUNDAMENTALS",
            duration: "80 hours - 4 weeks",
            topics: [
              "Java Basics: Syntax, Data Types, Operators",
              "Object-Oriented Programming: Classes, Objects, Inheritance",
              "Collections Framework: List, Set, Map, Queue",
              "Java 8+ Features: Lambda Expressions, Stream API"
            ],
            project: "Library Management System"
          },
          {
            phase: "Phase 2: WEB TECHNOLOGIES",
            duration: "60 hours - 3 weeks",
            topics: [
              "HTML5: Semantic tags, Forms, Validation",
              "CSS3: Flexbox, Grid, Animations",
              "JavaScript ES6+: Variables, Functions, Objects",
              "Bootstrap 5: Components, Grid System"
            ],
            project: "Restaurant Website"
          },
          {
            phase: "Phase 3: REACT.JS",
            duration: "50 hours - 2.5 weeks",
            topics: [
              "React Basics: Components, JSX, Props",
              "State Management: useState, useEffect",
              "React Router: Navigation, Routes, Links",
              "Context API for State Sharing"
            ],
            project: "Task Management Dashboard"
          },
          {
            phase: "Phase 4: BACKEND WITH SPRING BOOT",
            duration: "80 hours - 4 weeks",
            topics: [
              "Spring Boot Basics: Project Setup, Configuration",
              "Spring MVC: Controllers, Request Mapping",
              "Spring Data JPA: Entities, Repositories",
              "Spring Security: Authentication, Authorization"
            ],
            project: "Blog REST API"
          },
          {
            phase: "Phase 5: DEVOPS & DEPLOYMENT",
            duration: "30 hours - 1.5 weeks",
            topics: [
              "Git: Branching, Merging, Pull Requests",
              "Docker Basics: Containers, Images, Dockerfile",
              "AWS Fundamentals: EC2, S3, RDS",
              "CI/CD Basics: GitHub Actions"
            ],
            project: "Deploy Full Stack Application"
          }
        ],
        tools: [
          "Java", "Spring Boot", "React.js", "MySQL", "Git", "Docker", "AWS", "Bootstrap"
        ],
        outcomes: [
          "Build complete full-stack web applications independently",
          "Design and develop RESTful APIs following industry best practices",
          "Create responsive, user-friendly interfaces with React",
          "Implement secure authentication and authorization",
          "Work with relational databases and optimize queries",
          "Deploy applications to cloud platforms (AWS)"
        ],
        careerPaths: [
          { role: "Junior Full Stack Developer", salary: "₹4-6 LPA" },
          { role: "Java Developer", salary: "₹4.5-6.5 LPA" },
          { role: "Backend Developer", salary: "₹4-6 LPA" },
          { role: "Frontend Developer", salary: "₹4-5.5 LPA" }
        ],
        batches: [
          "Intensive: Jan 15, Feb 5, Mar 1",
          "Weekend: Jan 18, Feb 8, Mar 8",
          "Evening: Jan 20, Feb 10, Mar 10"
        ],
        prerequisites: [
          "Any graduate degree",
          "Basic computer knowledge",
          "English communication (basic level)",
          "No prior coding experience required"
        ],
        successStories: [
          {
            name: "Priya Malhotra",
            background: "B.Tech CSE, 2023 graduate, unemployed for 9 months",
            placement: "Infosys - Systems Engineer (Full Stack) - ₹7.2 LPA",
            quote: "Best decision of my life. From zero hope to ₹60K/month in 4 months."
          }
        ],
        faqs: [
          {
            question: "I have zero coding experience. Can I join?",
            answer: "Yes! 60% of our students start with zero coding experience. We teach from absolute basics."
          },
          {
            question: "What if I can't keep up with the pace?",
            answer: "We have doubt-clearing sessions daily. You can also join the same module in the next batch (free of cost) if needed."
          }
        ]
      },
      {
        id: "python-fullstack",
        title: "PYTHON FULL STACK (280 HOURS)",
        duration: "3.5 months (Intensive) | 5-6 months (Weekend)",
        hours: 280,
        placementRate: 84,
        avgSalary: "₹6.2 LPA",
        fee: "₹42,000",
        emi: "₹4,800/month",
        level: "Beginner to Advanced",
        badges: ["High Demand"],
        description: "High Demand Badge | 84% Placement Rate",
        whatYouBecome: "A versatile Full Stack Python Developer skilled in Django/Flask, ready for web development, automation, and data-driven applications",
        curriculum: [
          {
            phase: "Phase 1: PYTHON FUNDAMENTALS",
            duration: "60 hours - 3 weeks",
            topics: [
              "Python Basics: Variables, Data Types, Operators",
              "Object-Oriented Programming: Classes, Inheritance",
              "File Handling: Read/Write files, CSV, JSON",
              "Modules and Packages"
            ],
            project: "Expense Tracker (Console-based)"
          },
          {
            phase: "Phase 2: DJANGO FRAMEWORK",
            duration: "80 hours - 4 weeks",
            topics: [
              "Django Project Structure",
              "MVT Architecture (Model-View-Template)",
              "Django ORM: Models, QuerySets, Relationships",
              "Django REST Framework: Serializers, ViewSets"
            ],
            project: "Blog Application with Django"
          },
          {
            phase: "Phase 3: FRONTEND WITH REACT",
            duration: "40 hours - 2 weeks",
            topics: [
              "React Components, JSX, Props, State",
              "React Hooks: useState, useEffect, useContext",
              "React Router for Navigation",
              "Axios for API Integration"
            ],
            project: "Dashboard connecting to Django REST API"
          },
          {
            phase: "Phase 4: DATABASE & DEPLOYMENT",
            duration: "40 hours - 2 weeks",
            topics: [
              "PostgreSQL: Advanced Queries, Joins, Indexing",
              "Git & GitHub",
              "Docker Basics: Containerization",
              "AWS: EC2, S3, RDS"
            ],
            project: "Deploy Blog Application to AWS"
          }
        ],
        tools: [
          "Python", "Django", "Django REST Framework", "React.js", "PostgreSQL", "Git", "Docker", "AWS"
        ],
        outcomes: [
          "Build complete web applications with Django",
          "Develop RESTful APIs with Django REST Framework",
          "Create responsive frontends with React",
          "Work with PostgreSQL databases",
          "Deploy applications to cloud (AWS)",
          "Implement authentication and authorization"
        ],
        careerPaths: [
          { role: "Python Developer", salary: "₹4-6.5 LPA" },
          { role: "Django Developer", salary: "₹4.5-7 LPA" },
          { role: "Full Stack Python Developer", salary: "₹5-8 LPA" },
          { role: "Backend Developer", salary: "₹4-6 LPA" }
        ],
        batches: [
          "Intensive: Jan 22, Feb 12, Mar 5",
          "Weekend: Jan 25, Feb 15, Mar 15"
        ],
        prerequisites: [
          "Basic mathematics (10+2 level)",
          "Logical thinking",
          "No coding experience required"
        ],
        successStories: [
          {
            name: "Amit Singh",
            background: "B.Com graduate, no tech background",
            placement: "Tech Startup (E-commerce) - Junior Full Stack Developer - ₹6 LPA",
            quote: "Came from commerce background. Sudaksha made me a developer. Impossible became possible."
          }
        ],
        faqs: [
          {
            question: "Is Python easier than Java?",
            answer: "Yes! Python has simpler syntax and is more beginner-friendly. It's great for first-time programmers."
          },
          {
            question: "Can I switch to data science later?",
            answer: "Absolutely! Python is the language of choice for data science and AI. This program gives you a strong foundation."
          }
        ]
      },
      {
        id: "mern-stack",
        title: "MERN STACK (300 HOURS)",
        duration: "4 months (Intensive) | 6 months (Weekend)",
        hours: 300,
        placementRate: 89,
        avgSalary: "₹6.8 LPA",
        fee: "₹44,000",
        emi: "₹4,900/month",
        level: "Beginner to Advanced",
        badges: ["Trending"],
        description: "Trending Badge | 89% Placement Rate (Highest among all programs)",
        whatYouBecome: "A modern JavaScript Full Stack Developer using MongoDB, Express.js, React.js, and Node.js—the most in-demand tech stack for startups",
        curriculum: [
          {
            phase: "Phase 1: JAVASCRIPT MASTERY",
            duration: "70 hours - 3.5 weeks",
            topics: [
              "JavaScript Fundamentals: Variables, Data Types, Operators",
              "ES6+ Features: let/const, template literals, modules",
              "Asynchronous JavaScript: Callbacks, Promises, async/await",
              "DOM Manipulation and Event Handling"
            ],
            project: "Interactive Todo App (Vanilla JS)"
          },
          {
            phase: "Phase 2: REACT.JS",
            duration: "70 hours - 3.5 weeks",
            topics: [
              "React Basics: Components, JSX, Props",
              "State Management: useState, useReducer",
              "React Router: Routes, Navigation, Params",
              "Redux Toolkit for State Management"
            ],
            project: "Social Media Feed (with Redux)"
          },
          {
            phase: "Phase 3: NODE.JS & EXPRESS.JS",
            duration: "70 hours - 3.5 weeks",
            topics: [
              "Node.js Basics: Modules, npm, package.json",
              "Express.js: Routing, Middleware",
              "RESTful API Design",
              "Authentication: JWT, bcrypt"
            ],
            project: "Secure Authentication API"
          },
          {
            phase: "Phase 4: MONGODB & INTEGRATION",
            duration: "60 hours - 3 weeks",
            topics: [
              "MongoDB Basics: Documents, Collections",
              "Mongoose: Schemas, Models, Validation",
              "Connecting React Frontend with Node Backend",
              "Deployment: Frontend (Vercel), Backend (Heroku)"
            ],
            project: "Real-Time Chat & Collaboration Platform"
          }
        ],
        tools: [
          "JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "Redux", "Socket.io", "Docker"
        ],
        outcomes: [
          "Build complete MERN stack applications",
          "Develop RESTful and Real-time APIs",
          "Implement authentication and authorization",
          "Work with NoSQL databases (MongoDB)",
          "Deploy scalable applications",
          "Modern JavaScript mastery (ES6+)"
        ],
        careerPaths: [
          { role: "MERN Stack Developer", salary: "₹5-8 LPA" },
          { role: "Frontend Developer (React)", salary: "₹4.5-7 LPA" },
          { role: "Backend Developer (Node)", salary: "₹5-7.5 LPA" },
          { role: "Full Stack JavaScript Developer", salary: "₹5.5-9 LPA" }
        ],
        batches: [
          "Intensive: Jan 18, Feb 8, Mar 1",
          "Weekend: Jan 20, Feb 10, Mar 8"
        ],
        prerequisites: [
          "Basic computer knowledge",
          "Logical thinking",
          "Interest in modern web development"
        ],
        successStories: [
          {
            name: "Sneha Reddy",
            background: "B.Tech ECE, weak coding skills",
            placement: "Cognizant - Programmer Analyst - ₹6.5 LPA",
            quote: "I struggled with coding in college. Here, I learned properly from scratch. Now I love coding!"
          }
        ],
        faqs: [
          {
            question: "Why is MERN so popular?",
            answer: "Single language (JavaScript) for frontend + backend, highest demand in startups, and modern cutting-edge technology."
          },
          {
            question: "Is it good for freshers?",
            answer: "Yes! MERN has the highest placement rate (89%) because startups prefer this stack. It's modern and in high demand."
          }
        ]
      },
      {
        id: "data-science",
        title: "DATA SCIENCE & ANALYTICS (360 HOURS)",
        duration: "5 months (Intensive) | 7-8 months (Weekend)",
        hours: 360,
        placementRate: 82,
        avgSalary: "₹7.2 LPA",
        fee: "₹55,000",
        emi: "₹6,200/month",
        level: "Intermediate to Advanced",
        badges: ["High Growth"],
        description: "High Growth Badge | 82% Placement Rate",
        whatYouBecome: "A job-ready Data Scientist/Analyst capable of extracting insights from data, building predictive models, and creating data-driven solutions",
        curriculum: [
          {
            phase: "Phase 1: FOUNDATIONS",
            duration: "80 hours - 4 weeks",
            topics: [
              "Python for Data Science: NumPy, Pandas",
              "Statistics & Mathematics: Probability, Hypothesis Testing",
              "Data Cleaning: Handling Missing Values, Duplicates",
              "Data Visualization: Matplotlib, Seaborn"
            ],
            project: "Sales Data Analysis"
          },
          {
            phase: "Phase 2: MACHINE LEARNING",
            duration: "100 hours - 5 weeks",
            topics: [
              "Supervised Learning: Linear Regression, Logistic Regression",
              "Decision Trees, Random Forests, SVM",
              "Model Evaluation: Accuracy, Precision, Recall",
              "Feature Engineering and Selection"
            ],
            project: "Housing Price Prediction"
          },
          {
            phase: "Phase 3: ADVANCED ML & DEEP LEARNING",
            duration: "80 hours - 4 weeks",
            topics: [
              "Ensemble Methods: XGBoost, LightGBM",
              "Unsupervised Learning: K-Means, Clustering",
              "Neural Networks: TensorFlow, Keras",
              "CNN for Image Classification (basics)"
            ],
            project: "Customer Segmentation"
          },
          {
            phase: "Phase 4: BIG DATA & DEPLOYMENT",
            duration: "30 hours - 1.5 weeks",
            topics: [
              "SQL for Data Analysis",
              "Big Data Basics: Spark (PySpark introduction)",
              "ML Model Deployment: Flask API",
              "Cloud Platforms: AWS SageMaker basics"
            ],
            project: "Deploy ML Model as API"
          }
        ],
        tools: [
          "Python", "NumPy", "Pandas", "Scikit-learn", "TensorFlow", "Keras", "Matplotlib", "SQL"
        ],
        outcomes: [
          "Analyze and visualize complex datasets",
          "Build and evaluate machine learning models",
          "Apply statistical techniques",
          "Create predictive models",
          "Deploy ML models as APIs",
          "Communicate insights through visualizations"
        ],
        careerPaths: [
          { role: "Data Analyst", salary: "₹5-7 LPA" },
          { role: "Data Scientist", salary: "₹7-10 LPA" },
          { role: "ML Engineer", salary: "₹8-12 LPA" },
          { role: "Business Analyst (Data)", salary: "₹6-8 LPA" }
        ],
        batches: [
          "Intensive: Feb 1, Mar 1, Apr 1",
          "Weekend: Feb 3, Mar 3"
        ],
        prerequisites: [
          "Basic mathematics (10+2 level)",
          "Logical thinking",
          "No coding experience required (we teach from scratch)"
        ],
        successStories: [
          {
            name: "Rahul Kumar",
            background: "B.Sc Statistics, interested in data",
            placement: "Analytics Company - Data Analyst - ₹7.5 LPA",
            quote: "Combined my statistics background with coding skills. Now I'm a data scientist earning more than I ever imagined."
          }
        ],
        faqs: [
          {
            question: "Is data science a good career?",
            answer: "Yes! It's the highest paying tech field for freshers (avg ₹7-8 LPA) with excellent growth prospects."
          },
          {
            question: "Do I need strong math background?",
            answer: "Basic 10+2 level math is sufficient. We teach the required statistics and math concepts from scratch."
          }
        ]
      }
    ]
  },
  programComparison: {
    headline: "Compare Programs & Make the Right Choice",
    subheadline: "Detailed comparison to help you select the perfect program for your career goals",
    programs: [
      {
        name: "Java Full Stack",
        duration: "320 hrs",
        difficulty: "Medium",
        bestFor: "Enterprise roles",
        placementRate: "87%",
        avgSalary: "₹6.5 LPA",
        learningCurve: "Steeper initially",
        jobMarket: "Very High",
        futureScope: "Stable & Long-term"
      },
      {
        name: "Python Full Stack",
        duration: "280 hrs",
        difficulty: "Easy",
        bestFor: "Startups, versatile",
        placementRate: "84%",
        avgSalary: "₹6.2 LPA",
        learningCurve: "Gentle",
        jobMarket: "High",
        futureScope: "Very High"
      },
      {
        name: "MERN Stack",
        duration: "300 hrs",
        difficulty: "Easy-Medium",
        bestFor: "Startups, modern web",
        placementRate: "89%",
        avgSalary: "₹6.8 LPA",
        learningCurve: "Smooth",
        jobMarket: "Highest (startups)",
        futureScope: "Very High"
      },
      {
        name: "Data Science",
        duration: "360 hrs",
        difficulty: "Medium-Hard",
        bestFor: "Analytics, ML",
        placementRate: "82%",
        avgSalary: "₹7.2 LPA",
        learningCurve: "Math-heavy",
        jobMarket: "High & Growing",
        futureScope: "Excellent (AI/ML)"
      }
    ],
    comparisonTable: {
      headers: ["Feature", "Java Full Stack", "Python Full Stack", "MERN Stack", "Data Science"],
      rows: [
        { feature: "Duration", values: ["320 hrs", "280 hrs", "300 hrs", "360 hrs"] },
        { feature: "Difficulty", values: ["Medium", "Easy", "Easy-Medium", "Medium-Hard"] },
        { feature: "Best For", values: ["Enterprise roles", "Startups, versatile", "Startups, modern web", "Analytics, ML"] },
        { feature: "Placement Rate", values: ["87%", "84%", "89%", "82%"] },
        { feature: "Average Salary", values: ["₹6.5 LPA", "₹6.2 LPA", "₹6.8 LPA", "₹7.2 LPA"] },
        { feature: "Learning Curve", values: ["Steeper initially", "Gentle", "Smooth", "Math-heavy"], important: true },
        { feature: "Job Market", values: ["Very High", "High", "Highest (startups)", "High & Growing"] },
        { feature: "Future Scope", values: ["Stable & Long-term", "Very High", "Very High", "Excellent (AI/ML)"] }
      ]
    }
  },
  professionalsHero: {
    eyebrow: "FOR WORKING PROFESSIONALS - CAREER ACCELERATION",
    headline: "Don't Just Work. Grow. Transform Your Tech Career Without Quitting Your Job.",
    subheadline: "Weekend and evening programs designed for working professionals. Transition to better roles, learn new technologies, or climb to architect/leadership positions—all while staying employed.",
    valuePropositions: [
      { id: 1, text: "Weekend: Learn without leaving your current job" },
      { id: 2, text: "Career: 2-3x salary growth potential" },
      { id: 3, text: "Transition: Switch roles or technologies smoothly" },
      { id: 4, text: "Leadership: Path to architect and senior roles" }
    ],
    primaryCTA: { text: "Explore Professional Programs", href: "#professionals-programs" },
    secondaryCTA: { text: "Talk to Career Counselor", href: "#counseling" },
    trustBanner: "5,000+ Professionals Transformed | 2-3x Average Salary Growth | Weekend Batches Available | Lifetime Career Support",
    careerStages: [
      {
        title: "Stage 1: Junior/Mid-Level",
        description: "1-5 Years Experience",
        icon: "Briefcase",
        experience: "1-5 years experience",
        programs: 3
      },
      {
        title: "Stage 2: Senior/Leadership",
        description: "5-12 Years Experience",
        icon: "Award",
        experience: "5-12 years experience",
        programs: 2
      }
    ]
  },
  careerTransitions: {
    headline: "For Working Professionals: Career Acceleration Programs",
    subheadline: "Weekend and evening programs designed for working professionals. Transition to better roles, learn new technologies, or climb to architect/leadership positions—all while staying employed.",
    stages: [
      {
        title: "STAGE 1: JUNIOR/MID-LEVEL (1-5 YEARS EXPERIENCE)",
        description: "Target: Break through the ceiling, transition to better-paying roles",
        transitions: [
          {
            id: "manual-to-automation",
            title: "TRANSITION 1: MANUAL TO AUTOMATION TESTING",
            subtitle: "Most Popular Transition | 72% Successfully Switched Roles",
            badge: "Most Popular Transition",
            successRate: "72% Successfully Switched",
            description: "You're stuck. Maybe you're a support engineer wanting to become a developer. Or a manual tester wanting to learn automation. Or working with outdated tech and want to learn modern stacks. Your salary growth is stagnant. Promotions are slow. You know you can do more, but don't know how to break through.",
            whoItsFor: [
              "Manual testers (1-5 years experience)",
              "Currently earning ₹3-5 LPA",
              "Want to double salary and future-proof career",
              "Tired of repetitive manual work"
            ],
            whatYouAchieve: {
              role: "Become Automation Test Engineer",
              salaryJump: "Salary jump: 60-100% (₹6-10 LPA)"
            },
            curriculum: [
              {
                phase: "Month 1: Programming Foundations",
                duration: "Why this matters: You can't automate without coding.",
                topics: [
                  "Java or Python (you choose based on company needs)",
                  "Object-Oriented Programming",
                  "Data Structures basics",
                  "Exception Handling",
                  "File Operations"
                ],
                project: "Simple automation scripts"
              },
              {
                phase: "Month 2: Selenium WebDriver Mastery",
                duration: "Core automation skills",
                topics: [
                  "Selenium Architecture",
                  "Locators: ID, Name, XPath, CSS Selector",
                  "WebDriver Commands",
                  "Synchronization: Implicit, Explicit, Fluent Wait",
                  "Handling Alerts, Popups, Frames, Windows",
                  "Cross-Browser Testing",
                  "Headless Testing"
                ],
                project: "Automate 10 test scenarios for e-commerce site"
              },
              {
                phase: "Month 3: Advanced Automation",
                duration: "Framework development",
                topics: [
                  "TestNG/JUnit: Annotations, Assertions, Test Suites",
                  "Data-Driven Testing: Reading from Excel, CSV",
                  "Keyword-Driven Framework",
                  "Hybrid Framework",
                  "Page Object Model (POM)",
                  "Page Factory",
                  "Maven for Build Management",
                  "Logging: Log4j"
                ],
                project: "Build automation framework from scratch"
              },
              {
                phase: "Month 4: API & Mobile Testing",
                duration: "Expand testing scope",
                topics: [
                  "API Testing: REST Assured",
                  "JSON, XML Handling",
                  "API Assertions and Validations",
                  "Mobile Testing: Appium basics",
                  "Android/iOS app automation"
                ],
                project: "API test automation suite"
              },
              {
                phase: "Month 5: CI/CD & DevOps for QA",
                duration: "Modern testing practices",
                topics: [
                  "Git & GitHub for test code",
                  "Jenkins: CI/CD for test automation",
                  "Docker for test environment",
                  "Selenium Grid for parallel testing",
                  "BDD: Cucumber, Gherkin",
                  "Report Generation: Extent Reports, Allure"
                ],
                project: "Complete CI/CD pipeline for automation tests"
              },
              {
                phase: "Month 6: Performance & Advanced Topics",
                duration: "Complete skill set",
                topics: [
                  "Performance Testing: JMeter basics",
                  "Load Testing concepts",
                  "Database Testing: SQL queries for validation",
                  "Test Strategy and Planning",
                  "Defect Life Cycle",
                  "Agile Testing Practices"
                ],
                project: "Complete test automation framework for a full application"
              }
            ],
            uniqueValue: [
              "Your support experience gives you an advantage—you understand systems. Now learn to build them.",
              "We teach you to articulate your testing knowledge as automation skills in interviews.",
              "Build GitHub portfolio with 5 real automation projects",
              "Position as 'QA Professional with Automation Expertise' not 'Manual Tester trying to learn automation'"
            ],
            successStory: {
              name: "Rajesh Kumar",
              before: "Manual Tester, ₹4.5 LPA, 4 years experience",
              after: "Automation Lead, ₹9 LPA, Product Company",
              timeline: "6 months program + 2 months job search",
              quote: "4 years manual testing, stuck at ₹4.5 LPA. After Sudaksha's weekend program, I'm automation lead at ₹9 LPA. My skills are now valued, not replaceable."
            },
            fee: "₹38,000",
            schedule: "Weekend: Sat-Sun, 9 AM - 5 PM",
            duration: "6 months (180 hours)",
            nextBatches: ["Feb 3, Mar 3, Apr 7"],
            prerequisites: [
              "1+ years manual testing experience",
              "Basic computer skills",
              "Windows/Mac/Linux familiarity",
              "Eagerness to learn coding"
            ],
            roi: "Salary jump pays back investment in 3-6 months"
          },
          {
            id: "support-to-dev",
            title: "TRANSITION 2: SUPPORT TO DEVELOPMENT",
            subtitle: "High-Impact Transition | 68% Successfully Switched",
            badge: "High-Impact Transition",
            successRate: "68% Successfully Switched",
            description: "You solve complex problems daily, understand systems deeply, but you're not creating—you're fixing. You see developers earning double or triple, and you know you can do it too. You just need the right training and guidance.",
            whoItsFor: [
              "Technical support engineers",
              "L1/L2/L3 support professionals",
              "Currently earning ₹3-6 LPA",
              "Want to transition to development"
            ],
            whatYouAchieve: {
              role: "Become Software Developer",
              salaryJump: "Salary jump: 50-80% (₹6-11 LPA)"
            },
            curriculum: [
              {
                phase: "Phase 1: Programming Foundations (2 months)",
                duration: "Your support experience gives you an advantage",
                topics: [
                  "Programming Language (Java/Python choice)",
                  "OOP, Data Structures, Algorithms",
                  "Problem-solving and logic building",
                  "Code quality and best practices"
                ],
                project: "Simple automation scripts"
              },
              {
                phase: "Phase 2: Web Development Basics (2 months)",
                duration: "Frontend and backend fundamentals",
                topics: [
                  "HTML, CSS, JavaScript",
                  "Frontend framework (React basics)",
                  "Backend basics",
                  "Database fundamentals"
                ],
                project: "Personal portfolio website"
              },
              {
                phase: "Phase 3: Full Stack Development (3 months)",
                duration: "Choose your track",
                topics: [
                  "Track A: Java Full Stack (Spring Boot + React)",
                  "Track B: Python Full Stack (Django + React)",
                  "Track C: MERN Stack"
                ],
                project: "Full-stack e-commerce application"
              },
              {
                phase: "Phase 4: Capstone + Job Prep (1 month)",
                duration: "Career transition preparation",
                topics: [
                  "Build 3 projects showcasing development skills",
                  "Resume transformation (support → developer)",
                  "Interview preparation",
                  "System design basics"
                ],
                project: "Complete portfolio with 3 projects"
              }
            ],
            uniqueValue: [
              "Your troubleshooting skills = debugging skills",
              "Your system knowledge = architecture understanding",
              "Your client communication = stakeholder management",
              "We teach you to articulate this in interviews"
            ],
            successStory: {
              name: "Vikram Mehta",
              before: "L2 Support Engineer, ₹5.2 LPA, ITSM Tools",
              after: "Backend Developer, ₹9.5 LPA, Product Company",
              timeline: "8 months evening program + 3 months job search",
              quote: "Support gave me system thinking. Sudaksha gave me coding skills. Together, I'm a developer who actually understands production systems—a rare combination that employers value highly."
            },
            fee: "₹42,000",
            schedule: "Weekend (Sat-Sun) or Evening (Mon-Fri 7-10 PM)",
            duration: "8 months (240 hours)",
            nextBatches: ["Weekend: Feb 10, Mar 10", "Evening: Feb 12, Mar 12"],
            prerequisites: [
              "1+ years technical support experience",
              "Basic computer knowledge",
              "Problem-solving mindset",
              "Willingness to learn programming"
            ],
            roi: "Salary jump of ₹3-5 LPA pays back in 8-12 months"
          },
          {
            id: "tech-migration",
            title: "TRANSITION 3: TECH STACK MIGRATION",
            subtitle: "Future-Proof Your Career | 75% Successfully Transitioned",
            badge: "Future-Proof Your Career",
            successRate: "75% Successfully Transitioned",
            description: "You're an experienced developer but working with legacy technologies. You see the industry moving to modern stacks and want to stay relevant and increase your employability.",
            whoItsFor: [
              "Developers working on legacy technologies",
              ".NET → Java/Python",
              "Mainframe → Modern stack",
              "Old Java → Spring Boot/Microservices"
            ],
            whatYouAchieve: {
              role: "Modern Stack Developer",
              salaryJump: "Salary jump: 30-70% (₹8-18 LPA)"
            },
            curriculum: [
              {
                phase: "Month 1: Java Fundamentals",
                duration: "For .NET developers, we map concepts you already know",
                topics: [
                  "C# OOP → Java OOP (similarities and differences)",
                  ".NET Collections → Java Collections",
                  "LINQ → Stream API",
                  "Exception Handling comparison",
                  "Garbage Collection differences"
                ],
                project: "Migrate a .NET console app to Java"
              },
              {
                phase: "Month 2-3: Spring Boot Ecosystem",
                duration: "Modern backend development",
                topics: [
                  "ASP.NET MVC → Spring MVC",
                  "Entity Framework → Hibernate/JPA",
                  ".NET Core → Spring Boot",
                  "Dependency Injection comparison",
                  "RESTful API development",
                  "Microservices architecture"
                ],
                project: "Rebuild a .NET web API in Spring Boot"
              },
              {
                phase: "Month 4: Frontend (if needed)",
                duration: "Modern frontend skills",
                topics: [
                  "React.js (if coming from ASP.NET Razor)",
                  "Or continue with your frontend strength",
                  "TypeScript basics",
                  "Modern CSS and build tools"
                ],
                project: "Modern React frontend for your API"
              },
              {
                phase: "Month 5: Modern DevOps",
                duration: "Cloud and deployment",
                topics: [
                  "Git (if only used TFS)",
                  "Docker & Kubernetes",
                  "CI/CD with Jenkins",
                  "AWS/Azure (if new to cloud)",
                  "Infrastructure as Code basics"
                ],
                project: "Deploy your application to cloud"
              },
              {
                phase: "Month 6: Project + Job Transition",
                duration: "Career transition preparation",
                topics: [
                  "Build migration project (rebuild legacy app in modern stack)",
                  "Resume repositioning",
                  "Interview preparation",
                  "Salary negotiation (leverage both skillsets)"
                ],
                project: "Complete modern stack portfolio project"
              }
            ],
            uniqueValue: [
              "You're not starting from scratch - you're an experienced developer",
              "We map your existing knowledge to new technologies",
              "Focus on differences, not basics - much faster learning",
              "Position as 'Experienced developer with modern skills'"
            ],
            successStory: {
              name: "Pradeep Kumar",
              before: ".NET Developer (8 years), ₹12 LPA, Worried about future",
              after: "Java Full Stack Developer, ₹18 LPA, Product Company",
              timeline: "6 months weekend program",
              quote: "I was earning well in .NET, but I saw writing on the wall. Fewer jobs, older codebase, stagnant growth. I upskilled to Java in 6 months. Now I have 8 years of software engineering experience + modern tech stack. My value doubled."
            },
            fee: "₹35,000",
            schedule: "Weekend only (you're working full-time)",
            duration: "6 months (200 hours)",
            nextBatches: ["Feb 3, Mar 3, Apr 7"],
            prerequisites: [
              "3+ years development experience",
              "Strong understanding of at least one tech stack",
              "Basic cloud knowledge (AWS/Azure)",
              "Desire to learn modern technologies"
            ],
            roi: "Salary jump + career longevity = invaluable"
          }
        ]
      },
      {
        title: "STAGE 2: SENIOR/LEADERSHIP (5-12 YEARS EXPERIENCE)",
        description: "Target: Move from hands-on coding to architecture, leadership, and strategy roles",
        transitions: [
          {
            id: "solution-architecture",
            title: "PROGRAM 1: SOLUTION ARCHITECTURE MASTERY",
            subtitle: "Architect-Level Skills | ₹15-30 LPA Roles",
            badge: "Architect-Level Skills",
            successRate: "85% Placement in Architect Roles",
            description: "You're a senior developer. You've been coding for 7-10 years. You're good at it. But coding harder won't get you to the next level. You want to become a solutions architect, tech lead, or engineering manager.",
            whoItsFor: [
              "Senior developers (5-12 years)",
              "Currently earning ₹10-18 LPA",
              "Want to become Solutions Architect",
              "Ready to stop coding and start designing"
            ],
            whatYouAchieve: {
              role: "Become Solutions Architect",
              salaryJump: "Earn ₹15-30 LPA as Solutions Architect"
            },
            curriculum: [
              {
                phase: "Month 1: Architecture Fundamentals",
                duration: "Core architecture principles",
                topics: [
                  "Software Architecture Principles",
                  "Architectural Patterns: Monolithic, SOA, Microservices, Serverless",
                  "CAP Theorem, ACID vs BASE",
                  "Domain-Driven Design (DDD)",
                  "Event-Driven Architecture",
                  "CQRS and Event Sourcing",
                  "Scalability Patterns",
                  "Reliability and Fault Tolerance"
                ],
                project: "Design architecture for e-commerce platform"
              },
              {
                phase: "Month 2: Cloud Architecture (AWS/Azure/GCP)",
                duration: "Cloud expertise",
                topics: [
                  "AWS Core Services: EC2, S3, RDS, Lambda",
                  "VPC, Security Groups, IAM",
                  "Load Balancers, Auto Scaling",
                  "CloudFront, Route 53",
                  "Monitoring: CloudWatch",
                  "Cost Optimization",
                  "AWS Well-Architected Framework",
                  "High Availability & Disaster Recovery"
                ],
                project: "Design and deploy 3-tier application on AWS"
              },
              {
                phase: "Month 3: Microservices & Enterprise Architecture",
                duration: "Advanced architecture patterns",
                topics: [
                  "Microservices Architecture Deep Dive",
                  "API Gateway patterns",
                  "Service Mesh: Istio, Linkerd",
                  "Container Orchestration: Kubernetes",
                  "Service Discovery, Configuration Management",
                  "Distributed Transactions: Saga Pattern",
                  "Inter-Service Communication: REST, gRPC, Message Queues",
                  "Database per Service Pattern",
                  "TOGAF Framework Basics"
                ],
                project: "Design microservices architecture for enterprise application"
              },
              {
                phase: "Month 4: Security, Performance & Capstone",
                duration: "Production-ready architecture",
                topics: [
                  "Security Architecture",
                  "OAuth 2.0, OpenID Connect",
                  "Zero Trust Architecture",
                  "API Security",
                  "Data Encryption (at rest, in transit)",
                  "Compliance: GDPR, HIPAA, PCI-DSS",
                  "Performance Optimization Techniques",
                  "Architecture Decision Records (ADRs)"
                ],
                project: "Complete architecture design challenge with presentation"
              }
            ],
            uniqueValue: [
              "We don't teach you to code (you already know)",
              "We teach you to architect, lead, and strategize",
              "Focus on system thinking and business alignment",
              "Real-world architecture challenges, not just theory"
            ],
            successStory: {
              name: "Arjun Nair",
              before: "Senior Java Developer (8 years), ₹14 LPA, Bangalore",
              after: "Solutions Architect, FinTech, ₹24 LPA",
              timeline: "4 months weekend + 3 months job search",
              quote: "I was a great coder, but that wasn't enough for architect roles. Sudaksha taught me to think at system level, communicate architecture decisions, and lead technical discussions. The capstone project became my portfolio piece."
            },
            fee: "₹48,000",
            schedule: "Weekend (Sat-Sun, 9 AM - 5 PM)",
            duration: "4 months (160 hours)",
            nextBatches: ["Feb 3, Mar 10, Apr 7"],
            prerequisites: [
              "5+ years development experience",
              "Strong understanding of at least one tech stack",
              "Basic cloud knowledge (AWS/Azure)",
              "Desire to move beyond coding"
            ],
            roi: "Salary jump of ₹5-10 LPA pays back immediately"
          }
        ]
      }
    ]
  },
  leadershipPrograms: {
    headline: "SOLUTION ARCHITECTURE & LEADERSHIP PROGRAMS",
    subheadline: "Move from hands-on coding to architecture, leadership, and strategy roles",
    description: "These are 12-16 week intensive programs (weekends) specifically designed for senior professionals who want to transition to architect and leadership positions.",
    programs: [
      {
        id: "solution-architecture",
        title: "SOLUTION ARCHITECTURE MASTERY",
        subtitle: "From Senior Developer to Solutions Architect",
        badge: "Architect-Level Skills",
        targetRole: "Solutions Architect",
        salaryRange: "₹15-30 LPA",
        description: "Comprehensive program to transform senior developers into solutions architects capable of designing scalable, secure, high-performance systems.",
        whoItsFor: [
          "Senior developers (5-12 years experience)",
          "Currently earning ₹10-18 LPA",
          "Strong understanding of at least one tech stack",
          "Basic cloud knowledge (AWS/Azure)",
          "Desire to move beyond coding to architecture"
        ],
        curriculum: [
          {
            month: "Month 1: Architecture Fundamentals",
            topics: [
              "Software Architecture Principles",
              "Architectural Patterns: Monolithic, SOA, Microservices, Serverless",
              "CAP Theorem, ACID vs BASE",
              "Domain-Driven Design (DDD)",
              "Event-Driven Architecture",
              "CQRS and Event Sourcing",
              "Scalability Patterns",
              "Reliability and Fault Tolerance"
            ],
            deliverables: [
              "Architecture design for e-commerce platform",
              "Architecture decision records (ADRs)",
              "System design documentation"
            ]
          },
          {
            month: "Month 2: Cloud Architecture (AWS/Azure/GCP)",
            topics: [
              "AWS Core Services: EC2, S3, RDS, Lambda",
              "VPC, Security Groups, IAM",
              "Load Balancers, Auto Scaling",
              "CloudFront, Route 53",
              "Monitoring: CloudWatch",
              "Cost Optimization",
              "AWS Well-Architected Framework",
              "High Availability & Disaster Recovery"
            ],
            deliverables: [
              "Deploy 3-tier application on AWS",
              "Implement auto-scaling and load balancing",
              "Setup CI/CD pipeline",
              "Cost optimization report"
            ]
          },
          {
            month: "Month 3: Microservices & Enterprise Architecture",
            topics: [
              "Microservices Architecture Deep Dive",
              "API Gateway patterns",
              "Service Mesh: Istio, Linkerd",
              "Container Orchestration: Kubernetes",
              "Service Discovery, Configuration Management",
              "Distributed Transactions: Saga Pattern",
              "Inter-Service Communication: REST, gRPC, Message Queues",
              "Database per Service Pattern",
              "TOGAF Framework Basics"
            ],
            deliverables: [
              "Design microservices architecture for enterprise application",
              "Implement service mesh",
              "Create enterprise integration patterns",
              "Develop migration strategy from monolith to microservices"
            ]
          },
          {
            month: "Month 4: Security, Performance & Capstone",
            topics: [
              "Security Architecture",
              "OAuth 2.0, OpenID Connect",
              "Zero Trust Architecture",
              "API Security",
              "Data Encryption (at rest, in transit)",
              "Compliance: GDPR, HIPAA, PCI-DSS",
              "Performance Optimization Techniques",
              "Architecture Decision Records (ADRs)"
            ],
            deliverables: [
              "Complete architecture design challenge",
              "Security architecture implementation",
              "Performance optimization strategy",
              "Architecture presentation to panel"
            ]
          }
        ],
        learningOutcomes: [
          "Design scalable, secure, high-performance systems",
          "Make technology decisions with business context",
          "Lead architecture discussions and reviews",
          "Mentor development teams",
          "Prepare for AWS/Azure Solutions Architect certifications",
          "Earn ₹15-30 LPA as Solutions Architect"
        ],
        careerImpact: {
          before: "Senior Developer",
          after: "Solutions Architect",
          salaryJump: "67% jump (₹12 LPA → ₹20 LPA)"
        },
        fee: "₹48,000",
        schedule: "Weekend (Sat-Sun, 9 AM - 5 PM)",
        duration: "4 months (160 hours)",
        nextBatches: ["Feb 3, Mar 10, Apr 7"],
        prerequisites: [
          "5+ years development experience",
          "Strong understanding of at least one tech stack",
          "Basic cloud knowledge (AWS/Azure)",
          "Desire to move beyond coding"
        ],
        successStory: {
          name: "Arjun Nair",
          background: "Senior Java Developer (8 years), ₹14 LPA, Bangalore",
          timeline: "4 months weekend + 3 months job search",
          quote: "I was a great coder, but that wasn't enough for architect roles. Sudaksha taught me to think at system level, communicate architecture decisions, and lead technical discussions. The capstone project became my portfolio piece—I walked into interviews with a complete architecture design I could defend."
        },
        optionalAddOns: [
          {
            title: "AWS Solutions Architect Certification Prep",
            fee: "+₹8,000",
            duration: "+20 hours"
          },
          {
            title: "Azure Solutions Architect Certification Prep",
            fee: "+₹8,000",
            duration: "+20 hours"
          }
        ]
      }
    ]
  },
  careerSwitchersHero: {
    headline: "Change Careers at 30, 35, or 40. Over 800 People Have Done It. You Can Too.",
    subheadline: "Switching from non-tech to tech isn't easy. But it's possible. We've helped sales executives become developers, HR managers become data analysts, and operations leads become product managers. With the right guidance, assessment, and structured path—you can transform your career and life.",
    valuePropositions: [
      { id: 1, text: "Free Career Assessment & Counseling", icon: "Target" },
      { id: 2, text: "3-Month Foundation Program (Zero to Hero)", icon: "Code" },
      { id: 3, text: "4 Specialization Tracks (Dev, Data, QA, Tech Sales)", icon: "TrendingUp" },
      { id: 4, text: "800+ Success Stories, 60% Overall Placement Rate", icon: "Users" }
    ],
    primaryCTA: { text: "Take Free Assessment", href: "#assessment" },
    secondaryCTA: { text: "Book Free Counseling", href: "#counseling" },
    trustBanner: "800+ Career Switchers | 60% Placement Rate | ₹5-12 LPA Starting | 8-13 Month Journey",
    successMetrics: [
      { value: "800+", label: "Career Switchers", icon: "Users" },
      { value: "60%", label: "Placement Rate", icon: "TrendingUp" },
      { value: "₹5-12 LPA", label: "Starting Salary", icon: "Award" },
      { value: "8-13", label: "Months Journey", icon: "Clock" }
    ]
  },
  careerSwitchersJourney: {
    headline: "Your Complete Zero-to-Hero Transformation Journey",
    subheadline: "A structured 5-step process that takes you from career assessment to tech placement. We've helped 800+ professionals make successful career switches. Here's exactly how we'll do it for you.",
    phases: [
      {
        phase: "Step 1: Free Career Assessment",
        title: "Are You Ready for Tech Career Switch?",
        duration: "30 minutes online + 45 minutes counseling",
        description: "Before investing time and money, let's honestly assess if tech career switch is right for you. Our assessment evaluates your motivation, financial readiness, time commitment, learning style, and aptitude.",
        topics: [
          "Interactive Assessment Questionnaire (Motivation, Financial Runway, Time Commitment)",
          "Free Aptitude Test (Logical Reasoning, Problem-Solving, Pattern Recognition)",
          "One-on-One Career Counseling (45 minutes with career counselors, NOT sales people)",
          "Honest Assessment: Green Zone (Ready), Yellow Zone (Prepare More), Red Zone (Not Recommended)",
          "Personalized Career Path Recommendation Based on Your Background"
        ],
        outcomes: [
          "Clear understanding of your tech career readiness",
          "Personalized recommendation for specialization track",
          "Realistic timeline and financial planning",
          "Honest assessment of success probability (we don't promise everyone success)",
          "Free counseling session with no obligation to enroll"
        ],
        icon: "Target"
      },
      {
        phase: "Step 2: Foundation Program",
        title: "Build Your Tech Foundation (Zero to Hero)",
        duration: "3 months (120 hours)",
        description: "Unlike freshers with CS degrees, you have ZERO technical background. This foundation program builds the base from scratch - computer basics, programming logic, and fundamental concepts.",
        topics: [
          "Month 1: Computer & Programming Fundamentals (Hardware, Software, Logic, Problem-Solving)",
          "Month 2: Programming Basics (Python Fundamentals, Data Structures, Simple Projects)",
          "Month 3: Web & Database Basics (HTML/CSS/JavaScript, SQL, Mini Projects)",
          "Extremely Slow-Paced Teaching (we understand you're new to tech)",
          "Daily Practice Problems (Easy Level) + 5 Mini-Projects",
          "Patient Instructors Who Understand Non-Tech Backgrounds"
        ],
        outcomes: [
          "Comfortable with computers and software development tools",
          "Can write simple Python programs and understand programming logic",
          "Build basic web pages and understand database concepts",
          "Complete foundation assessment (60%+ pass rate)",
          "Confidence boost: 'I CAN do this!' mindset",
          "Ready for specialization track selection"
        ],
        icon: "Code"
      },
      {
        phase: "Step 3: Specialization Tracks",
        title: "Choose Your Tech Specialization",
        duration: "3-6 months (after foundation)",
        description: "After building your foundation, choose your path based on your interests, background, and career goals. Each track leverages your previous experience as an advantage.",
        topics: [
          "Track 1: Software Development (60% choose) - Full Stack (Java/Python/MERN)",
          "Track 2: Data Analytics (25% choose) - Excel, SQL, Python, Power BI/Tableau",
          "Track 3: QA/Testing (15% choose) - Manual + Automation (Selenium)",
          "Track 4: Technical Sales/Pre-Sales - Leverage existing sales skills + tech knowledge",
          "Domain Leverage: How your previous industry experience becomes an ASSET",
          "Career Positioning: 'X years in [your field] + new tech skills = Unique Value'"
        ],
        outcomes: [
          "Specialized skills in high-demand tech area",
          "Portfolio projects relevant to your chosen specialization",
          "Understanding of how to position your previous experience as strength",
          "Industry-relevant tools and technologies",
          "Ready for job search in your chosen tech field",
          "Clear career path and salary expectations"
        ],
        icon: "TrendingUp"
      },
      {
        phase: "Step 4: Job Search & Placement Support",
        title: "Land Your First Tech Job",
        duration: "2-4 months",
        description: "We don't just teach you tech skills - we help you get hired. Resume building, interview preparation, and leveraging your unique background as a career switcher.",
        topics: [
          "Resume Building: Tech Resume, LinkedIn Optimization, Cover Letters",
          "Interview Preparation: Technical + Behavioral Questions",
          "Career Switcher Positioning: How to explain your career change effectively",
          "Leverage Previous Experience: Domain knowledge as competitive advantage",
          "Salary Negotiation: Market rates, benefits, offer evaluation",
          "Placement Support: Lifetime assistance until you get hired"
        ],
        outcomes: [
          "Professional tech resume and LinkedIn profile",
          "Confidence in technical and behavioral interviews",
          "Effective career switch story and positioning",
          "Network in tech industry relevant to your background",
          "Multiple interview opportunities and job offers",
          "First tech job placement with competitive salary"
        ],
        icon: "Award"
      },
      {
        phase: "Step 5: Career Growth & Success",
        title: "Thrive in Your New Tech Career",
        duration: "Ongoing",
        description: "Your journey doesn't end at placement. We provide continuous support to help you grow in your new tech career and become a successful professional.",
        topics: [
          "First 90 Days Success: How to excel in your new tech role",
          "Continuous Learning: Stay updated with tech trends",
          "Career Advancement: From junior to mid-level to senior roles",
          "Alumni Network: Connect with 800+ successful career switchers",
          "Mentorship: Ongoing guidance from industry professionals",
          "Skill Upgradation: Advanced certifications and specializations"
        ],
        outcomes: [
          "Successful transition into tech workplace culture",
          "Continuous learning and skill development habits",
          "Career growth path and advancement opportunities",
          "Strong professional network in tech industry",
          "Long-term career satisfaction and success",
          "Become a mentor for future career switchers"
        ],
        icon: "Users"
      }
    ],
    successStories: [
      {
        name: "Meera Desai",
        previousRole: "HR Manager (5 years)",
        newRole: "People Analytics Specialist",
        salaryIncrease: "₹6LPA → ₹8LPA",
        duration: "11 months journey",
        testimonial: "I was managing people analytics data in Excel. I realized I loved the data part more than the people part. I wanted to build tools, not just use them. I positioned myself as 'HR + Data' specialist. My HR domain knowledge became an advantage, not a liability.",
        rating: 5
      },
      {
        name: "Amit Verma",
        previousRole: "Operations Lead (10 years)",
        newRole: "QA Engineer",
        salaryIncrease: "₹4.5LPA → ₹6.5LPA",
        duration: "11 months journey",
        testimonial: "Operations work was physically demanding and had no growth. At 35, I was competing with 23-year-olds, but my operations experience—attention to detail, process thinking—became my strength. Startups in logistics domain loved that I understood their business.",
        rating: 5
      },
      {
        name: "Priya Srinivasan",
        previousRole: "Financial Analyst (8 years)",
        newRole: "Financial Data Analyst",
        salaryIncrease: "₹7LPA → ₹11LPA",
        duration: "7 months journey",
        testimonial: "I was already doing analysis in Excel. I wanted to level up my skills—learn Python, automation, visualization. I didn't abandon my finance knowledge. I enhanced it with data skills. Now I'm a financial expert who can code—very valuable combination.",
        rating: 5
      },
      {
        name: "Rahul Khanna",
        previousRole: "Digital Marketing (4 years)",
        newRole: "Technical Content Writer",
        salaryIncrease: "₹5LPA → ₹9LPA",
        duration: "9 months journey",
        testimonial: "Marketing felt too fluffy. I wanted something more tangible. Midway through development track, I realized I enjoyed explaining tech more than building. Found my niche: Technical Marketing. My marketing skills + technical knowledge = perfect combination.",
        rating: 4
      },
      {
        name: "Neha Kapoor",
        previousRole: "Senior Backend Engineer (7 years)",
        newRole: "MLOps Engineer",
        salaryIncrease: "₹16LPA → ₹28LPA",
        duration: "5 months journey",
        testimonial: "I saw AI boom coming but didn't know where I fit. Data science? Too math-heavy. Pure development? Too saturated. MLOps was perfect—engineering + ML. I leverage my 7 years of backend/DevOps experience and apply it to ML systems. Best career move ever.",
        rating: 5
      },
      {
        name: "Arjun Nair",
        previousRole: "Senior Java Developer (8 years)",
        newRole: "Solutions Architect",
        salaryIncrease: "₹14LPA → ₹24LPA",
        duration: "7 months journey",
        testimonial: "I was a great coder, but that wasn't enough for architect roles. Sudaksha taught me to think at system level, communicate architecture decisions, and lead technical discussions. The capstone project became my portfolio piece—I walked into interviews with complete architecture design I could defend.",
        rating: 5
      }
    ],
    programFeatures: [
      {
        title: "Free Career Assessment",
        description: "30-minute online assessment + 45-minute one-on-one counseling with career experts (not sales people)",
        icon: "Target",
        included: true
      },
      {
        title: "3-Month Foundation Program",
        description: "120 hours of intensive training from zero to tech-ready. Extremely slow-paced for non-tech backgrounds",
        icon: "Code",
        included: true
      },
      {
        title: "4 Specialization Tracks",
        description: "Software Development (60%), Data Analytics (25%), QA/Testing (15%), Technical Sales (Leverage existing skills)",
        icon: "TrendingUp",
        included: true
      },
      {
        title: "Domain Leverage Strategy",
        description: "We teach you how to position your previous industry experience as a competitive advantage, not a liability",
        icon: "Users",
        included: true
      },
      {
        title: "Lifetime Placement Support",
        description: "Resume building, interview preparation, salary negotiation. We support you until you get hired",
        icon: "Award",
        included: true
      },
      {
        title: "Alumni Network (800+ Strong)",
        description: "Connect with successful career switchers for mentorship, job referrals, and continuous learning",
        icon: "Users",
        included: true
      },
      {
        title: "Flexible Payment Options",
        description: "EMI available (₹7,000-9,000/month), Pay After Placement, or split payment options",
        icon: "Clock",
        included: true
      },
      {
        title: "Realistic Success Metrics",
        description: "60% overall placement rate. We're honest about your chances rather than making false promises",
        icon: "Target",
        included: true
      },
      {
        title: "Money-Back Guarantee",
        description: "100% refund if you complete foundation program and we don't think you'll succeed in tech",
        icon: "TrendingUp",
        included: false
      }
    ],
    cta: {
      text: "Start Your Career Switch",
      href: "#counseling"
    }
  }
};

export default function IndividualsPage() {
  const handleAudienceSelect = (audienceId: string) => {
    // Scroll to relevant section based on audience selection
    const element = document.getElementById(audienceId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <IndividualsHero data={mockData.hero} />
      <AudienceSelector
        data={mockData.audienceSelector}
        onAudienceSelect={handleAudienceSelect}
      />
      <div id="programs">
        <ProgramShowcase data={mockData.programShowcase} />
      </div>
      <ProgramComparison data={mockData.programComparison} />

      {/* Placeholder for Section 2: Working Professionals Deep-Dive */}
      <section id="professionals" className="py-12 bg-white">
        <ProfessionalsHero data={mockData.professionalsHero} />
        <CareerTransitions data={mockData.careerTransitions} />
        <LeadershipPrograms data={mockData.leadershipPrograms} />
      </section>

      {/* Section 3: Career Switchers Complete Journey */}
      <section id="switchers" className="py-16 bg-white">
        <CareerSwitchersHero data={mockData.careerSwitchersHero} />
        <CareerSwitchersJourney data={mockData.careerSwitchersJourney} />
      </section>
    </div>
  );
}
