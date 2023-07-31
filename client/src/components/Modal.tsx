import { useState } from "react";
import { IconClose } from "../icons/icon-close";
import { FormEvent } from "react";
import { Button, ButtonTypes } from "./Button";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import styles from "./Modal.module.scss";

export interface ModalProps {
  title: string;
  inputLabel: string,
  inputPlaceholder: string,
  submitBtnLabel: string,
  onClickClose: () => void;
  onClickSubmit: (value: string) => void;
}

export const Modal = ({ title, inputLabel, inputPlaceholder, submitBtnLabel, onClickClose, onClickSubmit }: ModalProps) => {
  const navigate = useNavigate()
  const [ value, setValue ] = useState<string>("")
  const [ formError, setFormError ] = useState<string>("")

  const onClickSubmitForm = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    setFormError("")

    if (value.trim() === "") {
      setFormError("Value cannot be empty")
      return
    }

    try {
      const newGroup = await axios.post(`${process.env.REACT_APP_API_URL}/api/group`,
        { name: value },
        { withCredentials: true, }
      )

      navigate(`/g/${newGroup.data.group_id}`)

    } catch (error) {
      setFormError("Error creating a new group")
      console.error("Error creating a new group:", error);
    }

    onClickSubmit(value)
  }

  return (
    <div className={styles.modalOverlay}>
      <article className={styles.modal}>
        <header>
          <h1>{title}</h1>
          <div onClick={onClickClose}>
            <IconClose />
          </div>
        </header>
        <main>
          <form onSubmit={onClickSubmitForm}>
            <label htmlFor="modalInput">
              {inputLabel}
              <input type="text" placeholder={inputPlaceholder} id="modalInput" onChange={(ev) => setValue(ev.target.value)} />
              {formError && <p className={styles.error}>{formError}</p>}
            </label>
            <Button type={ButtonTypes.submit}>{submitBtnLabel}</Button>
          </form>
        </main>
      </article>
    </div>
  );
};