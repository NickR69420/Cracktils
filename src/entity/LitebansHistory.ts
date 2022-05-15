import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id", ["id"], { unique: true })
@Index("idx_litebans_history_uuid", ["uuid"], {})
@Index("idx_litebans_history_name", ["name"], {})
@Index("idx_litebans_history_ip", ["ip"], {})
@Entity("litebans_history", { schema: "litebans" })
export class LitebansHistory {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("timestamp", { name: "date", default: () => "CURRENT_TIMESTAMP" })
  date: Date;

  @Column("varchar", { name: "name", length: 16 })
  name: string;

  @Column("varchar", { name: "uuid", length: 36 })
  uuid: string;

  @Column("varchar", { name: "ip", length: 45 })
  ip: string;
}
