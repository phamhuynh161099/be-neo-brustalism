import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseNeoBrustalismService } from './database-neo-brustalism.service';

@Module({
    imports: [
        // Kết nối MySQL chính
        // TypeOrmModule.forRootAsync({
        //     name: 'default', // Tên kết nối mặc định
        //     imports: [ConfigModule],
        //     useFactory: (configService: ConfigService) => ({
        //         type: 'mysql',
        //         host: configService.get('DB_HOST', 'localhost'),
        //         port: configService.get('DB_PORT', 3306),
        //         username: configService.get('DB_USERNAME', 'root'),
        //         password: configService.get('DB_PASSWORD', ''),
        //         database: configService.get('DB_NAME', 'nestjs_db'),
        //         // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        //         synchronize: configService.get('NODE_ENV') !== 'production',
        //         logging: configService.get('NODE_ENV') === 'development',
        //         timezone: '+07:00',
        //     }),
        //     inject: [ConfigService],
        // }),

        TypeOrmModule.forRootAsync({
            name: 'default', // Tên kết nối mặc định
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                url: 'mysql://dbeaver_user:password123@103.155.161.244:3306/neo_brustalism_db',
                // host: configService.get('103.155.161.244'),
                // port: configService.get('3306'),
                // username: configService.get('dbeaver_user'),
                // password: configService.get('password123'),
                // database: configService.get('neo_brustalism_db'),
                // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: true,
                timezone: '+07:00',
            }),
            inject: [ConfigService],
        }),

        // Kết nối MySQL thứ hai
        // TypeOrmModule.forRootAsync({
        //     name: 'analytics',
        //     imports: [ConfigModule],
        //     useFactory: (configService: ConfigService) => ({
        //         type: 'mysql',
        //         host: configService.get('ANALYTICS_DB_HOST', 'localhost'),
        //         port: configService.get('ANALYTICS_DB_PORT', 3306),
        //         username: configService.get('ANALYTICS_DB_USERNAME', 'root'),
        //         password: configService.get('ANALYTICS_DB_PASSWORD', ''),
        //         database: configService.get('ANALYTICS_DB_NAME', 'analytics_db'),
        //         entities: [__dirname + '/../**/*.analytics.entity{.ts,.js}'],
        //         synchronize: configService.get('NODE_ENV') !== 'production',
        //         logging: false,
        //         timezone: '+07:00',
        //     }),
        //     inject: [ConfigService],
        // }),
    ],
    providers: [DatabaseNeoBrustalismService],
    exports: [DatabaseNeoBrustalismService],
})
export class DatabaseModule { }