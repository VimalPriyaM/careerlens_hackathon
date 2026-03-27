export interface SkillMapping {
  languages: string[];
  fileMarkers: string[];
  dependencyKeys: string[];
}

export const SKILL_GITHUB_MAPPINGS: Record<string, SkillMapping> = {
  'Python':       { languages: ['Python'], fileMarkers: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'], dependencyKeys: [] },
  'JavaScript':   { languages: ['JavaScript'], fileMarkers: ['package.json'], dependencyKeys: [] },
  'TypeScript':   { languages: ['TypeScript'], fileMarkers: ['tsconfig.json'], dependencyKeys: ['typescript'] },
  'Java':         { languages: ['Java'], fileMarkers: ['pom.xml', 'build.gradle'], dependencyKeys: [] },
  'Go':           { languages: ['Go'], fileMarkers: ['go.mod', 'go.sum'], dependencyKeys: [] },
  'Rust':         { languages: ['Rust'], fileMarkers: ['Cargo.toml'], dependencyKeys: [] },
  'C++':          { languages: ['C++', 'C'], fileMarkers: ['CMakeLists.txt', 'Makefile'], dependencyKeys: [] },
  'C':            { languages: ['C'], fileMarkers: ['Makefile'], dependencyKeys: [] },
  'Ruby':         { languages: ['Ruby'], fileMarkers: ['Gemfile'], dependencyKeys: [] },
  'PHP':          { languages: ['PHP'], fileMarkers: ['composer.json'], dependencyKeys: [] },
  'Kotlin':       { languages: ['Kotlin'], fileMarkers: ['build.gradle.kts'], dependencyKeys: [] },
  'Swift':        { languages: ['Swift'], fileMarkers: ['Package.swift'], dependencyKeys: [] },
  'Dart':         { languages: ['Dart'], fileMarkers: ['pubspec.yaml'], dependencyKeys: [] },
  'R':            { languages: ['R'], fileMarkers: ['DESCRIPTION'], dependencyKeys: [] },
  'Scala':        { languages: ['Scala'], fileMarkers: ['build.sbt'], dependencyKeys: [] },
  'SQL':          { languages: [], fileMarkers: ['*.sql', 'migrations/'], dependencyKeys: [] },
  'React':        { languages: ['JavaScript', 'TypeScript'], fileMarkers: [], dependencyKeys: ['react', 'react-dom'] },
  'Next.js':      { languages: ['JavaScript', 'TypeScript'], fileMarkers: ['next.config.js', 'next.config.mjs', 'next.config.ts'], dependencyKeys: ['next'] },
  'Vue.js':       { languages: ['JavaScript', 'TypeScript', 'Vue'], fileMarkers: [], dependencyKeys: ['vue'] },
  'Angular':      { languages: ['TypeScript'], fileMarkers: ['angular.json'], dependencyKeys: ['@angular/core'] },
  'Svelte':       { languages: ['JavaScript', 'Svelte'], fileMarkers: ['svelte.config.js'], dependencyKeys: ['svelte'] },
  'TailwindCSS':  { languages: [], fileMarkers: ['tailwind.config.js', 'tailwind.config.ts'], dependencyKeys: ['tailwindcss'] },
  'Bootstrap':    { languages: [], fileMarkers: [], dependencyKeys: ['bootstrap'] },
  'jQuery':       { languages: [], fileMarkers: [], dependencyKeys: ['jquery'] },
  'Express':      { languages: ['JavaScript', 'TypeScript'], fileMarkers: [], dependencyKeys: ['express'] },
  'Django':       { languages: ['Python'], fileMarkers: ['manage.py', 'settings.py'], dependencyKeys: ['django', 'Django'] },
  'FastAPI':      { languages: ['Python'], fileMarkers: [], dependencyKeys: ['fastapi'] },
  'Flask':        { languages: ['Python'], fileMarkers: [], dependencyKeys: ['flask', 'Flask'] },
  'Spring Boot':  { languages: ['Java'], fileMarkers: ['application.properties', 'application.yml'], dependencyKeys: ['spring-boot'] },
  'NestJS':       { languages: ['TypeScript'], fileMarkers: ['nest-cli.json'], dependencyKeys: ['@nestjs/core'] },
  'Ruby on Rails':{ languages: ['Ruby'], fileMarkers: ['Gemfile', 'config/routes.rb'], dependencyKeys: ['rails'] },
  'Laravel':      { languages: ['PHP'], fileMarkers: ['artisan'], dependencyKeys: ['laravel/framework'] },
  'Gin':          { languages: ['Go'], fileMarkers: [], dependencyKeys: ['github.com/gin-gonic/gin'] },
  'Actix':        { languages: ['Rust'], fileMarkers: [], dependencyKeys: ['actix-web'] },
  'React Native': { languages: ['JavaScript', 'TypeScript'], fileMarkers: ['app.json', 'metro.config.js'], dependencyKeys: ['react-native'] },
  'Flutter':      { languages: ['Dart'], fileMarkers: ['pubspec.yaml'], dependencyKeys: ['flutter'] },
  'PostgreSQL':   { languages: [], fileMarkers: ['*.sql', 'migrations/'], dependencyKeys: ['pg', 'psycopg2', 'psycopg2-binary', 'prisma', 'sequelize', 'typeorm', 'knex'] },
  'MongoDB':      { languages: [], fileMarkers: [], dependencyKeys: ['mongoose', 'mongodb', 'pymongo'] },
  'Redis':        { languages: [], fileMarkers: [], dependencyKeys: ['redis', 'ioredis'] },
  'MySQL':        { languages: [], fileMarkers: ['*.sql'], dependencyKeys: ['mysql', 'mysql2', 'mysqlclient'] },
  'SQLite':       { languages: [], fileMarkers: [], dependencyKeys: ['sqlite3', 'better-sqlite3'] },
  'Elasticsearch':{ languages: [], fileMarkers: [], dependencyKeys: ['@elastic/elasticsearch', 'elasticsearch'] },
  'Docker':       { languages: [], fileMarkers: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'], dependencyKeys: [] },
  'Kubernetes':   { languages: [], fileMarkers: ['k8s/', 'kubernetes/', 'helm/', 'Chart.yaml'], dependencyKeys: [] },
  'Terraform':    { languages: ['HCL'], fileMarkers: ['*.tf', 'terraform/'], dependencyKeys: [] },
  'Ansible':      { languages: [], fileMarkers: ['ansible/', 'playbook.yml', 'inventory'], dependencyKeys: [] },
  'CI/CD':        { languages: [], fileMarkers: ['.github/workflows/', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci/', '.travis.yml', 'azure-pipelines.yml'], dependencyKeys: [] },
  'Git':          { languages: [], fileMarkers: ['.gitignore', '.github/'], dependencyKeys: [] },
  'Nginx':        { languages: [], fileMarkers: ['nginx.conf', 'nginx/'], dependencyKeys: [] },
  'Linux':        { languages: [], fileMarkers: ['Makefile', 'Dockerfile', '.sh'], dependencyKeys: [] },
  'AWS':          { languages: [], fileMarkers: ['cloudformation/', 'cdk/', 'serverless.yml', 'sam-template.yaml', 'buildspec.yml'], dependencyKeys: ['aws-sdk', 'boto3', '@aws-cdk', 'aws-cdk-lib', '@aws-sdk'] },
  'GCP':          { languages: [], fileMarkers: ['app.yaml', 'cloudbuild.yaml'], dependencyKeys: ['@google-cloud', 'google-cloud'] },
  'Azure':        { languages: [], fileMarkers: ['azure-pipelines.yml', 'azuredeploy.json'], dependencyKeys: ['@azure', 'azure'] },
  'Firebase':     { languages: [], fileMarkers: ['firebase.json', '.firebaserc'], dependencyKeys: ['firebase', 'firebase-admin'] },
  'Vercel':       { languages: [], fileMarkers: ['vercel.json'], dependencyKeys: ['vercel'] },
  'Heroku':       { languages: [], fileMarkers: ['Procfile'], dependencyKeys: [] },
  'Machine Learning': { languages: ['Python', 'Jupyter Notebook'], fileMarkers: ['*.ipynb', 'models/', 'data/'], dependencyKeys: ['scikit-learn', 'sklearn', 'xgboost', 'lightgbm'] },
  'TensorFlow':   { languages: ['Python'], fileMarkers: ['*.ipynb'], dependencyKeys: ['tensorflow', 'tf-nightly'] },
  'PyTorch':      { languages: ['Python'], fileMarkers: ['*.ipynb'], dependencyKeys: ['torch', 'torchvision'] },
  'Pandas':       { languages: ['Python'], fileMarkers: ['*.ipynb', '*.csv'], dependencyKeys: ['pandas'] },
  'NumPy':        { languages: ['Python'], fileMarkers: [], dependencyKeys: ['numpy'] },
  'OpenCV':       { languages: ['Python', 'C++'], fileMarkers: [], dependencyKeys: ['opencv-python', 'cv2'] },
  'Hugging Face': { languages: ['Python'], fileMarkers: [], dependencyKeys: ['transformers', 'datasets', 'huggingface-hub'] },
  'LangChain':    { languages: ['Python'], fileMarkers: [], dependencyKeys: ['langchain', 'langchain-core'] },
  'Kafka':        { languages: [], fileMarkers: [], dependencyKeys: ['kafkajs', 'kafka-python', 'confluent-kafka'] },
  'RabbitMQ':     { languages: [], fileMarkers: [], dependencyKeys: ['amqplib', 'pika'] },
  'GraphQL':      { languages: [], fileMarkers: ['schema.graphql', '*.graphql'], dependencyKeys: ['graphql', 'apollo-server', '@apollo/client'] },
  'gRPC':         { languages: [], fileMarkers: ['*.proto', 'protos/'], dependencyKeys: ['grpc', '@grpc/grpc-js'] },
  'WebSocket':    { languages: [], fileMarkers: [], dependencyKeys: ['ws', 'socket.io', 'websockets'] },
  'System Design':    { languages: [], fileMarkers: ['docker-compose.yml', 'k8s/', 'services/', 'microservices/', 'gateway/', 'api-gateway/'], dependencyKeys: [] },
  'API Design':       { languages: [], fileMarkers: ['routes/', 'api/', 'endpoints/', 'openapi.yaml', 'swagger.json', 'openapi.json'], dependencyKeys: [] },
  'Testing':          { languages: [], fileMarkers: ['test/', 'tests/', '__tests__/', 'spec/', 'jest.config.js', 'jest.config.ts', 'pytest.ini', 'setup.cfg', '.coveragerc', 'vitest.config.ts'], dependencyKeys: ['jest', 'mocha', 'pytest', 'vitest', 'chai', 'supertest', 'cypress'] },
  'Authentication':   { languages: [], fileMarkers: ['auth/', 'middleware/auth.js', 'middleware/auth.ts'], dependencyKeys: ['passport', 'jsonwebtoken', 'bcrypt', 'bcryptjs', 'next-auth', '@auth/core'] },
  'ORM':              { languages: [], fileMarkers: ['models/', 'migrations/'], dependencyKeys: ['prisma', 'sequelize', 'typeorm', 'drizzle-orm', 'sqlalchemy', 'mongoose'] },
  'REST API':         { languages: [], fileMarkers: ['routes/', 'controllers/', 'api/'], dependencyKeys: ['express', 'fastapi', 'flask', 'django-rest-framework'] },
  'Microservices':    { languages: [], fileMarkers: ['docker-compose.yml', 'services/', 'gateway/'], dependencyKeys: [] },
  'Data Structures & Algorithms': { languages: [], fileMarkers: [], dependencyKeys: [] },
  'Design Patterns':  { languages: [], fileMarkers: [], dependencyKeys: [] },
  'Agile':            { languages: [], fileMarkers: [], dependencyKeys: [] },
};

export function findSkillMapping(skillName: string): SkillMapping | null {
  if (SKILL_GITHUB_MAPPINGS[skillName]) {
    return SKILL_GITHUB_MAPPINGS[skillName];
  }
  const lowerName = skillName.toLowerCase();
  for (const [key, mapping] of Object.entries(SKILL_GITHUB_MAPPINGS)) {
    if (key.toLowerCase() === lowerName) {
      return mapping;
    }
  }
  const normalized = lowerName.replace(/\.js|\.ts|\.py/g, '').trim();
  for (const [key, mapping] of Object.entries(SKILL_GITHUB_MAPPINGS)) {
    if (key.toLowerCase().replace(/\.js|\.ts|\.py/g, '').trim() === normalized) {
      return mapping;
    }
  }
  return null;
}
