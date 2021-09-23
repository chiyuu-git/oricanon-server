import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from './validate.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // swagger 配置
    const config = new DocumentBuilder()
        .setTitle('canon-server-nest')
        .setDescription('The canon server API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(new ValidationPipe());
    // 允许跨域
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
