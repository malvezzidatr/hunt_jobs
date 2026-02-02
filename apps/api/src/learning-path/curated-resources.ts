// Recursos curados e verificados para cada tecnologia
// Priorizando conteúdo em português e gratuito

export interface CuratedResource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'course' | 'article' | 'practice';
  free: boolean;
}

export const curatedResources: Record<string, CuratedResource[]> = {
  // Frontend
  react: [
    { title: 'Documentação oficial do React', url: 'https://react.dev/learn', type: 'docs', free: true },
    { title: 'React - Formação Rocketseat', url: 'https://www.rocketseat.com.br/formacao/react', type: 'course', free: true },
    { title: 'React Tutorial - React.dev', url: 'https://react.dev/learn/tutorial-tic-tac-toe', type: 'course', free: true },
    { title: 'Exercícios React - Frontend Mentor', url: 'https://www.frontendmentor.io/challenges?technologies=react', type: 'practice', free: true },
  ],
  javascript: [
    { title: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide', type: 'docs', free: true },
    { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'docs', free: true },
    { title: 'Curso JavaScript - Curso em Vídeo', url: 'https://www.cursoemvideo.com/curso/javascript/', type: 'video', free: true },
    { title: 'Exercism - JavaScript Track', url: 'https://exercism.org/tracks/javascript', type: 'practice', free: true },
  ],
  typescript: [
    { title: 'Documentação TypeScript', url: 'https://www.typescriptlang.org/docs/', type: 'docs', free: true },
    { title: 'TypeScript Handbook (PT-BR)', url: 'https://www.typescriptlang.org/pt/docs/handbook/', type: 'docs', free: true },
    { title: 'Total TypeScript - Beginners', url: 'https://www.totaltypescript.com/tutorials/beginners-typescript', type: 'course', free: true },
    { title: 'Type Challenges', url: 'https://github.com/type-challenges/type-challenges', type: 'practice', free: true },
  ],
  html: [
    { title: 'MDN - HTML', url: 'https://developer.mozilla.org/pt-BR/docs/Web/HTML', type: 'docs', free: true },
    { title: 'Curso HTML5 - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n', type: 'video', free: true },
    { title: 'W3Schools HTML', url: 'https://www.w3schools.com/html/', type: 'docs', free: true },
  ],
  css: [
    { title: 'MDN - CSS', url: 'https://developer.mozilla.org/pt-BR/docs/Web/CSS', type: 'docs', free: true },
    { title: 'Curso CSS3 - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n', type: 'video', free: true },
    { title: 'CSS Tricks', url: 'https://css-tricks.com/', type: 'article', free: true },
    { title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/#pt-br', type: 'practice', free: true },
  ],
  tailwindcss: [
    { title: 'Documentação Tailwind CSS', url: 'https://tailwindcss.com/docs', type: 'docs', free: true },
    { title: 'Tailwind CSS - Rocketseat', url: 'https://www.youtube.com/watch?v=1eLaBow7Zbo', type: 'video', free: true },
    { title: 'Tailwind Components', url: 'https://tailwindcomponents.com/', type: 'practice', free: true },
  ],
  nextjs: [
    { title: 'Documentação Next.js', url: 'https://nextjs.org/docs', type: 'docs', free: true },
    { title: 'Learn Next.js - Curso Oficial', url: 'https://nextjs.org/learn', type: 'course', free: true },
    { title: 'Next.js App Router - Vercel', url: 'https://nextjs.org/learn/dashboard-app', type: 'course', free: true },
  ],
  vue: [
    { title: 'Documentação Vue.js', url: 'https://vuejs.org/guide/introduction.html', type: 'docs', free: true },
    { title: 'Vue.js Brasil', url: 'https://www.youtube.com/@VuejsBrasil', type: 'video', free: true },
    { title: 'Vue Mastery - Intro', url: 'https://www.vuemastery.com/courses/intro-to-vue-3/intro-to-vue3', type: 'course', free: true },
  ],
  angular: [
    { title: 'Documentação Angular', url: 'https://angular.dev/overview', type: 'docs', free: true },
    { title: 'Angular - Loiane Groner', url: 'https://loiane.training/curso/angular', type: 'course', free: true },
    { title: 'Tutorial Angular', url: 'https://angular.dev/tutorials', type: 'course', free: true },
  ],

  // Backend
  nodejs: [
    { title: 'Documentação Node.js', url: 'https://nodejs.org/docs/latest/api/', type: 'docs', free: true },
    { title: 'Node.js - Formação Rocketseat', url: 'https://www.rocketseat.com.br/formacao/node-js', type: 'course', free: true },
    { title: 'Node.js - The Odin Project', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs', type: 'course', free: true },
  ],
  nestjs: [
    { title: 'Documentação NestJS', url: 'https://docs.nestjs.com/', type: 'docs', free: true },
    { title: 'NestJS Crash Course - Traversy Media', url: 'https://www.youtube.com/watch?v=2n3xS89TJMI', type: 'video', free: true },
    { title: 'NestJS Fundamentals', url: 'https://courses.nestjs.com/', type: 'course', free: true },
  ],
  express: [
    { title: 'Documentação Express', url: 'https://expressjs.com/pt-br/', type: 'docs', free: true },
    { title: 'Express - MDN', url: 'https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs', type: 'docs', free: true },
  ],
  python: [
    { title: 'Documentação Python (PT-BR)', url: 'https://docs.python.org/pt-br/3/', type: 'docs', free: true },
    { title: 'Python - Curso em Vídeo', url: 'https://www.cursoemvideo.com/curso/python-3-mundo-1/', type: 'video', free: true },
    { title: 'Python Tutorial - W3Schools', url: 'https://www.w3schools.com/python/', type: 'docs', free: true },
    { title: 'Exercism - Python Track', url: 'https://exercism.org/tracks/python', type: 'practice', free: true },
  ],
  django: [
    { title: 'Documentação Django (PT-BR)', url: 'https://docs.djangoproject.com/pt-br/', type: 'docs', free: true },
    { title: 'Django Girls Tutorial', url: 'https://tutorial.djangogirls.org/pt/', type: 'course', free: true },
  ],
  java: [
    { title: 'Dev.java - Oracle', url: 'https://dev.java/learn/', type: 'docs', free: true },
    { title: 'Java - Loiane Groner', url: 'https://loiane.training/curso/java-basico', type: 'course', free: true },
    { title: 'Java Tutorial - W3Schools', url: 'https://www.w3schools.com/java/', type: 'docs', free: true },
    { title: 'Exercism - Java Track', url: 'https://exercism.org/tracks/java', type: 'practice', free: true },
  ],
  spring: [
    { title: 'Spring Guides', url: 'https://spring.io/guides', type: 'docs', free: true },
    { title: 'Spring Academy', url: 'https://spring.academy/', type: 'course', free: true },
    { title: 'Spring Boot - Fernanda Kipper', url: 'https://www.youtube.com/watch?v=lUVureR5GqI', type: 'video', free: true },
  ],
  csharp: [
    { title: 'Documentação C# Microsoft', url: 'https://learn.microsoft.com/pt-br/dotnet/csharp/', type: 'docs', free: true },
    { title: 'C# - Balta.io', url: 'https://www.youtube.com/playlist?list=PLHlHvK2lnJndvvycjBqzAbdmDojKzaia0', type: 'video', free: true },
  ],
  dotnet: [
    { title: 'Documentação .NET', url: 'https://learn.microsoft.com/pt-br/dotnet/', type: 'docs', free: true },
    { title: '.NET - Balta.io', url: 'https://www.youtube.com/c/baltaborges', type: 'video', free: true },
  ],
  php: [
    { title: 'Documentação PHP', url: 'https://www.php.net/manual/pt_BR/', type: 'docs', free: true },
    { title: 'PHP - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkqe2aR0tQK74m8SFWmyTHn', type: 'video', free: true },
  ],
  laravel: [
    { title: 'Documentação Laravel', url: 'https://laravel.com/docs', type: 'docs', free: true },
    { title: 'Laravel - Especializa Ti', url: 'https://www.youtube.com/playlist?list=PLVSNL1PHDWvQBtcH_4VR82Dg-aFiVOZBY', type: 'video', free: true },
  ],
  go: [
    { title: 'Go by Example', url: 'https://gobyexample.com/', type: 'docs', free: true },
    { title: 'Go - Aprenda Go', url: 'https://www.youtube.com/playlist?list=PLCKpcjBB_VlBsxJ9IseNxFllf-UFEXOdg', type: 'video', free: true },
    { title: 'Tour of Go', url: 'https://go.dev/tour/', type: 'course', free: true },
  ],
  ruby: [
    { title: 'Ruby em 20 minutos', url: 'https://www.ruby-lang.org/pt/documentation/quickstart/', type: 'docs', free: true },
    { title: 'Try Ruby', url: 'https://try.ruby-lang.org/', type: 'practice', free: true },
  ],
  rails: [
    { title: 'Rails Guides', url: 'https://guides.rubyonrails.org/', type: 'docs', free: true },
    { title: 'GoRails', url: 'https://gorails.com/episodes', type: 'video', free: true },
  ],

  // Banco de dados
  postgresql: [
    { title: 'Documentação PostgreSQL', url: 'https://www.postgresql.org/docs/', type: 'docs', free: true },
    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'course', free: true },
  ],
  mysql: [
    { title: 'MySQL - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkBs-795Dsgvau_ekxg8g1r', type: 'video', free: true },
    { title: 'Documentação MySQL', url: 'https://dev.mysql.com/doc/', type: 'docs', free: true },
  ],
  mongodb: [
    { title: 'MongoDB University', url: 'https://learn.mongodb.com/', type: 'course', free: true },
    { title: 'Documentação MongoDB', url: 'https://www.mongodb.com/docs/', type: 'docs', free: true },
  ],
  redis: [
    { title: 'Redis University', url: 'https://university.redis.com/', type: 'course', free: true },
    { title: 'Documentação Redis', url: 'https://redis.io/docs/', type: 'docs', free: true },
  ],
  sql: [
    { title: 'SQL - W3Schools', url: 'https://www.w3schools.com/sql/', type: 'docs', free: true },
    { title: 'SQL - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkBs-795Dsgvau_ekxg8g1r', type: 'video', free: true },
    { title: 'SQLBolt', url: 'https://sqlbolt.com/', type: 'practice', free: true },
  ],
  prisma: [
    { title: 'Documentação Prisma', url: 'https://www.prisma.io/docs', type: 'docs', free: true },
    { title: 'Prisma - Rocketseat', url: 'https://www.youtube.com/watch?v=RebA5J-rlwg', type: 'video', free: true },
  ],

  // Mobile
  'react native': [
    { title: 'Documentação React Native', url: 'https://reactnative.dev/docs/getting-started', type: 'docs', free: true },
    { title: 'React Native - Rocketseat', url: 'https://app.rocketseat.com.br/discover/course/especializar-react-native', type: 'course', free: true },
  ],
  flutter: [
    { title: 'Documentação Flutter', url: 'https://docs.flutter.dev/', type: 'docs', free: true },
    { title: 'Flutter - Flutterando', url: 'https://www.youtube.com/@Flutterando', type: 'video', free: true },
  ],
  kotlin: [
    { title: 'Documentação Kotlin', url: 'https://kotlinlang.org/docs/home.html', type: 'docs', free: true },
    { title: 'Android com Kotlin - Google', url: 'https://developer.android.com/courses/android-basics-kotlin/course', type: 'course', free: true },
  ],
  swift: [
    { title: 'Swift.org', url: 'https://www.swift.org/documentation/', type: 'docs', free: true },
    { title: 'Hacking with Swift', url: 'https://www.hackingwithswift.com/', type: 'course', free: true },
  ],

  // DevOps & Cloud
  docker: [
    { title: 'Documentação Docker', url: 'https://docs.docker.com/get-started/', type: 'docs', free: true },
    { title: 'Docker em 22 minutos - Código Fonte TV', url: 'https://www.youtube.com/watch?v=Kzcz-EVKBEQ', type: 'video', free: true },
    { title: 'Descomplicando Docker - LINUXtips', url: 'https://www.youtube.com/playlist?list=PLf-O3X2-mxDn1VpyU2q3fuI6YYeIWp5rR', type: 'video', free: true },
    { title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', type: 'practice', free: true },
  ],
  kubernetes: [
    { title: 'Documentação Kubernetes (PT-BR)', url: 'https://kubernetes.io/pt-br/docs/home/', type: 'docs', free: true },
    { title: 'Descomplicando Kubernetes - LINUXtips', url: 'https://www.youtube.com/playlist?list=PLf-O3X2-mxDmXQU-mJVgeaSL7Rtejvv0S', type: 'video', free: true },
    { title: 'Kubernetes Tutorial - TechWorld with Nana', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'video', free: true },
  ],
  aws: [
    { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', type: 'course', free: true },
    { title: 'AWS - Documentação', url: 'https://docs.aws.amazon.com/', type: 'docs', free: true },
    { title: 'AWS para Iniciantes - Código Fonte TV', url: 'https://www.youtube.com/watch?v=j6yImUdkWwA', type: 'video', free: true },
  ],
  azure: [
    { title: 'Microsoft Learn - Azure', url: 'https://learn.microsoft.com/pt-br/training/azure/', type: 'course', free: true },
    { title: 'Azure Fundamentals - Microsoft', url: 'https://learn.microsoft.com/pt-br/certifications/azure-fundamentals/', type: 'course', free: true },
  ],
  linux: [
    { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'course', free: true },
    { title: 'Guia Foca Linux', url: 'https://guiafoca.org/', type: 'docs', free: true },
    { title: 'Linux - Diolinux', url: 'https://www.youtube.com/@Diolinux', type: 'video', free: true },
  ],
  git: [
    { title: 'Git - Documentação Oficial (PT-BR)', url: 'https://git-scm.com/book/pt-br/v2', type: 'docs', free: true },
    { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/?locale=pt_BR', type: 'practice', free: true },
    { title: 'Git e GitHub - Rafaella Ballerini', url: 'https://www.youtube.com/watch?v=DqTITcMq68k', type: 'video', free: true },
  ],
  github: [
    { title: 'GitHub Skills', url: 'https://skills.github.com/', type: 'course', free: true },
    { title: 'GitHub Docs', url: 'https://docs.github.com/pt', type: 'docs', free: true },
    { title: 'Git e GitHub - Rafaella Ballerini', url: 'https://www.youtube.com/watch?v=DqTITcMq68k', type: 'video', free: true },
  ],

  // Testes
  jest: [
    { title: 'Documentação Jest', url: 'https://jestjs.io/pt-BR/docs/getting-started', type: 'docs', free: true },
    { title: 'Testes com Jest - Rocketseat', url: 'https://www.youtube.com/watch?v=MTWV96k0RKc', type: 'video', free: true },
  ],
  cypress: [
    { title: 'Documentação Cypress', url: 'https://docs.cypress.io/', type: 'docs', free: true },
    { title: 'Cypress - Agilizei', url: 'https://www.youtube.com/playlist?list=PLnUo-Rbc3jjztMO4K8b-px4NE-630VNKY', type: 'video', free: true },
  ],

  // APIs
  'api rest': [
    { title: 'REST API Tutorial', url: 'https://restfulapi.net/', type: 'docs', free: true },
    { title: 'API REST - Rocketseat', url: 'https://www.youtube.com/watch?v=ghTrp1x_1As', type: 'video', free: true },
  ],
  graphql: [
    { title: 'Documentação GraphQL', url: 'https://graphql.org/learn/', type: 'docs', free: true },
    { title: 'GraphQL - Rocketseat', url: 'https://www.youtube.com/watch?v=7RoHxSGVAdU', type: 'video', free: true },
  ],

  // Outros
  agile: [
    { title: 'Scrum Guide (PT-BR)', url: 'https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-PortugueseBR.pdf', type: 'docs', free: true },
    { title: 'Métodos Ágeis - Alura', url: 'https://www.alura.com.br/artigos/o-que-e-metodologia-agil', type: 'article', free: true },
  ],
  'data structures': [
    { title: 'Estrutura de Dados - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dkqrx3_oXEGVIx8i7SBbNRF', type: 'video', free: true },
    { title: 'Visualgo', url: 'https://visualgo.net/pt', type: 'practice', free: true },
  ],
  algorithms: [
    { title: 'Algoritmos - Curso em Vídeo', url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV', type: 'video', free: true },
    { title: 'LeetCode', url: 'https://leetcode.com/', type: 'practice', free: true },
    { title: 'HackerRank', url: 'https://www.hackerrank.com/', type: 'practice', free: true },
  ],
};

// Aliases para normalizar nomes de tecnologias
export const techAliases: Record<string, string> = {
  // Node/JS ecosystem
  'node.js': 'nodejs',
  'node': 'nodejs',
  'nest.js': 'nestjs',
  'nest': 'nestjs',
  'next.js': 'nextjs',
  'next': 'nextjs',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'react.js': 'react',
  'reactjs': 'react',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'ts': 'typescript',
  'js': 'javascript',

  // CSS
  'tailwind': 'tailwindcss',
  'tailwind css': 'tailwindcss',

  // Databases
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'banco de dados relacional': 'postgresql',
  'banco de dados': 'sql',
  'database': 'sql',
  'relational database': 'postgresql',

  // .NET ecosystem
  'c#': 'csharp',
  '.net': 'dotnet',
  'asp.net': 'dotnet',
  '.net core': 'dotnet',

  // Java ecosystem
  'spring boot': 'spring',
  'springboot': 'spring',

  // Ruby
  'ruby on rails': 'rails',
  'ror': 'rails',

  // Mobile
  'rn': 'react native',
  'reactnative': 'react native',
  'desenvolvimento mobile': 'react native',
  'desenvolvimento de aplicativos mobile': 'react native',
  'mobile development': 'react native',
  'android': 'kotlin',
  'ios': 'swift',

  // Python
  'py': 'python',

  // APIs
  'rest': 'api rest',
  'restful': 'api rest',
  'api restful': 'api rest',
  'apis restful': 'api rest',
  'desenvolvimento de apis': 'api rest',

  // Testing
  'testes automatizados': 'jest',
  'testes unitários': 'jest',
  'automated testing': 'jest',
  'unit testing': 'jest',
  'testing': 'jest',

  // Cloud/DevOps
  'cloud computing': 'aws',
  'cloud': 'aws',
  'computação em nuvem': 'aws',
  'containers': 'docker',
  'containerização': 'docker',
  'ci/cd': 'github',
  'devops': 'docker',

  // General
  'estrutura de dados': 'data structures',
  'estruturas de dados': 'data structures',
  'algoritmos': 'algorithms',
  'metodologia ágil': 'agile',
  'metodologias ágeis': 'agile',
  'scrum': 'agile',
  'kanban': 'agile',
};

// Função para buscar recursos de uma tecnologia
export function getResourcesForTech(techName: string): CuratedResource[] {
  const normalizedName = techName.toLowerCase().trim();

  // Verificar alias primeiro
  const aliasKey = techAliases[normalizedName];
  if (aliasKey && curatedResources[aliasKey]) {
    return curatedResources[aliasKey];
  }

  // Buscar direto
  if (curatedResources[normalizedName]) {
    return curatedResources[normalizedName];
  }

  // Buscar parcial (ex: "React.js 18" -> "react")
  for (const key of Object.keys(curatedResources)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return curatedResources[key];
    }
  }

  // Não encontrou - retornar vazio
  return [];
}
