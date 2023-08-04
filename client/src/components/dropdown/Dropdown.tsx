import { useState } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
  trigger: any;
  triggerAction?: any;
  children: any;
  className?: string;
}

export const Dropdown = ({
  trigger,
  triggerAction,
  children,
  className,
}: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const onClickToggleDropdown = () => {
    setOpen(!open);
    triggerAction && triggerAction();
  };

  return (
    <div className={`${styles.dropdown} ${className || ""}`}>
      <div onClick={onClickToggleDropdown} className={styles.trigger}>
        {trigger}
      </div>
      {open && (
        <article className={styles.panel}>
          <div className={styles.panelContent}>{children}</div>
        </article>
      )}
    </div>
  );
};
