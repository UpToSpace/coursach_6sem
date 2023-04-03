import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const Navbar = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const logoutHandler = event => {
        event.preventDefault();
        auth.logout();
        navigate.apply("/")
    }

    return (
        <>
            <nav className="nav-extended">

                <div className="nav-wrapper">
                    <a href="/" className="brand-logo">Logo</a>
                    {/* <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a> */}
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><a href="sass.html">Sass</a></li>
                        <li><a href="badges.html">Components</a></li>
                        <li><a href="/" onClick={logoutHandler}>Выйти</a></li>
                    </ul>
                </div>

                <div className="nav-content">
                    <ul className="tabs tabs-transparent">
                        <li className="tab"><a href="#test1">Test 1</a></li>
                        <li className="tab"><a className="active" href="#test2">Test 2</a></li>
                        <li className="tab"><a href="#test4">Test 4</a></li>
                    </ul>
                </div>
            </nav>

            {/* <ul className="sidenav" id="mobile-demo">
                <li><a href="sass.html">Sass</a></li>
                <li><a href="badges.html">Components</a></li>
                <li><a href="collapsible.html">JavaScript</a></li>
            </ul> */}

        </>);
}
