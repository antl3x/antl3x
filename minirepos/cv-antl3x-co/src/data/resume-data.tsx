import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { title } from "process";

export const RESUME_DATA = {
  name: "Antonio Moura",
  initials: "AM",
  location: "Salt Lake City, UT, United States",
  locationLink: "https://www.google.com/maps/place/Salt+Lake+City,+UT",
  about:
    "Seasoned Software Engineer and hands-on Tech Leader with over 14 years of experience in software development.",
  summary:
    "I'm a Software Engineer who has founded companies and led engineering teams. I love building products that serve people. Open source is one of my passions – I believe collaborative development is the key to driving great innovations and powerful solutions.",
  avatarUrl: "/me-light.jpg",
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
      school:
        "Sao Paulo University of Computer Science and Administration (FIAP)",
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
      description: [
        "Led engineering team to deliver Document Automation & Digital Signing platform to Fortune 500 clients.",
        "Slashed infra costs by driving AWS → Google Cloud Platform move and boosted team efficiency with Kubernetes adoption.",
        "Architected & led delivery of GraphQL/TypeScript/PostgreSQL backend, slashing API latency by 40%.",
        "Pioneered TypeScript migration, dramatically reducing runtime errors & enhancing DX.",
      ],
    },
    {
      company: "Drafteam",
      link: "https://drafteam.com",
      badges: ["B2C"],
      title: "Head of Engineering & Co-Founder",
      start: "2016",
      end: "2018",
      description: [
        "Developed a highly scalable event-driven serverless architecture using NodeJS/Typescript and Kubernetes.",
        "Delivered a feature-rich mobile app using React Native and Cloud Firestore, achieving a 4.8-star rating and 100K+ downloads.",
        "Implemented a GitOps workflow with Cloud Build and Github Actions, enabling CICD and reducing release cycles by 50%.",
        "Optimized data pipelines with Cloud Pub/Sub and Cloud Functions, reducing processing times by 60%.",
      ],
    },
    {
      company: "Blu365",
      link: "https://blue365.com.br/",
      badges: ["B2B", "B2C"],
      title: "Senior Software Engineer",
      start: "2014",
      end: "2016",
      description: [
        "Pioneered the use of AWS Lambda and Step Functions, reducing infrastructure costs by 30% and enabling seamless scalability",
        "Spearheaded API integration with Banco Itáu, boosting debt collection deals by 20%, significantly increasing revenue.",
        "Implemented a serverless event-driven architecture using SNS and SQS, reducing latency by 40% and enhancing fault-tolerance.",
      ],
    },
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
    "Functional Programming",
  ],
  projects: [
    {
      title: "codeplot",
      techStack: [
        "Spatial Interfaces",
        "Python",
        "TypeScript / NodeJS",
        "React",
        "Vite",
        "Websockets",
      ],
      description:
        "An innovative, interactive canvas for dynamic, code-driven data visualization and exploration, seamlessly integrating with IDEs and Jupyter notebooks.",
      link: {
        label: "codeplot",
        href: "https://github.com/codeplot-co/codeplot",
      },
    },
    {
      title: "learnpolars.co",
      techStack: ["TypeScript", "NextJS", "Vite", "Tailwind CSS", "MDX"],
      description:
        "A platform for learning data science with Polars, a blazingly fast Python DataFrame library, providing interactive code examples and tutorials.",
      link: {
        label: "learnpolars.co",
        href: "https://learnpolars.co",
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
      description:
        "super-ts is a Typescript functional programming library inspired by Haskell and PureScript providing both runtime type checking and functional algebraic data types.",
      link: {
        label: "super-ts",
        href: "https://github.com/antl3x/super-ts",
      },
    },
    {
      title: "func",
      techStack: ["NPM Package", "TypeScript", "Runtime Type Checking"],
      description:
        "func is a lightweight JavaScript/TypeScript micro-library that simplifies function creation with run-time argument validation and parsing using the powerful `zod` library.",
      link: {
        label: "func",
        href: "https://github.com/antl3x/antl3x/tree/master/minirepos/func",
      },
    },
  ],
} as const;
