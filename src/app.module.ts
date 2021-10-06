import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberListModule } from './member-list/member-list.module';
import { CouplePixivTagModule } from './couple-pixiv-tag/couple-pixiv-tag.module';
import { WeeklyModule } from './weekly/weekly.module';
import { CharacterPixivTagModule } from './character-pixiv-tag/character-pixiv-tag.module';
import { SeiyuuFollowerModule } from './seiyuu-follower/seiyuu-follower.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '123456',
            database: 'canon',
            autoLoadEntities: true,
            synchronize: false,
            logging: true,
        }),
        MemberListModule,
        CouplePixivTagModule,
        CharacterPixivTagModule,
        WeeklyModule,
        SeiyuuFollowerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private readonly connection: Connection, private readonly entityManager: EntityManager) {}
}
