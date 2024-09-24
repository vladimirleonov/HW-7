export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class AuthenticatedUserModel {
  userId: string;
  login: string;
  email: string;
}

// MAPPERS

export const UserOutputModelMapper = (user): UserOutputModel => {
  const outputModel: UserOutputModel = new UserOutputModel();

  outputModel.id = user.id.toString();
  outputModel.login = user.login;
  outputModel.email = user.email;
  outputModel.createdAt = user.created_at.toISOString();

  return outputModel;
};

export const AuthenticatedUserModelMapper = (user) => {
  const outputModel: AuthenticatedUserModel = new AuthenticatedUserModel();

  outputModel.email = user.email;
  outputModel.login = user.login;
  outputModel.userId = user.id.toString();

  return outputModel;
};

// export const UserOutputModelMapper = (user: UserDocument): UserOutputModel => {
//   const outputModel: UserOutputModel = new UserOutputModel();
//
//   outputModel.id = user.id;
//   outputModel.login = user.login;
//   outputModel.email = user.email;
//   outputModel.createdAt = user.createdAt.toISOString();
//
//   return outputModel;
// };
