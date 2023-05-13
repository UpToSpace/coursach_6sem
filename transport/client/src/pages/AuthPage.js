import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const message = useMessage();
    const { loading, error, request, clearError, errors } = useHttp();
    const [form, setForm] = useState({
        email: '', password: ''
    });

    useEffect(() => {
        //console.log('Error', error);
        message(error);
        clearError();
    }, [error, message, clearError]);

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const registerHandler = async () => {
        try {
            const { email, password } = form;
            if (email === '' || password === '') {
                message('Заполните все поля');
                return;
            }
            if (RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email) === false) {
                message('Некорректный email');
                return;
            }
            if (password.length < 6) {
                message('Пароль должен быть не менее 6 символов');
                return;
            }
            const data = await request('/api/auth/register', 'POST', { ...form });
            message(data.message);
        } catch (e) { }
    }

    const loginHandler = async () => {
        try {
            const data = await request('/api/auth/login', 'POST', { ...form });
            console.log(data);
            auth.login(data.token, data.user);
            auth.userRole = data.user.role;
            auth.userId = data.user.id;
            navigate('/');
        } catch (e) { }
    }

    return (
        <div className="row">
            <div className="col s6 offset-s3">
                <div className="card">
                    <div className="card-content dark-grey-text">
                        <span className="card-title">Авторизация</span>
                        <div>

                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        //placeholder='Введите email'
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        className="validate"
                                        onChange={changeHandler} />
                                    <label
                                        htmlFor="email">
                                        Введите email
                                    </label>
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        //placeholder='Введите пароль'
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        className="validate"
                                        onChange={changeHandler} />
                                    <label
                                        htmlFor="password">
                                        Введите пароль
                                    </label>
                                </div>
                            </div>

                        </div>
                        <div className="card-action">
                            <button
                                className="waves-effect waves-light btn-large"
                                disabled={loading}
                                onClick={loginHandler}>
                                Войти
                            </button>
                            <button
                                className="waves-effect waves-light btn-large"
                                disabled={loading}
                                onClick={registerHandler}>
                                Регистрация
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};