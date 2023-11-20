import React, { useContext } from "react";
import { useMessage } from "../hooks/message.hook";
import { useAuth } from "../hooks/auth.hook";
import { roles } from "./arrays";

export const Navbar = () => {
    const message = useMessage();
    const auth = useAuth()
    const userRole = auth.userRole;

    return (
        <>
            <nav>
                <div className="nav-wrapper" style={{ "width": "95%", "margin": "auto" }}>
                    <a href="/" className="brand-logo">ROVER</a>
                    {userRole === roles[0] ? // admin
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <li><a href="/admin">Адмiн</a></li>
                            <li><a href="/admin/stops">Прыпынкi</a></li>
                            <li><a href="/admin/routes">Маршруты</a></li>
                            <li><a href="/admin/schedule">Расклад</a></li>
                            <li><a href="/account">Акаунт</a></li>
                        </ul>
                        : userRole === roles[1] ? // user
                            <ul id="nav-mobile" className="right hide-on-med-and-down">
                                <li><a href="/map">Расклад</a></li>
                                <li><a href="/account">Акаунт</a></li>
                            </ul>
                            : null}
                </div>
            </nav>
        </>);
}
