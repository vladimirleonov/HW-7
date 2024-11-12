import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Question {
  @Column({ length: 500 })
  body: string;

  @Column('simple-json')
  correctAnswers: string[];

  // auto set on create
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // auto set on update
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // auto set when soft delete
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  static create(body: string, correctAnswers: string[]) {
    const newQuestion: Question = new this();

    newQuestion.body = body;
    newQuestion.correctAnswers = correctAnswers;
  }
}
