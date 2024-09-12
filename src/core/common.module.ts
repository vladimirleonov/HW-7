// import { Module, Provider } from '@nestjs/common';
// import { UtilsService } from './application/utils.service';
// import { CryptoService } from './application/crypto.service';
// import { NodemailerService } from './application/nodemailer.service';
// import { LocalStrategy } from './stratagies/local.strategy';
// import { JwtStrategy } from './stratagies/jwt.strategy';
// import { BasicStrategy } from './stratagies/basic.strategy';
// import { RefreshTokenJwtStrategy } from './stratagies/refresh-token-jwt.strategy';
// import { OptionalJwtStrategy } from './stratagies/optional-jwt.strategy';
// import { BlogIsExistConstraint } from './decorators/validators/blog-is-exist.decorator';
// import { LoginIsExistConstraint } from './decorators/validators/login-is-exist.decorator';
// import { EmailIsExistConstraint } from './decorators/validators/email-is-exist.decorator';
//
// const basicProviders: Provider[] = [
//   UtilsService,
//   // JwtService,
//   CryptoService,
//   NodemailerService,
// ];
//
// const strategyProviders: Provider[] = [
//   LocalStrategy,
//   JwtStrategy,
//   BasicStrategy,
//   RefreshTokenJwtStrategy,
//   OptionalJwtStrategy,
// ];
//
// const constraintProviders: Provider[] = [
//   BlogIsExistConstraint,
//   LoginIsExistConstraint,
//   EmailIsExistConstraint,
// ];
//
// @Module({
//   imports: [CommonModule],
//   providers: [...basicProviders, ...strategyProviders, ...constraintProviders],
//   exports: [...basicProviders, ...strategyProviders, ...constraintProviders],
//   // global: true, // Make it available to all modules in the application.
// })
// export class CommonModule {}
