import React from "react";
import { getUsers } from "../api/api_user";

export async function Welcome(nameTest,description) {
    const username = localStorage.getItem('username');
    const users =  await getUsers();
    const name = users.data.find((u) => u.username === username)?.first_name;
  return (
    <TestHeader
      name={name}
      title={nameTest}
      description={description}
    />
  );
}
    //   title={"TEST DE RAZONAMIENTO VERBAL"}
    //   description={"ULA-UNET Aprende Matemática-Física-Química-Lógica…"}