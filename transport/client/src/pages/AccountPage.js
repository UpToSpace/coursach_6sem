import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useNavigate } from "react-router-dom";
import { useMessage } from '../hooks/message.hook';

export const AccountPage = () => {
    const { loading, request } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const [userEmail, setUserEmail] = useState();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const logoutHandler = event => {
        event.preventDefault();
        if (window.confirm("Вы сапраўды хочаце выйсці?")) {
            auth.logout();
            navigate("/")
        }
    }

    const getUser = useCallback(async () => {
        const data = await request('/api/user', 'GET', null);
        setUserEmail(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getUser();
    }, [getUser])

    if (loading) {
        return <Loader />
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            message('Паролi не супадаюць');
            return;
        }
        try {
            const data = await request('/api/user', 'POST', { token: localStorage.getItem('token'), newPassword, oldPassword })
            message(data.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
        }
    };

    return (
        <div className='container'>
            {userEmail && <div>
                <h1>Акаунт</h1>
                <p>Пошта: {userEmail}</p>
                <form onSubmit={handleSubmit}>
                    <h3>Змянiць пароль</h3>
                    <div>
                        <label htmlFor="oldPassword">Стары пароль</label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword">Новы пароль</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword">Падцвердзiць пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button className="waves-effect waves-light btn-large" type="submit">Змянiць пароль</button>
                    <button className="waves-effect waves-light btn-large" style={{"right": "0"}}><a href="/" onClick={logoutHandler}>Выйсцi з акаунта</a></button>
                </form>
            </div>}
        </div>
    )
}