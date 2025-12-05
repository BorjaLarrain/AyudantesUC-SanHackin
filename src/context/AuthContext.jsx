import { createContext, useState, useContext } from "react";
import supabase from "../config/supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    return (
        <></>
    )
}

// HOOK:
// En vez de tener que importar y usar useContext(AuthContext) en cada componente,
// simplemente se importa y se llama a UserAuth().
// Ejemplo de uso: const { session } = UserAuth();
export const UserAuth = () => {
    return useContext(AuthContext);
}