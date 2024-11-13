import { IsArray, IsBoolean, IsString, Length } from 'class-validator';

export class PublishedStatusUpdateModel {
  @IsBoolean({ message: 'Published field must be a boolean value' })
  published: boolean;
}
