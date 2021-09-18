import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupsModule } from './groups/groups.module';

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
			synchronize: true,
		}),
		GroupsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	constructor(
		private readonly connection: Connection,
		private readonly entityManager: EntityManager,
	) {}
}
