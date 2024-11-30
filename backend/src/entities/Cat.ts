import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Point } from 'geojson';
import { User } from './User';
import { Sighting } from './Sighting';

export enum CatStatus {
  LOST = 'lost',
  FOUND = 'found',
  REUNITED = 'reunited'
}

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  breed: string;

  @Column({ nullable: true })
  ageEstimate: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  distinctiveFeatures: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  location: Point;

  @Column('text', { nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: CatStatus,
    default: CatStatus.LOST
  })
  status: CatStatus;

  @ManyToOne(() => User, user => user.reportedCats)
  reporter: User;

  @Column('jsonb', { nullable: true })
  contactInfo: {
    phone?: string;
    email?: string;
    additionalInfo?: string;
  };

  @Column('text', { array: true, default: [] })
  photoUrls: string[];

  @Column({ type: 'timestamp with time zone' })
  lastSeenAt: Date;

  @OneToMany(() => Sighting, sighting => sighting.cat)
  sightings: Sighting[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}