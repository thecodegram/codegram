import { useState } from "react";
import styles from "./Dropdown.module.scss"

interface DropdownProps {
  trigger: any,
  children: any
}

export const Dropdown = ({ trigger, children }: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const onClickToggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className={styles.dropdown}>
      <div onClick={onClickToggleDropdown} className={styles.trigger}>{trigger}</div>
      {open && <article className={styles.panel}>
        <div className={styles.panelContent}>{children}</div>
      </article>}
    </div>
  );
};