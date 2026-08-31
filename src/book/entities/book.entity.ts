import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'

export enum BookStatus {
  AVAILABLE = 'available',
  ON_LOAN = 'on-loan',
  UNDER_REPAIR = 'under-repair',
}

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @Column({ nullable: true })
  isbn: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  author: string

  @Column({ nullable: true })
  category: string

  @Column({ nullable: true })
  year: number

  @Column({ nullable: true })
  publisher: string

  @Column({ default: 'es' })
  language: string

  @Column({ type: 'int', nullable: true })
  pages: number

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
