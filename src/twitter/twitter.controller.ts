import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleService } from './twitter.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleInteractDataDto } from './dto/create-article-interact-data.dto';

@ApiTags('twitter')
@Controller('twitter')
export class TwitterController {
    constructor(private readonly twitterService: ArticleService) {}

    @Post('/update_article')
    createArticle(@Body() createArticleDto: CreateArticleDto) {
        return this.twitterService.updateArticleInfo(createArticleDto);
    }

    @Post('/create_article_interact_data')
    createArticleInteractData(@Body() createArticleInteractDataDto: CreateArticleInteractDataDto) {
        return this.twitterService.createArticleInteractData(createArticleInteractDataDto);
    }
}
