import { UserDocument } from '../../../../users/domain/user.entity';

export class AuthMeOutputModel {
  email: string;
  login: string;
  userId: string;
}

// MAPPERS

export const AuthMeOutputModelMapper = (
  user: UserDocument,
): AuthMeOutputModel => {
  const outputModel: AuthMeOutputModel = new AuthMeOutputModel();

  outputModel.userId = user.id;
  outputModel.login = user.login;
  outputModel.email = user.email;

  return outputModel;
};
