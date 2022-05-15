// Creates a ticketpanel entity
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("punishment_proof")
export class PunishmentProof {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ type: "bigint", name: "punishment_Id", unsigned: true })
  punishmentId: string;

  @Column({ type: "varchar", name: "proof_type", length: 255 })
  punishment_type: string;

  @Column({ type: "longtext", name: "proof_url" })
  proofUrl: string;
}
