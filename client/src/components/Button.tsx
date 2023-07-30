import styles from "./Button.module.scss"

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  tetriary = "tetriary",
}

interface ButtonProps {
  variant?: ButtonVariant,
  children?: any,
  onClick?: () => any;
}

export const Button = ({ variant = ButtonVariant.primary, children, onClick }: ButtonProps) => {
  return <button className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
    {children}
  </button>
}