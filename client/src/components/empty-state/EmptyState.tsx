import styles from "./EmptyState.module.scss"

interface EmptyStateProps {
  children?: any;
}

export const EmptyState = ({ children }: EmptyStateProps) => {
  return <article className={styles.emptyState}>
    {children}
  </article>
}