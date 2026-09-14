import Image from "next/image";
import "./mascot-slot.css";

export type MascotSlotSize = "XL" | "2XL" | "3XL" | "4XL";

// Homie's instance-swap property has 16 options; this product only uses "standby".
export type MascotSlotPose = "standby";

const SIZE_PX: Record<MascotSlotSize, number> = {
  XL: 64,
  "2XL": 120,
  "3XL": 200,
  "4XL": 320,
};

const POSE_IMAGE: Record<MascotSlotPose, string> = {
  standby: "/images/standby.png",
};

export interface MascotSlotProps {
  size?: MascotSlotSize;
  pose?: MascotSlotPose;
}

export function MascotSlot({ size = "XL", pose = "standby" }: MascotSlotProps) {
  const px = SIZE_PX[size];

  return (
    <div className={`mascot-slot mascot-slot--${size.toLowerCase()}`}>
      <Image
        className="mascot-slot__pose"
        src={POSE_IMAGE[pose]}
        alt="Knowie"
        width={px}
        height={px}
      />
    </div>
  );
}
