import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm'
import { Book } from '../../book/entities/index.ts'

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  code: string

  @Column({ name: 'book_id' })
  bookId: number

  @ManyToOne(() => Book, (book) => book.loans, { eager: true })
  @JoinColumn({ name: 'book_id' })
  book: Relation<Book>

  @Column({ type: 'date', name: 'loaned_at' })
  loanedAt: Date

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date

  @Column({ type: 'date', name: 'returned_at', nullable: true })
  returnedAt: Date | null

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date
}
