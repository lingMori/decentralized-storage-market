# ⚡ Storm Thunder

> *Power Your Creativity with Lightning-Fast Backend Technology*

**Storm Thunder** is a high-performance, scalable backend service powering the Storm decentralized creator platform. Built with NestJS and modern TypeScript, it delivers robust API services with enterprise-grade reliability and developer-friendly architecture.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0.0-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-blue.svg)
![Test Coverage](https://img.shields.io/badge/coverage-vitest-green.svg)

---

## 🚀 Core Features

- 🔥 **High Performance**: Optimized with SWC for lightning-fast compilation and execution
- 🧪 **Comprehensive Testing**: Full test coverage with Vitest for reliability
- 🛡️ **Type Safety**: Enhanced TypeScript implementation for robust development
- 🔄 **Real-time Capabilities**: Built-in WebSocket support with RxJS
- 🎯 **Modular Architecture**: Scalable and maintainable component-based structure

## 💻 Technology Stack

### Core Framework
- **🪺 NestJS 10**: Enterprise-ready framework for scalable server-side applications
- **📘 TypeScript 5.1**: Advanced type system for safer code
- **⚡ SWC**: Rust-based toolchain for super-fast compilation
- **🔄 RxJS**: Reactive programming for handling complex data flows

### Development & Testing
- **🧪 Vitest**: Next-generation testing framework with first-class TypeScript support
- **📊 Coverage-V8**: Detailed code coverage reporting
- **🎯 ESLint + Prettier**: Consistent code style and quality

## 🛠️ Quick Start

1. **Setup Your Environment**:
```bash
git clone https://github.com/yourusername/storm-thunder.git
cd storm-thunder
npm install
```

2. **Development Mode**:
```bash
# Watch mode with SWC builder
npm run start:dev

# Debug mode
npm run start:debug
```

3. **Testing**:
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage reports
npm run test:cov

# E2E tests
npm run test:e2e
```

4. **Production Build**:
```bash
npm run build
npm run start:prod
```

## 📁 Project Structure

```
storm-thunder/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── creators/      # Creator management
│   │   ├── content/       # Content handling
│   │   └── payments/      # Payment processing
│   ├── common/            # Shared resources
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   └── guards/        # Authentication guards
│   ├── config/           # Configuration files
│   ├── database/         # Database connections
│   └── main.ts           # Application entry point
├── test/                 # Test files
│   ├── e2e/             # End-to-end tests
│   └── unit/            # Unit tests
└── vitest.config.ts     # Vitest configuration
```

## 🎯 Key Features

### API Endpoints
- 🎨 **Creator Management**: Profile handling and analytics
- 📊 **Content Management**: Support for various content types
- 💳 **Payment Processing**: Secure transaction handling
- 🔐 **Authentication**: JWT-based secure authentication

### Developer Experience
- 🔄 **Hot Reload**: Fast development with SWC compilation
- 🐞 **Debug Support**: Advanced debugging capabilities
- 📊 **Testing Suite**: Comprehensive test coverage
- 📝 **API Documentation**: Auto-generated API docs

## 📜 Available Scripts

```bash
npm run build           # Build the application
npm run format          # Format code with Prettier
npm run start          # Start with SWC builder
npm run start:dev      # Start in watch mode
npm run start:debug    # Start in debug mode
npm run start:prod     # Start production server
npm run lint           # Lint and fix with ESLint
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Generate coverage report
npm run test:debug    # Run tests in debug mode
npm run test:e2e      # Run end-to-end tests
```

## 🔧 Configuration

The application uses environment-based configuration. Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌱 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 🔍 Run tests (`npm test`)
4. 📝 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
6. 🎉 Open a Pull Request

## 📈 Performance

- **Compilation**: Optimized with SWC for faster builds
- **Runtime**: Efficient request handling with NestJS
- **Testing**: Fast test execution with Vitest

## 🐛 Debug Mode

To run the application in debug mode:
```bash
npm run start:debug
# Then attach your debugger to the process
```

## 📜 License

This project is licensed under the UNLICENSED license.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Vitest team for the next-gen testing tools
- SWC team for the blazing-fast compiler

---

<div align="center">
Built with ⚡ by the Storm Team
</div>
