import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { fetchTwitterArticleDetail } from 'scripts/fetch-twitter-aricle-detail';
import { AppModule } from './app.module';

import { fetchTwitterFollower } from '../scripts/fetch-twitter-follower';

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
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    // 允许跨域
    app.enableCors();
    await app.listen(3000);
}
bootstrap()
    .then(() => {
        // 服务启动之后再执行脚本;
        // fetchTwitterFollower();
        // fetchTwitterArticleDetail();
        const placeholder = 123;
        return true;
    })
    .catch((error) => {
        console.log('bootstrap err:', error);
    });

