import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import M from 'materialize-css';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { groupBy, dateToString, stringToDate } from '../components/functions/functions';
import { DatePicker } from "react-materialize";
import Confetti from 'react-confetti';

const Step1 = ({ setTicketTypes, ticketTypes, allTicketTypes, ticket, setTicket }) => {
    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        M.updateTextFields();
        //console.log(ticketTypes)
        //console.log(ticket)
    }, []);

    const handleChange = (e) => {
        //console.log(e.target.value)
        switch (e.target.name) {
            case 'type':
                setTicketTypes(allTicketTypes.filter(el => el.type === e.target.value));
                setTicket({ ...ticket, ticketType: allTicketTypes.filter(el => el.type === e.target.value)[0] });
                break;
            default:
                break;
        }
        //console.log(ticketTypes)
        //console.log(ticket)
    }

    return (
        <>
            <div className="input-field col s12">
                <select name="type" onChange={handleChange} value={ticketTypes[0].type}>
                    {groupBy(allTicketTypes, allTicketTypes => allTicketTypes.type).keys.map((option, index) => {
                        return (
                            <option key={index} value={option}>{option}</option>
                        )
                    })}
                </select>
                <label>Выберите тип проездного</label>
            </div>
        </>
    )
}

const Step2 = ({ setTicketTypes, ticketTypes, allTicketTypes, ticket, setTicket }) => {

    const [transportOptions, setTransportOptions] = useState(groupBy(allTicketTypes.filter(e => e.type ===
        ticketTypes[0].type), ticketType => ticketType.transport).keys)
    const [durationOptions, setDurationOptions] = useState(groupBy(allTicketTypes.filter(e => e.type ===
        ticketTypes[0].type && e.transport === ticketTypes[0].transport), ticketType => ticketType.duration).keys)
    const [tripCountOptions, setTripCountOptions] = useState(groupBy(allTicketTypes.filter(e => e.type ===
        ticketTypes[0].type && e.transport === ticketTypes[0].transport), ticketType => ticketType.tripCount).keys)

    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        setDurationOptions(groupBy(allTicketTypes.filter(e => e.type === ticketTypes[0].type && e.transport === ticketTypes[0].transport), ticketType => ticketType.duration).keys)
        setTripCountOptions(groupBy(allTicketTypes.filter(e => e.type ===
            ticketTypes[0].type && e.transport === ticketTypes[0].transport), ticketType => ticketType.tripCount).keys)
        //console.log(ticket)
        //console.log(ticketTypes)
        M.updateTextFields();
    }, [allTicketTypes, ticketTypes]);

    const handleChange = (e) => {
        //console.log(e.target.name)
        //console.log(ticket)
        //setTicket(ticket => ({ ...ticket, [e.target.name]: e.target.value }));
        switch (e.target.name) {
            case "transport": {
                setTransportOptions(groupBy(allTicketTypes.filter(e => e.type === ticketTypes[0].type), ticketType => ticketType.transport).keys)
                setDurationOptions(groupBy(allTicketTypes.filter(el => el.type === ticketTypes[0].type && el.transport === e.target.value)
                    , ticketType => ticketType.duration).keys)
                setTripCountOptions(groupBy(allTicketTypes.filter(el => el.type ===
                    ticketTypes[0].type && el.transport === e.target.value), ticketType => ticketType.tripCount).keys)
                const filteredTicketTypes = allTicketTypes.filter(el => el.type === ticket.ticketType.type && el.transport === e.target.value);
                setTicketTypes(filteredTicketTypes);
                const dateEndValue = new Date(ticket.dateBegin);
                console.log(dateEndValue)
                dateEndValue.setDate(ticket.dateBegin.getDate() + +filteredTicketTypes[0].duration);
                console.log(dateEndValue)
                setTicket(ticket => ({ ...ticket, ticketType: filteredTicketTypes[0], dateEnd: dateEndValue }));
                // console.log(filteredTicketTypes)
                // console.log({ ...ticket, ...filteredTicketTypes[0], dateEnd: dateEndValue })
                const dateEnd = document.getElementById('dateEnd');
                dateEnd.value = dateToString(dateEndValue);
                //console.log(dateEndValue)
                //console.log(allTicketTypes.filter(el => el.type === ticket.type && el.transport === e.target.value));
                break;
            }
            case "tripCount": {
                const filteredTicketTypes = allTicketTypes.filter(el => el.type === ticket.ticketType.type && el.tripCount === +e.target.value
                    && el.transport === ticketTypes[0].transport);
                setTicketTypes(filteredTicketTypes);
                const dateEndValue = new Date(ticket.dateBegin);
                dateEndValue.setDate(ticket.dateBegin.getDate() + +filteredTicketTypes[0].duration);
                setTicket(ticket => ({ ...ticket, ticketType: filteredTicketTypes[0], dateEnd: dateEndValue }));
                const dateEnd = document.getElementById('dateEnd');
                dateEnd.value = dateEndValue;
                console.log(dateEndValue)
                //console.log(allTicketTypes.filter(el => el.type === ticket.type && el.tripCount === +e.target.value));
                break;
            }
            case "dateBegin": {
                console.log(e.target.value)
                const date = e.target.value;
                const dateEndValue = new Date(date);
                dateEndValue.setDate(date.getDate() + +ticketTypes[0].duration);
                console.log(date);
                console.log(dateEndValue);      
                setTicket(ticket => ({ ...ticket, dateBegin: date, dateEnd: dateEndValue }));
                const dateEnd = document.getElementById('dateEnd');
                dateEnd.value = dateToString(dateEndValue);
                break;
            }
            case "duration": {
                const filteredTicketTypes = allTicketTypes.filter(el => el.type === ticket.ticketType.type && el.transport === ticket.ticketType.transport
                    && el.tripCount === ticket.ticketType.tripCount && el.duration === +e.target.value);
                setTicketTypes(filteredTicketTypes);
                //console.log(e.target.value)
                const dateEndValue = new Date(ticket.dateBegin);
                dateEndValue.setDate(ticket.dateBegin.getDate() + +e.target.value);
                setTicket(ticket => ({ ...ticket, ticketType: filteredTicketTypes[0], dateEnd: dateEndValue }));
                const dateEnd = document.getElementById('dateEnd');
                dateEnd.value = dateToString(dateEndValue);
                M.updateTextFields();
                //console.log(dateEndValue)
                //setTicket(ticket => ({ ...ticket, duration: e.target.value }));
                break;
            }
            case "price": {
                e.target.value = ticket.ticketType.price;
                break;
            }
            default:
                break;
        }
    }

    const printOptions = (options) => {
        return options.map((option, index) => {
            return (
                <option key={index} value={option}>{option}</option>
            )
        })
    }

    const ticketForTrips = () => {
        //console.log(ticket)
        return (
            <>
                <div className="input-field col s12">
                    <select name="transport" onChange={handleChange} value={ticketTypes[0].transport}>
                        {transportOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <select name="tripCount" onChange={handleChange} value={ticketTypes[0].tripCount}>
                        {tripCountOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите количество поездок</label>
                </div >
                <div className="input-field col s12" readOnly>
                    <input name="duration" type="text" id="duration" onChange={handleChange} value={ticketTypes[0].duration} readOnly>
                    </input>
                    <label htmlFor="duration">Количество суток</label>
                </div >
            </>
        )
    }

    const ticketForDays = () => {
        return (
            <>
                <div className="input-field col s12">
                    <select name="transport" onChange={handleChange} value={ticketTypes[0].transport}>
                        {/* {console.log(transportOptions)} */}
                        {printOptions(transportOptions)}
                    </select>
                    <label>Выберите вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <select name="duration" onChange={handleChange} value={ticketTypes[0].duration}>
                        {console.log(durationOptions)}
                        {printOptions(durationOptions)}
                    </select>
                    <label>Выберите количество суток</label>
                </div >
            </>
        )
    }

    return (
        <>
            {ticket.ticketType.type === "На определенное количество поездок" ? ticketForTrips() : ticketForDays()}

            <div className="input-field col s12">
                <DatePicker id="dateBegin" name="dateBegin" value={dateToString(ticket.dateBegin)} onChange={(newDate) => handleChange({
                    target: {
                        name: "dateBegin",
                        value: newDate
                    }
                })} />
                <label
                    htmlFor="dateBegin">
                    Выберите дату начала билета
                </label>
            </div>

            <div className="input-field col s12">
                <input name="dateEnd" id="dateEnd" type="text" value={dateToString(ticket.dateEnd)} readOnly />
                <label
                    htmlFor="dateEnd">
                    Дата окончания билета
                </label>
            </div>

            <div className="input-field col s12">
                <input name="price" id="price" type="text" value={ticketTypes[0].price} onChange={handleChange} readOnly />
                <label
                    htmlFor="price">
                    Итоговая стоимость
                </label>
            </div>
        </>
    )
}

const Step3 = ({ ticket, ticketTypes }) => {
    console.log(ticket)
    console.log(ticketTypes)
    useEffect(() => {
        M.updateTextFields();
    }, [])
    const ticketForTrips = () => {
        return (
            <>
                <div className="input-field col s12">
                    <input type="text" value={ticket.ticketType.transport} readOnly />
                    <label>Вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <input type="text" value={ticket.ticketType.tripCount} readOnly />
                    <label>Количество поездок</label>
                </div >
                <div className="input-field col s12" readOnly>
                    <input type="text" value={ticket.ticketType.duration} readOnly />
                    <label htmlFor="duration">Количество суток</label>
                </div >
            </>
        )
    }

    const ticketForDays = () => {
        return (
            <>
                <div className="input-field col s12">
                    <input type="text" value={ticket.ticketType.transport} readOnly />
                    <label>Вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <input type="text" value={ticket.ticketType.duration} readOnly />
                    <label>Количество суток</label>
                </div >
            </>
        )
    }
    return (
        <>
            {ticket.ticketType.type === "На определенное количество поездок" ? ticketForTrips() : ticketForDays()}

            <div className="input-field col s12">
                <input type="text" value={dateToString(ticket.dateBegin)} readOnly />
                <label>
                    Дата начала билета
                </label>
            </div>

            <div className="input-field col s12">
                <input type="text" value={dateToString(ticket.dateEnd)} readOnly />
                <label>
                    Дата окончания билета
                </label>
            </div>

            <div className="input-field col s12">
                <input type="text" value={ticket.ticketType.price} readOnly />
                <label>
                    Итоговая стоимость
                </label>
            </div>
        </>
    )
}

const Result = () => {
    return (
        <>
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} tweenDuration={7000}
                colors={['#FFEB3B', '#2196f3', '#4CAF50', '#f44336']} />
            <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                    <span className="card-title">Поздравляем!</span>
                    <p>Поздравляем с покупкой проездного билета!</p>
                    <p>Желаем вам приятных поездок. Спасибо, что выбрали компанию Rover</p>
                </div>
                <div className="card-action">
                    <a href="/">На главную</a>
                    <a href="/tickets">Мои билеты</a>
                </div>
            </div>
        </>
    )
}

export const BuyTicketPage = () => {
    const auth = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [allTicketTypes, setAllTicketTypes] = useState([]); // all ticket types
    const [ticket, setTicket] = useState({ // current ticket 
        owner: auth.userId,
        dateBegin: today,
        dateEnd: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    });
    const [ticketTypes, setTicketTypes] = useState([]); // ticket types that can be used for current ticket
    const { loading, request } = useHttp();

    const StepDisplay = useCallback(() => {
        switch (step) {
            case 1:
                return <Step1 ticket={ticket} setTicket={setTicket} setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} allTicketTypes={allTicketTypes} />
            case 2:
                return <Step2 ticket={ticket} setTicket={setTicket} setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} allTicketTypes={allTicketTypes} />
            case 3:
                return <Step3 ticket={ticket} ticketTypes={ticketTypes} />
            default:
                return <Step1 ticket={ticket} setTicket={setTicket} setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} allTicketTypes={allTicketTypes} />
        }
    }, [step, ticket, ticketTypes, allTicketTypes, setTicket, setTicketTypes])

    const setDefaultTicket = useCallback(async () => {
        var ticketTypes = await request('/api/tickets/types', 'GET', null, { 'Authorization': `Bearer ${auth.token}` });
        //console.log(ticketTypes);
        setAllTicketTypes(ticketTypes);
        setTicketTypes(ticketTypes)
        setTicket({
            ...ticket, ticketType: ticketTypes[0]
        })
    }, [auth.token, request])

    useEffect(() => { // default ticket
        setDefaultTicket();
    }, [setDefaultTicket]);

    const confirm = async () => {
        try {
            console.log(ticket)
            const data = await request('/api/tickets', 'POST', ticket, { 'Authorization': `Bearer ${auth.token}` });
            console.log(data);
            setStep(4);
        } catch (e) { }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="row" >
            <div className="col s12 m6">
                {step === 4 ?
                    Result()
                    : <>
                        <div className="progress">
                            <div className="determinate" style={{ width: (100 / 3) * step + "%" }} ></div>
                        </div>
                        <div className="card blue-grey darken-1">
                            <div className="card-content white-text">
                                <span className="card-title">Выберите проездной билет</span>
                                <div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            {ticketTypes.length !== 0 && StepDisplay()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-action">
                                <button
                                    className="waves-effect waves-light btn-large"
                                    disabled={loading || step === 1}
                                    onClick={() => setStep(step - 1)}>
                                    Назад
                                </button>
                                <button
                                    className="waves-effect waves-light btn-large"
                                    disabled={loading}
                                    onClick={step === 3 ? confirm : () => setStep(step + 1)}>
                                    {step === 3 ? "Подтвердить" : "Далее"}
                                </button>
                            </div>
                        </div>
                    </>}
            </div>
        </div >
    )
}