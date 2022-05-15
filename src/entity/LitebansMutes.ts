import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id", ["id"], { unique: true })
@Index("idx_litebans_mutes_uuid", ["uuid"], {})
@Index("idx_litebans_mutes_ip", ["ip"], {})
@Index("idx_litebans_mutes_banned_by_uuid", ["bannedByUuid"], {})
@Index("idx_litebans_mutes_time", ["time"], {})
@Index("idx_litebans_mutes_until", ["until"], {})
@Index("idx_litebans_mutes_ipban", ["ipban"], {})
@Index("idx_litebans_mutes_ipban_wildcard", ["ipbanWildcard"], {})
@Index("idx_litebans_mutes_active", ["active"], {})
@Entity("litebans_mutes", { schema: "litebans" })
export class LitebansMutes {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "uuid", nullable: true, length: 36 })
  uuid: string | null;

  @Column("varchar", { name: "ip", nullable: true, length: 45 })
  ip: string | null;

  @Column("varchar", { name: "reason", length: 2048 })
  reason: string;

  @Column("varchar", { name: "banned_by_uuid", nullable: true, length: 36 })
  bannedByUuid: string | null;

  @Column("varchar", { name: "banned_by_name", nullable: true, length: 128 })
  bannedByName: string | null;

  @Column("varchar", { name: "removed_by_uuid", nullable: true, length: 36 })
  removedByUuid: string | null;

  @Column("varchar", { name: "removed_by_name", nullable: true, length: 128 })
  removedByName: string | null;

  @Column("varchar", {
    name: "removed_by_reason",
    nullable: true,
    length: 2048,
  })
  removedByReason: string | null;

  @Column("timestamp", {
    name: "removed_by_date",
    default: () => "CURRENT_TIMESTAMP",
  })
  removedByDate: Date;

  @Column("bigint", { name: "time" })
  time: string;

  @Column("bigint", { name: "until" })
  until: string;

  @Column("varchar", { name: "server_scope", nullable: true, length: 32 })
  serverScope: string | null;

  @Column("varchar", { name: "server_origin", nullable: true, length: 32 })
  serverOrigin: string | null;

  @Column("bit", { name: "silent" })
  silent: boolean;

  @Column("bit", { name: "ipban" })
  ipban: boolean;

  @Column("bit", { name: "ipban_wildcard" })
  ipbanWildcard: boolean;

  @Column("bit", { name: "active" })
  active: boolean;
}
