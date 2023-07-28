import styles from "./ListGroup.module.scss"

interface ListGroupProps {
  title?: string,
  children?: any
}

export const ListGroup = ({title, children}: ListGroupProps) => {
  return (<article className={styles.listGroup}>
    {title && <h2>{title}</h2>}
    <ul className={styles.list}>
      {children}
    </ul>
  </article>)
}