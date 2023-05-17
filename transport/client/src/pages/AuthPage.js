import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const message = useMessage();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        email: '', password: ''
    });

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const checkFields = (email, password) => {
        if (email === '' || password === '') {
            message('Запоўнiце пустыя палi');
            return false;
        }
        if (RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email) === false) {
            message('Некарэктны email');
            return false;
        }
        if (password.length < 6) {
            message('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return false;
        }
        return true;
    }

    const registerHandler = async () => {
        try {
            const { email, password } = form;
            if (checkFields(email, password)) {
                const data = await request('/api/auth/register', 'POST', { ...form });
                message(data.message);
            }
        } catch (e) { 
            message(e.message);
        }
    }

    const loginHandler = async () => {
        try {
            const { email, password } = form;
            if (checkFields(email, password)) {
                const data = await request('/api/auth/login', 'POST', { ...form });
                console.log(data);
                auth.login(data.token, data.user);
                auth.userRole = data.user.role;
                auth.userId = data.user.id;
                navigate('/');
            }
        } catch (e) { 
            message(e.message);
        }
    }

    return (
        <div className="row">
            <div className="col s6 offset-s3">
                <div className="card">
                    <div className="card-content dark-grey-text">
                        <span className="card-title">Аўтарызацыя</span>
                        <div>

                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        maxLength={30}
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        className="validate"
                                        onChange={changeHandler} />
                                    <label
                                        htmlFor="email">
                                        Увядзіце email
                                    </label>
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        maxLength={12}
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        className="validate"
                                        onChange={changeHandler} />
                                    <label
                                        htmlFor="password">
                                        Увядзіце пароль
                                    </label>
                                </div>
                            </div>

                        </div>
                        <div className="card-action">
                            <button
                                className="waves-effect waves-light btn-large"
                                disabled={loading}
                                onClick={loginHandler}>
                                Увайсці
                            </button>
                            <button
                                className="waves-effect waves-light btn-large"
                                disabled={loading}
                                onClick={registerHandler}>
                                Рэгістрацыя
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};