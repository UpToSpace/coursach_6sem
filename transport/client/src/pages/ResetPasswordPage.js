import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPasswordPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const message = useMessage();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        password: '', confirmPassword: ''
    });

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const checkFields = (confirmPassword, password) => {
        if (confirmPassword === '' || password === '') {
            message('Запоўнiце пустыя палi');
            return false;
        }
        if (password.length < 6) {
            message('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return false;
        }
        if (password !== confirmPassword) {
            message('Паролi не супадаюць')
            return false;
        }
        return true;
    }

    const changePasswordHandler = async () => {
        if (checkFields(form.confirmPassword, form.password)) {
        try {
            const data = await request('/api/auth/reset/' + searchParams.get('resetLink'), 'POST', { password: form.password });
            message(data.message);
            navigate('/login');
        } catch (e) {
            message(e.message);
        }
    }
    }

    return (
        <div className="login-form">
            <div className="col s6 offset-s3">
                <div className="card">
                    <div className="card-content dark-grey-text">
                        <span className="card-title">Змена пароля</span>
                        <div>
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

                        <div className="row">
                            <div className="input-field col s12">
                                <input
                                    maxLength={12}
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    className="validate"
                                    onChange={changeHandler} />
                                <label
                                    htmlFor="confirmPassword">
                                    Паутарыце пароль
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card-action">
                        <button
                            className="waves-effect waves-light btn-large"
                            disabled={loading}
                            onClick={changePasswordHandler}>
                            Змянiць
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};