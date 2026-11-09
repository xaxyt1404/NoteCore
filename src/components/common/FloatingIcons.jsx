import icon01 from "../../assets/fondo/iconosfondo_01.png";
import icon02 from "../../assets/fondo/iconosfondo_02.png";
import icon03 from "../../assets/fondo/iconosfondo_03.png";
import icon04 from "../../assets/fondo/iconosfondo_04.png";
import icon05 from "../../assets/fondo/iconosfondo_05.png";
import icon06 from "../../assets/fondo/iconosfondo_06.png";
import icon07 from "../../assets/fondo/iconosfondo_07.png";
import icon08 from "../../assets/fondo/iconosfondo_08.png";
import icon09 from "../../assets/fondo/iconosfondo_09.png";
import icon10 from "../../assets/fondo/iconosfondo_10.png";
import icon11 from "../../assets/fondo/iconosfondo_11.png";
import icon12 from "../../assets/fondo/iconosfondo_12.png";
import icon13 from "../../assets/fondo/iconosfondo_13.png";

const ICONS = [
  icon01, icon02, icon03, icon04, icon05, icon06, icon07,
  icon08, icon09, icon10, icon11, icon12, icon13,
];

export default function FloatingIcons() {
  return (
    <div className="background-floating-icons" aria-hidden="true">
      {ICONS.map((src, i) => (
        <img key={i} src={src} className={`bg-icon icon-${i + 1}`} alt="" />
      ))}
    </div>
  );
}