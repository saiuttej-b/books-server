import { Column } from 'typeorm';

export class Address {
  @Column({ type: 'citext', nullable: true })
  attention?: string | null;

  @Column({ type: 'citext', nullable: true })
  street1?: string | null;

  @Column({ type: 'citext', nullable: true })
  street2?: string | null;

  @Column({ type: 'citext', nullable: true })
  city?: string | null;

  @Column({ type: 'citext', nullable: true })
  state?: string | null;

  @Column({ type: 'citext', nullable: true })
  country?: string | null;

  @Column({ type: 'citext', nullable: true })
  pinCode?: string | null;

  @Column({ type: 'citext', nullable: true })
  faxNumber?: string | null;
}
