import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../styles/styles'

export const AuthPage = () => {
    const auth = useContext(AuthContext);
    const message = useMessage();
    const { loading, error, request, clearError } = useHttp();
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
            const data = await request('/api/auth/register', 'POST', { ...form });
            message(data.message);
        } catch (e) { }
    }

    const loginHandler = async () => {
        try {
            const data = await request('/api/auth/login', 'POST', { ...form });
            auth.login(data.token, data.userId);
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