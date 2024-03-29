import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { fetchTwitterFollower } from 'scripts/fetch-twitter-follower';
import { fetchTwitterArticleDetail } from 'scripts/fetch-twitter-aricle-detail';
import { fetchPixivTagCount } from 'scripts/fetch-pixiv-tag';
import { fetchPixivTagViewCount } from 'scripts/fetch-pixiv-tag-view';
import { AppModule } from './app.module';

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
    .then(async () => {
        // 服务启动之后再执行脚本;
        // fetchTwitterFollower();
        // await fetchTwitterArticleDetail();
        // await fetchPixivTagCount();
        // await fetchPixivTagViewCount();
        const placeholder = 123;
        return true;
    })
    .catch((error) => {
        console.log('bootstrap err:', error);
    });

