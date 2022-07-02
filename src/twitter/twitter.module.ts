import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import { PlatformType } from './entities/platform-type.entity';
import { Article } from './entities/article.entity';
import { ArticleInteractData } from './entities/article-interact-data.entity';
import { AppendixType } from './entities/appendix-type.entity';
import { Account } from './entities/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Account, PlatformType, Article, ArticleInteractData, AppendixType])],
    controllers: [TwitterController],
    providers: [ArticleService],
})
export class TwitterModule {}
