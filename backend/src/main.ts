import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import helmet from "helmet";
import * as compression from "compression";
import rateLimit from "express-rate-limit";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Compression middleware
  app.use(compression());

  // Security middleware with custom configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow for API usage
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "same-origin" },
      hidePoweredBy: true, // Hide X-Powered-By header
    })
  );

  // Hide additional server information
  app.use((req: any, res: any, next: any) => {
    res.removeHeader("X-Powered-By");
    res.removeHeader("Server");
    res.removeHeader("X-Powered-By");
    res.removeHeader("X-AspNet-Version");
    res.removeHeader("X-AspNetMvc-Version");
    res.removeHeader("X-Frame-Options");
    next();
  });

  // Additional rate limiting for the entire app
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        error: "Too many requests from this IP, please try again later.",
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // CORS configuration
  // app.enableCors({
  //   origin: [
  //     "http://localhost:3000",
  //     "http://localhost:3001",
  //     "http://localhost:5173", // Vite default
  //   ],
  //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  //   allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  //   credentials: true,
  // });
  // Enhanced CORS configuration for mobile and desktop
  app.enableCors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) {
        console.log("🌐 CORS: Allowing request with no origin");
        return callback(null, true);
      }

      console.log(`🌐 CORS: Checking origin: ${origin}`);

      // Allow localhost variants
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        console.log(`🌐 CORS: Allowing localhost origin: ${origin}`);
        return callback(null, true);
      }

      // Allow private IP ranges (mobile devices on same network)
      const privateIPRegex =
        /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/;
      if (origin.match(privateIPRegex)) {
        console.log(`🌐 CORS: Allowing private IP origin: ${origin}`);
        return callback(null, true);
      }

      // Allow specific development origins from environment
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        // Add origins from environment variable
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : []),
      ];

      if (allowedOrigins.includes(origin)) {
        console.log(`🌐 CORS: Allowing whitelisted origin: ${origin}`);
        return callback(null, true);
      }

      // In development, be more permissive
      if (process.env.NODE_ENV === "development") {
        console.log(`🌐 CORS: Allowing origin in development mode: ${origin}`);
        return callback(null, true);
      }

      console.log(`🚫 CORS: Blocking origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "X-CSRF-Token",
    ],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe with custom error handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    })
  );

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("NestJS Auth API")
    .setDescription(
      "API documentation for NestJS Authentication and Authorization system"
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Remove server info from OpenAPI spec
  delete document.info["x-powered-by"];
  if (document.servers) {
    delete document.servers;
  }

  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: false,
      tryItOutEnabled: true,
      showCommonExtensions: false,
      showExtensions: false,
    },
    customSiteTitle: "API Documentation",
    customCss: `
      .swagger-ui .info .title small { display: none; }
      .swagger-ui .info .title small.version-stamp { display: none; }
      .swagger-ui .scheme-container { display: none; }
      .swagger-ui .servers { display: none; }
      .swagger-ui .info hgroup.main a { display: none; }
    `,
  });

  const port = process.env.PORT || 4000;
  const host = process.env.HOST || "0.0.0.0"; // Bind to all interfaces for mobile access

  await app.listen(port, host);

  // Get network interfaces for mobile access info
  const os = require("os");
  const networkInterfaces = os.networkInterfaces();
  let localIP = "localhost";

  // Find the first non-internal IPv4 address
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        localIP = address.address;
        break;
      }
    }
    if (localIP !== "localhost") break;
  }

  console.log(`🚀 Application is running on:`);
  console.log(`   Local:   http://localhost:${port}/api`);
  console.log(`   Network: http://${localIP}:${port}/api`);
  console.log(`📚 Swagger documentation:`);
  console.log(`   Local:   http://localhost:${port}/api/docs`);
  console.log(`   Network: http://${localIP}:${port}/api/docs`);
  console.log(`📱 Mobile: Use http://${localIP}:${port} as your API endpoint`);
}
bootstrap();
