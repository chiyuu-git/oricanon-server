import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberInfoService } from '@src/member-info/member-info.service';
import { Repository } from 'typeorm';
import { CreateArticleInteractDataDto } from './dto/create-article-interact-data.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Account } from './entities/account.entity';
import { AppendixType } from './entities/appendix-type.entity';
import { ArticleInteractData } from './entities/article-interact-data.entity';
import { Article } from './entities/article.entity';
import { PlatformType } from './entities/platform-type.entity';

@Injectable()
export class ArticleService {
    @InjectRepository(Article)
    ArticleRepository: Repository<Article>;

    @InjectRepository(Account)
    AccountRepository: Repository<Account>;

    @InjectRepository(ArticleInteractData)
    ArticleInteractDataRepository: Repository<ArticleInteractData>;

    @InjectRepository(AppendixType)
    AppendixTypeRepository: Repository<AppendixType>;

    @InjectRepository(PlatformType)
    PlatformTypeRepository: Repository<PlatformType>;

    constructor(
        private readonly memberInfoService: MemberInfoService,
    ) {}

    async findOrCreateArticleInfo(
        name: string,
        repository: Repository<Account | AppendixType | PlatformType>,
    ) {
        const entity = await repository.findOne({ where: { name } });

        // 不存在，则创建一个
        if (!entity) {
            const newEntity = await repository.create({ name });
            await repository.save(newEntity);
            return newEntity.id;
        }

        return entity?.id;
    }

    findOneArticle(uri: string) {
        return this.ArticleRepository.findOne({ uri });
    }

    async createArticle(account: string, uri: string) {
        const accountId = await this.findOrCreateArticleInfo(account, this.AccountRepository);
        const articleEntity = await this.ArticleRepository.create({
            accountId,
            uri,
        });

        await this.ArticleRepository.save(articleEntity);
        return articleEntity;
    }

    async findOrCreateArticle(account: string, uri: string) {
        let articleEntity = await this.findOneArticle(uri);

        if (!articleEntity) {
            articleEntity = await this.createArticle(account, uri);
        }
        return articleEntity;
    }

    async updateArticleInfo(createArticleDto: CreateArticleDto) {
        const {
            account,
            uri,
            createdAt,
            appendixType,
            platformType,
        } = createArticleDto;

        const articleEntity = await this.findOrCreateArticle(account, uri);

        const platformTypeId = await this.findOrCreateArticleInfo(platformType, this.PlatformTypeRepository);
        let appendixTypeId: number | null = null;
        if (appendixType) {
            appendixTypeId = await this.findOrCreateArticleInfo(appendixType, this.AppendixTypeRepository);
        }

        // 更新实体的字段
        Object.assign(articleEntity, {
            createdAt,
            platformTypeId,
            appendixTypeId,
        });

        await this.ArticleRepository.save(articleEntity);

        return 'This action update twitter articleInfo';
    }

    findAll() {
        return 'This action returns all twitter';
    }

    update(id: number, updateTwitterDto: UpdateArticleDto) {
        return `This action updates a #${id} twitter`;
    }

    remove(id: number) {
        return `This action removes a #${id} twitter`;
    }

    async createArticleInteractData(createArticleInteractDataDto: CreateArticleInteractDataDto) {
        const {
            uri,
            replyCount,
            retweetCount,
            quoteCount,
            favoriteCount,
            recordDate,
        } = createArticleInteractDataDto;

        // 检查是否有重复的记录，同一天记录过就没有必要再记录了
        const articleEntity = await this.findOneArticle(uri);
        const articleId = articleEntity?.articleId;
        const record = await this.ArticleInteractDataRepository.findOne({
            where: {
                articleId,
                recordDate,
            },
        });

        if (record) {
            return `Data has be recorded at the same date ${recordDate}`;
        }

        if (articleId) {
            await this.ArticleInteractDataRepository.insert({
                articleId,
                replyCount,
                retweetCount,
                quoteCount,
                favoriteCount,
                recordDate,
            });
            return 'This action adds a new article interact data record';
        }

        return `Can not find the article, please make sure article ${uri} is exist`;
    }

    async updateArticleEventId(url: string, eventId: number) {
        const splitArr = url.split('/');
        const account = splitArr.at(-3) as string;
        const uri = splitArr.at(-1) as string;

        await this.findOrCreateArticle(account, uri);
        // 返回的 entity 改动后 save 也无法触发更新，只能用 update 处理下
        await this.ArticleRepository.update({ uri }, { eventId });

        return 'This action update twitter article eventId';
    }
}
