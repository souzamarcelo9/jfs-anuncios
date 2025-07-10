import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signUp(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    function logIn(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logOut() {
        return auth.signOut();
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    function updateEmail(email) {
        return currentUser.updateEmail(email);
    }

    function updatePassword(password) {
        return currentUser.updatePassword(password);
    }

    useEffect(() => {

        // Tenta carregar o usuário do localStorage na montagem inicial
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
                try {
                    // Ao carregar, o Firebase SDK ainda vai verificar a autenticação,
                    // então podemos definir um estado inicial para evitar flashes de "não logado".
                    setCurrentUser(JSON.parse(storedUser));
                } 
                catch (e) 
                {
                    console.error("Erro ao parsear usuário do localStorage:", e);
                    localStorage.removeItem('currentUser'); // Limpa dados corrompidos
                }
            
        }
            const unsubscribe = auth.onAuthStateChanged(user => {
             setCurrentUser(user); // Define o usuário retornado pelo Firebase
            if (user) {
                // Se um usuário está logado, salve no localStorage
                
                const userToStore = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                
                };
                localStorage.setItem('currentUser', JSON.stringify(userToStore));
            } else {
                // Se o usuário deslogou ou não há usuário, remova do localStorage
                localStorage.removeItem('currentUser');
            }
            setLoading(false); // Define loading como false uma vez que o estado inicial é determinado
        
        });

        return unsubscribe;
    }, []);

    const userData = {
        currentUser,
        signUp,
        logIn,
        logOut,
        resetPassword,
        updateEmail,
        updatePassword
    };

    return (
        <AuthContext.Provider value={userData}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
