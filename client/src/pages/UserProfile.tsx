import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export const UserProfilePage = () => {
  const { username } = useParams()
  const [ userInfo, setUserInfo ] = useState({})
  console.log(username)

  // useEffect(async () => {

  // }, )


  return(
    <main>
      <h1>Userprofile</h1>
    </main>)
}