import styles from "./Button.module.scss"

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  tetriary = "tetriary",
}

export enum ButtonTypes {
  text = "text",
  submit = "submit",
}

interface ButtonProps {
  variant?: ButtonVariant,
  children?: any,
  type?: string,
  onClick?: () => any;
}

export const Button = ({ variant = ButtonVariant.primary, children, type=ButtonTypes.text, onClick }: ButtonProps) => {
  return <button className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
    {children}
  </button>
}