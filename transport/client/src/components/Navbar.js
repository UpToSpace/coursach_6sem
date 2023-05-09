import React, { useContext } from "react";
import { useMessage } from "../hooks/message.hook";
import { options } from "./arrays";
import { useAuth } from "../hooks/auth.hook";
import { roles } from "./arrays";

export const Navbar = () => {
    const message = useMessage();
    const auth = useAuth()
    const userRole = auth.userRole;
    const ws = new WebSocket('ws://localhost:5001');
    ws.onopen = () => {

        userRole && ws.send("user id: " + JSON.stringify(JSON.parse(localStorage.getItem("userData")).userId))
    }
    ws.onmessage = function (event) {
        const ticket = JSON.parse(event.data);
        //console.log(ticket)
        var messageText;
        if (ticket.ticketType.type === options.type[0]) // На определенное количество поездок
        {
            messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.tripCount + " количество поездок закончился";
        } else {
            messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.duration + " суток закончился";
        }
        // message(messageText);
        ws.close();
    };
    ws.onclose = () => {
        //console.log('ws closed');
    };

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
                            <li><a href="/admin/tickets">Бiлеты</a></li>
                            <li><a href="/account">Акаунт</a></li>
                        </ul>
                        : userRole === roles[1] ?
                            <ul id="nav-mobile" className="right hide-on-med-and-down">
                                <li><a href="/map">Расклад</a></li>
                                <li><a href="/tickets">Бiлеты</a></li>
                                <li><a href="/account">Акаунт</a></li>
                            </ul>
                            : null}
                </div>
            </nav>
        </>);
}
