import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersModule } from './ethers/ethers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    EthersModule,
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModule을 전역에서 사용 가능하게 설정
      envFilePath: 'src/.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 개발 중에만 사용, 프로덕션에서는 false로 설정 필요
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService], // Reflector 제거
})
export class AppModule {}
