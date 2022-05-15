import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id", ["id"], { unique: true })
@Index("idx_litebans_servers_uuid", ["uuid"], { unique: true })
@Entity("litebans_servers", { schema: "litebans" })
export class LitebansServers {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 32 })
  name: string;

  @Column("varchar", { name: "uuid", unique: true, length: 32 })
  uuid: string;

  @Column("timestamp", { name: "date", default: () => "CURRENT_TIMESTAMP" })
  date: Date;
}
