import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import M from 'materialize-css';
import { AuthContext } from '../context/AuthContext';
import { groupBy, dateToString, stringToDate } from '../components/functions/functions';

const Step1 = ({ setTicketTypes, ticketTypes, allTicketTypes, ticket, setTicket }) => {
    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        M.updateTextFields();
        //console.log(ticketTypes)
        //console.log(ticket)
    }, []);

    const handleChange = (e) => {
        switch (e.target.name) {
            case 'document':
                //setTicket({ ...ticket, document: e.target.value });
                break;
            case 'type':
                setTicketTypes(allTicketTypes.filter(el => el.type === e.target.value));
                //setTicket(allTicketTypes.filter(el => el.type === e.target.value)[0]);
                break;
            default:
                break;
        }
        console.log(ticketTypes)
        //console.log(ticket)
    }

    return (
        <>
            <div className="input-field col s12">
                <select name="document" onChange={handleChange}>
                    <option value="Билет 1">Билет 1</option>
                    <option value="Билет 2">Билет 2</option>
                </select>
                <label>Выберите свой проездной билет</label>
            </div>

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
    const datepickerOptions = {
        format: 'dd.mm.yyyy',
        autoClose: true
    }
    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        //console.log(ticket)
        //console.log(ticketTypes)
        var datepickerBegin = document.getElementById('dateBegin');
        M.Datepicker.init(datepickerBegin, datepickerOptions);
        const datepickerDateBegin = M.Datepicker.getInstance(datepickerBegin);
        datepickerDateBegin.minDate = new Date();
        datepickerDateBegin.maxDate = new Date().setFullYear(new Date().getFullYear() + 1);
        datepickerDateBegin.setDate(ticket.dateBegin)
        datepickerDateBegin.setInputValue(ticket.dateBegin);
        M.updateTextFields();
    }, [ticket, datepickerOptions]);

    const handleChange = (e) => {
        //console.log(e.target.name)
        console.log(ticket)
        switch (e.target.name) {
            case "transport":
                setTicketTypes(allTicketTypes.filter(el => el.type === ticket.type && el.transport === e.target.value));
                console.log(allTicketTypes.filter(el => el.type === ticket.type && el.transport === e.target.value));
                break;
            case "tripCount":
                setTicketTypes(allTicketTypes.filter(el => el.type === ticket.type && el.tripCount === +e.target.value
                    && el.transport === ticketTypes[0].transport));
                console.log(allTicketTypes.filter(el => el.type === ticket.type && el.tripCount === +e.target.value));
                break;
            case "dateBegin": // ТУТ НЕ РАБОТАЕТ
                console.log(e.target.value)
                const date = stringToDate(e.target.value);
                const dateEndValue = new Date(date);
                dateEndValue.setDate(date.getDate() + +ticketTypes[0].duration);
                //console.log(date);
                //console.log(dateEndValue);      
                setTicket(ticket => ({ ...ticket, dateBegin: date, dateEnd: dateEndValue }));
                const dateEnd = document.getElementById('dateEnd');
                dateEnd.value = dateToString(dateEndValue);
                break;
            case "duration":
                setTicketTypes(allTicketTypes.filter(el => el.type === ticket.type && el.transport === ticketTypes[0].transport
                    && el.tripCount === ticket.tripCount));
                break;
            case "price":
                e.target.value = ticket.price;
                break;
            default:
                break;
        }
    }

    const ticketForTrips = () => {
        const tripCountOptions = groupBy(allTicketTypes.filter(e => e.type === ticketTypes[0].type && e.transport === ticketTypes[0].transport), ticketType => ticketType.tripCount).keys;
        const transportOptions = groupBy(allTicketTypes.filter(e => e.type === ticketTypes[0].type), ticketType => ticketType.transport).keys;
        const durationOptions = groupBy(allTicketTypes.filter(e => e.type === ticketTypes[0].type), ticketType => ticketType.duration).keys;
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
        const durationOptions = groupBy(ticketTypes, ticketType => ticketType.duration).keys;
        const transportOptions = groupBy(ticketTypes, ticketType => ticketType.transport).keys;
        return (
            <>
                <div className="input-field col s12">
                    <select name="transport" onChange={handleChange} value={ticket.transport}>
                        {console.log(transportOptions)}
                        {transportOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <select name="duration" onChange={handleChange} value={ticket.duration}>
                        {console.log(durationOptions)}
                        {durationOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите количество суток</label>
                </div >
            </>
        )
    }

    return (
        <>
            {ticket.type === "На определенное количество поездок" ? ticketForTrips() : ticketForDays()}

            <div className="input-field col s12">
                <input name="dateBegin" value={dateToString(ticket.dateBegin)} onSelect={handleChange} type="text" className="datepicker" id="dateBegin" />
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

const Step3 = ({ ticket, setTicket, ticketTypes }) => {
    console.log(ticket)
    return (
        <>Step 3</>
    )
}

const Result = ({ ticket, setTicket, ticketTypes }) => {
    return (
        <>Result</>
    )
}

export const BuyTicketPage = () => { //TODO: Add validation and progress bar
    const auth = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const today = new Date();
    const [allTicketTypes, setAllTicketTypes] = useState([]); // all ticket types
    const [ticket, setTicket] = useState({ // current ticket 
        document: '',
        dateBegin: today,
        dateEnd: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    });
    const [ticketTypes, setTicketTypes] = useState([]); // ticket types that can be used for current ticket
    const { loading, request } = useHttp();

    const StepDisplay = () => {
        switch (step) {
            case 1:
                return <Step1 ticket={ticket} setTicket={setTicket} setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} allTicketTypes={allTicketTypes} />
            case 2:
                return <Step2 ticket={ticket} setTicket={setTicket} setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} allTicketTypes={allTicketTypes} />
            case 3:
                return <Step3 setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} />
            case 4:
                return <Result setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} />
            default:
                return <Step1 setTicketTypes={setTicketTypes} ticketTypes={ticketTypes} />
        }
    }

    useEffect(() => {
        const func = async () => {
            var ticketTypes = await request('/api/ticket/types', 'GET', null, { 'Authorization': `Bearer ${auth.token}` });
            //console.log(ticketTypes);
            setAllTicketTypes(ticketTypes);
            var filteredTicketTypes = ticketTypes.filter(ticketType => ticketType.type === ticketTypes[0].type);
            setTicketTypes(filteredTicketTypes)
            setTicket({
                ...ticket, type: filteredTicketTypes[0].type, price: filteredTicketTypes[0].price,
                transport: filteredTicketTypes[0].transport, duration: filteredTicketTypes[0].duration, tripCount: filteredTicketTypes[0].tripCount
            })
        }
        func();
    }, [request, auth.token]);

    return (
        <div className="row">
            <div className="col s12 m6">
                <div className="progress">
                    <div className="determinate" style={{ width: (100 / 4) * step + "%" }} ></div>
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
                            disabled={loading || step === 4}
                            onClick={() => setStep(step + 1)}>
                            Далее
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}