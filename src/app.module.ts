import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { User, UserSchema } from './features/users/domain/user.entity';

const usersProviders: Provider[] = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://vladimir777:4kuughy1HAimmtzO@cluster0.fgdxrtr.mongodb.net/blogger_db?retryWrites=true&w=majority&appName=Cluster0',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [...usersProviders],
})
export class AppModule {}
