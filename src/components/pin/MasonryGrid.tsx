import React from "react";
import styles from "../../styles/masonry.module.scss";
import PinCard from "./PinCard";

export interface PinData {
  id: number;
  title: string;
  imageUrl: string;
}

interface MasonryGridProps {
  pins: PinData[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ pins }) => {
  return (
    <div className={styles.masonryGrid}>
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </div>
  );
};

export default MasonryGrid;
