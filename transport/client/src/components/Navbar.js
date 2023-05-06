import React, { useContext } from "react";
import { useMessage } from "../hooks/message.hook";
import { options } from "./arrays";

export const Navbar = () => {
    const message = useMessage();
    const ws = new WebSocket('ws://localhost:5001');
    ws.onopen = () => {
        //console.log('ws opened');
    };
    ws.onmessage = function (event) {
        const ticket = JSON.parse(event.data);
        //console.log(ticket)
        var messageText;
        if(ticket.ticketType.type === options.type[0]) // На определенное количество поездок
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
                <div class="nav-wrapper" style={{"width" : "95%", "margin" : "auto"}}>
                    <a href="/" class="brand-logo">ROVER</a>
                    <ul id="nav-mobile" class="right hide-on-med-and-down">
                        <li><a href="/map">Расклад</a></li>
                        <li><a href="/tickets">Бiлеты</a></li>
                        <li><a href="/account">Акаунт</a></li>
                    </ul>
                </div>
            </nav>
        </>);
}
