import {
  Check,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation';
import { PasswordRecovery } from './password-recovery';

// TODO: validation in entity should be the same as in api?
// TODO: Check or length better use

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  @Check(`length(login) >= 3`)
  //@Check(`length(login) >= 3 AND length(login) <= 10`)
  login: string;

  @Column({ length: 20 })
  @Check(`length(password) >= 6`)
  password: string;

  @Column()
  email: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user)
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user)
  passwordRecovery: PasswordRecovery;
}

// export const UserSchema = new EntitySchema({
//   name: 'User', // название таблицы
//   columns: {
//     id: {
//       type: Number,
//       primary: true,
//       generated: true,
//     },
//     login: {
//       type: String,
//       length: 10,
//       nullable: false,
//     },
//     password: {
//       type: String,
//       length: 20,
//       nullable: false,
//     },
//     email: {
//       type: String,
//       nullable: false,
//     },
//     createdAt: {
//       type: 'timestamptz',
//       default: () => 'CURRENT_TIMESTAMP',
//     },
//   },
// });

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Model } from 'mongoose';
//
// @Schema()
// class EmailConfirmation {
//   @Prop({
//     type: String,
//     maxlength: 40,
//     required: true,
//   })
//   confirmationCode: string;
//
//   @Prop({
//     type: Date,
//     required: true,
//   })
//   expirationDate: Date;
//
//   @Prop({
//     type: Boolean,
//     required: true,
//   })
//   isConfirmed: boolean;
// }
//
// @Schema()
// class PasswordRecovery {
//   @Prop({
//     type: String,
//     maxlength: 40,
//   })
//   recoveryCode: string;
//
//   @Prop({
//     type: Date,
//     default: null,
//     // validators: {
//     //     validator: isValidISOString,
//     //     message: "expirationDate must be a valid ISO string",
//     // }
//   })
//   expirationDate: Date;
// }
//
// export const EmailConfirmationSchema =
//   SchemaFactory.createForClass(EmailConfirmation);
// export const PasswordRecoverySchema =
//   SchemaFactory.createForClass(PasswordRecovery);
//
// @Schema()
// export class User {
//   @Prop({
//     type: String,
//     minlength: 3,
//     maxlength: 10,
//     match: /^[a-zA-Z0-9_-]*$/,
//     required: true,
//   })
//   login: string;
//
//   @Prop({
//     type: String,
//     minlength: 1,
//     maxlength: 200,
//     required: true,
//   })
//   password: string;
//
//   @Prop({
//     type: String,
//     match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
//     required: true,
//   })
//   email: string;
//
//   @Prop({
//     type: Date,
//     // validators: {
//     //   validator: isValidISOString,
//     //   message: "createdAt must be a valid ISO string",
//     // },
//     required: true,
//   })
//   createdAt: Date;
//   // createdAt: string;
//
//   @Prop({
//     type: EmailConfirmationSchema,
//     required: true,
//   })
//   emailConfirmation: EmailConfirmation;
//
//   @Prop({
//     type: PasswordRecoverySchema,
//   })
//   passwordRecovery: PasswordRecovery;
// }
//
// export const UserSchema = SchemaFactory.createForClass(User);
//
// //Types
// export type UserDocument = HydratedDocument<User>;
// export type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>;
// export type UserModelType = Model<User>;
