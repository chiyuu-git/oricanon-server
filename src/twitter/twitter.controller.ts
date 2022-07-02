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

    @Post('/create_article')
    createArticle(@Body() createArticleDto: CreateArticleDto) {
        console.log('createArticleDto:', createArticleDto);
        return this.twitterService.createArticle(createArticleDto);
    }

    @Post('/create_article_interact_data')
    createArticleInteractData(@Body() createArticleInteractDataDto: CreateArticleInteractDataDto) {
        console.log('createArticleInteractDataDto:', createArticleInteractDataDto);
        return this.twitterService.createArticleInteractData(createArticleInteractDataDto);
    }

    @Get()
    findAll() {
        return this.twitterService.findAll();
    }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.twitterService.findOne(+id);
    // }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTwitterDto: UpdateArticleDto) {
        return this.twitterService.update(+id, updateTwitterDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.twitterService.remove(+id);
    }
}
