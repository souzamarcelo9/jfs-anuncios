import { MainStyled, HeaderStyled, SectionStyled } from './styles';
import { LogoAnimation } from '../../components/Form/styles';
import Button from '../../components/Button';

import { AiOutlineUser } from 'react-icons/ai';
import MyToast from '../../components/MyToast';

import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
    const { currentUser, logOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleLogOut() {
        setLoading(true);

        try {
            await logOut();

            MyToast('success', 'LogOut realizado com sucesso!', '#61dafb');

            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err) {
            console.error(err);
            MyToast('error', 'Falha ao realizar o LogOut!', '#a00000');
        } finally {
            setLoading(false);
            return;
        }
    }

    return (
        <MainStyled>
            <div>
                <LogoAnimation />
                <span>Home</span>
            </div>
            <HeaderStyled>
                <AiOutlineUser />
                <h2>{currentUser.email}</h2>
            </HeaderStyled>
            <SectionStyled>
                <Button
                    title="Continuar"
                    onClick={() =>navigate("/dashboard")}
                />
                <Button title="LogOut" onClick={handleLogOut} disabled={loading} />
            </SectionStyled>
        </MainStyled>
    );
}
