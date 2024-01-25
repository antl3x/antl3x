import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";


export const RESUME_DATA = {
  name: "Antonio Moura",
  initials: "AM",
  location: "Salt Lake City, UT, United States",
  locationLink: "https://www.google.com/maps/place/Salt+Lake+City,+UT",
  about:
    "Seasoned Software Engineer, Hands-on CTO, and Quant Trading Enthusiast with over 10 years in the tech industry.",
  summary: "As a Software Engineer with experience as a founder and Head of Engineering, I specialize in developing and improving SaaS products for B2B and B2C markets. Passionate about open source software, I advocate for collaborative development to drive innovation and effective solutions.",
  avatarUrl: "/me-light.png",
  personalWebsiteUrl: "https://antl3x.co",
  contact: {
    email: "antonio@antl3x.co",
    tel: null,
    social: [
      {
        name: "GitHub",
        url: "https://github.com/antl3x",
        icon: GitHubIcon,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/antl3x/",
        icon: LinkedInIcon,
      },
      {
        name: "X",
        url: "https://x.com/antl3x",
        icon: XIcon,
      },
    ],
  },
  education: [
    {
      school: "Insper Institute of Education and Research",
      link: "https://www.insper.edu.br/en/",
      degree: "Master's Degree in Executive Finance",
      start: "2020",
      end: "2022",
    },
    
    {
      school: "Sao Paulo University of Computer Science and Administration (FIAP)",
      link: "https://www.fiap.com.br/",
      degree: "Bachelor's Degree in Software Engineering & IT Management",
      start: "2018",
      end: "2020",
    },

  ],
  work: [
    {
      company: "Linte",
      link: "https://linte.com",
      badges: ["B2B"],
      title: "Head of Engineering",
      start: "2018",
      end: "Current",
      description:[
        "Led engineering for a top legaltech in LatAm, servicing clients like Accenture, Renault, Siemens.",
        "Orchestrated AWS to Google Cloud transition, adopting Kubernetes + monorepo for improved efficiency.",
        "Developed a monorepo workflow and enhanced hiring practices for SOC-2 compliance readiness."
      ]
    },
    {
      company: "Drafteam",
      link: "https://drafteam.com",
      badges: ["B2C"],
      title: "Founder / CTO",
      start: "2016",
      end: "2018",
      description: [
        "Co-founded a successful multi-sport fantasy game startup incubated by Google Campus Residency, ranking third in the US and second in Brazil.",
        "Managed engineering team to design and implement robust cloud infrastructure on Google Cloud Platform.",
        "Achieved 3.8 million daily entries, leveraging TypeScript, React, NodeJS, and BigQuery."
      ]
    },
    {
      company: "Blu365",
      link: "https://blue365.com.br/",
      badges: ["B2B", "B2C"],
      title: "Technical Lead @ Analytics",
      start: "2015",
      end: "2016",
      description:[
          "Led the Growth & Analytics, designing real-time services integrating AWS RedShift, DynamoDB, Aurora.",
          "Spearheaded API integration with Banco Itáu, boosting debt collection deals by 20%, significantly increasing revenue."
        ]
    }
  ],
  skills: [
    "TypeScript",
    "Python",
    "Node.js",
    "GCP / AWS",
    "Kubernetes",
    "React/Next.js/Remix",
    "Svelte",
    "GraphQL",
    "WebRTC",
    "Functional Programming"
  ],
  projects: [
    {
      title: "codePlot",
      techStack: [
        "Spatial Interfaces",
        "Python",
        "TypeScript / NodeJS",
        "React",
        "Vite",
        "Websockets",
      ],
      description: "An innovative, interactive canvas for dynamic, code-driven data visualization and exploration, seamlessly integrating with IDEs and Jupyter notebooks.",
      link: {
        label: "codePlot",
        href: "https://github.com/codePlot-co/codePlot",
      },
    },
    {
      title: "super-ts",
      techStack: [
        "NPM Package",
        "TypeScript",
        "Functional Programming",
        "Algebraic Data Types",
        "Runtime Type Checking",
      ],
      description: "super-ts is a Typescript functional programming library inspired by Haskell and PureScript providing both runtime type checking and functional algebraic data types.",
      link: {
        label: "super-ts",
        href: "https://github.com/antl3x/super-ts",
      },
    },
  ],
} as const;
