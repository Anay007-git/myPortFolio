// Portfolio Data - Anay Biswas
export const portfolioData = {
    personal: {
        name: "Anay Biswas",
        title: "Sr. Business Intelligence Developer",
        location: "Kolkata",
        phone: "9804239301",
        email: "biswasanay07@gmail.com",
        summary: `With over 3.5 years of experience in business intelligence and data analytics, I have spearheaded the design and development of robust BI solutions, driving data-driven decision-making and optimizing data models. Skilled in Tableau, SQL, Python, and AWS, I have significantly improved reporting efficiency and enhanced data visibility across teams, contributing to strategic business initiatives.`
    },

    links: {
        linkedin: "https://linkedin.com/in/anay-biswas-a27573134",
        github: "https://github.com/Anay007-git",
        twitter: "https://twitter.com/anaybiswas1",
        project: "https://github.com/Anay007-git/nyc-311-customer-service-request-analysis-python-project"
    },

    skills: {
        "Languages & Tools": ["Python", "Excel", "Tableau", "PostgreSQL", "AWS", "AppFlow", "S3", "RDS"],
        "Data Science": ["NumPy", "Pandas", "scikit-learn", "Matplotlib", "Streamlit"],
        "Analysis": ["Business Requirements Analysis", "BRD/FRD/DFD/SRS"],
        "Methodologies": ["Agile", "Scrum", "Sprint Planning"],
        "AI Tools": ["ChatGPT API", "Gemini API", "Claude API"]
    },

    experience: [
        {
            company: "Lux Industries Limited",
            location: "Kolkata",
            role: "Senior BI Developer",
            type: "Full-time",
            duration: "05/2025 - Present",
            description: "Lux Industries Limited is one of India's largest innerwear manufacturers, known for 'Lux Cozi' brand with presence in 45+ countries.",
            highlights: [
                "Drive data-driven decision-making across sales, supply chain, finance, and marketing",
                "Design dynamic Tableau dashboards for real-time KPI tracking",
                "Develop and optimize complex SQL queries for reporting and ETL",
                "Automate data workflows using Python with predictive analytics",
                "Build scalable AWS pipelines using S3, Glue, AppFlow, and RDS"
            ]
        },
        {
            company: "Vedant Fashions Limited",
            location: "Kolkata",
            role: "IT Business Analyst",
            type: "Full-time",
            duration: "12/2022 - 04/2025",
            description: "Leading fashion retail company",
            highlights: [
                "Collaborate with stakeholders to translate business needs into technical requirements",
                "Document business requirements, functional specifications, and project plans",
                "Identify and prioritize features for software development projects",
                "Conduct research and analysis to support decision-making",
                "Work with project managers for timely and budget-aligned delivery"
            ]
        },
        {
            company: "Wyzmindz Solutions",
            location: "Bengaluru",
            role: "Business Analyst",
            type: "Full-time",
            duration: "12/2021 - 11/2022",
            description: "Technology solutions company",
            highlights: [
                "Prepared and curated data for CRM project implementation",
                "Created dashboard reports to track sales and conversion rates",
                "Used Python for data analysis, visualization, and research automation",
                "Leveraged SQL for querying databases and managing large datasets"
            ]
        },
        {
            company: "State Bank of India",
            location: "Kolkata",
            role: "Financial Analyst Intern",
            type: "Internship",
            duration: "05/2020 - 07/2020",
            description: "India's largest public sector bank",
            highlights: [
                "Documented processes to support auditing",
                "Analyzed financial data to determine current financial condition",
                "Created Excel dashboards and managed CRM using Microsoft Dynamics 365",
                "Assisted customers with SBI YONO banking platform"
            ]
        }
    ],

    education: [
        {
            degree: "MBA in Finance and Marketing",
            institution: "Amity University, Kolkata",
            duration: "01/2019 - 01/2021"
        },
        {
            degree: "BE",
            institution: "NSHM Knowledge Campus, Kolkata",
            duration: "01/2015 - 01/2018"
        },
        {
            degree: "Higher Secondary",
            institution: "Netaji Shikshayatan, Kolkata",
            duration: "01/2013 - 01/2014"
        }
    ],

    certifications: [
        {
            name: "Data Science Master Program",
            provider: "Simplilearn",
            date: "07/2022 - Present"
        }
    ],

    projects: [
        {
            name: "NYC 311 Customer Service Request Analysis",
            description: "Python-based data analysis project analyzing NYC 311 service requests to derive insights and improve customer service operations.",
            tech: ["Python", "Pandas", "Data Analysis", "Visualization"],
            link: "https://github.com/Anay007-git/nyc-311-customer-service-request-analysis-python-project"
        }
    ]
};

// Zone configurations for the 3D world
export const zoneConfig = [
    {
        id: 'about',
        name: 'About Me',
        icon: '👤',
        color: 0xff4081, // Pink
        position: { x: 0, z: -400 },
        description: "Who am I?"
    },
    {
        id: 'experience',
        name: 'Experience',
        icon: '💼',
        color: 0x00bcd4, // Cyan
        position: { x: -400, z: 0 },
        description: "My Career Journey"
    },
    {
        id: 'skills',
        name: 'Skills',
        icon: '🛠️',
        color: 0xffeb3b, // Yellow
        position: { x: 400, z: 0 },
        description: "Tech Stack"
    },
    {
        id: 'contact',
        name: 'Contact',
        icon: '✉️',
        color: 0x4caf50, // Green
        position: { x: 0, z: 400 },
        description: "Get in Touch"
    },
    {
        id: 'education',
        name: 'Education',
        icon: '🎓',
        position: { x: 0, z: -25 },
        color: 0xec4899
    },
    {
        id: 'contact',
        name: 'Contact',
        icon: '📧',
        position: { x: 0, z: 25 },
        color: 0xef4444
    }
];
