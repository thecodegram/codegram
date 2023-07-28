import styles from "./Button.module.scss"

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  tetriary = "tetriary",
}

interface ButtonProps {
  variant?: ButtonVariant,
  children?: any,
  props?: any
}

export const Button = ({ variant = ButtonVariant.primary, children, ...props }: ButtonProps) => {
  return <button className={`${styles.btn} ${styles[variant]}`} {...props}>
    {children}
  </button>
}