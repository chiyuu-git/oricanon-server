import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberListsModule } from './member-lists/member-lists.module';
import { CouplePixivTagModule } from './couple-pixiv-tags/couple-pixiv-tags.module';

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
        MemberListsModule,
        CouplePixivTagModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private readonly connection: Connection, private readonly entityManager: EntityManager) {}
}
