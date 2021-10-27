import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
// eslint-disable-next-line unicorn/import-style
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberListModule } from './member-list/member-list.module';
import { WeeklyModule } from './weekly/weekly.module';
import { RecordModule } from './record/record.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '',
            database: 'canon',
            autoLoadEntities: true,
            synchronize: false,
            logging: false,
        }),
        ServeStaticModule.forRoot({
            // 相对于打包后的dist目录
            // eslint-disable-next-line unicorn/prefer-module
            rootPath: resolve(__dirname, '../../public'),

        }),
        MemberListModule,
        WeeklyModule,
        RecordModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private readonly connection: Connection, private readonly entityManager: EntityManager) {}
}
