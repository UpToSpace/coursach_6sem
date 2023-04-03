import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import M from 'materialize-css';
import { AuthContext } from '../context/AuthContext';
import { groupBy } from '../components/functions/functions';

const Step1 = ({ ticket, setTicket, ticketTypes }) => {
    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        M.updateTextFields();
    }, []);

    const handleChange = (e) => {
        switch (e.target.name) {
            case 'document':
                setTicket({ ...ticket, document: e.target.value });
                break;
            case 'type':
                setTicket({ ...ticket, type: e.target.value });
                break;
            default:
                break;
        }
        //console.log(e.target.value)
        //console.log(ticket)
    }

    return (
        <>
            <div className="input-field col s12">
                <select name="document" onChange={handleChange} defaultValue={ticket.document}>
                    <option value="Билет 1">Билет 1</option>
                    <option value="Билет 2">Билет 2</option>
                </select>
                <label>Выберите свой проездной билет</label>
            </div>

            <div className="input-field col s12">
                <select name="type" onChange={handleChange} value={ticket.type}>
                    {console.log(groupBy(ticketTypes, ticketType => ticketType.type).keys)}
                    {groupBy(ticketTypes, ticketType => ticketType.type).keys.map((option, index) => {
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

const Step2 = ({ ticket, setTicket, ticketTypes, filter }) => {
    //console.log(ticket)
    const datepickerOptions = {
        format: 'dd.mm.yyyy',
        autoClose: true
    }
    useEffect(() => {
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects, null);
        console.log(ticket.dateBegin)
        var datepickerBegin = document.getElementById('dateBegin');
        var datepickerEnd = document.getElementById('dateEnd');
        M.Datepicker.init(datepickerBegin, datepickerOptions);
        M.Datepicker.init(datepickerEnd, datepickerOptions);
        const datepickerDateBegin = M.Datepicker.getInstance(datepickerBegin);
        datepickerDateBegin.minDate = new Date();
        datepickerDateBegin.maxDate = new Date().setFullYear(new Date().getFullYear() + 1);
        datepickerDateBegin.setDate(ticket.dateBegin)
        datepickerDateBegin.setInputValue(ticket.dateBegin);
        const datepickerDateEnd = M.Datepicker.getInstance(datepickerEnd);
        datepickerDateEnd.setDate(ticket.dateEnd)
        datepickerDateEnd.setInputValue(ticket.dateEnd);
        datepickerDateEnd.readOnly = true;
        M.updateTextFields();
    }, [ticket, setTicket, datepickerOptions]);

    const handleChange = (e) => {
        //console.log(e.target.name)
        //console.log(ticket)
        switch (e.target.name) {
            case "transport":
                setTicket({ ...ticket, transport: e.target.value });
                break;
            case "tripCount":
                setTicket({ ...ticket, tripCount: e.target.value });
                break;
            case "dateBegin":
            case "dateEnd":
                //console.log(e.target.value)
                setTicket({ ...ticket, dateBegin: e.target.value });
                setTicket({ ...ticket, dateEnd: e.target.value + ticket.duration });
                break;
            case "duration":
                setTicket({ ...ticket, duration: e.target.value });
                break;
            default:
                break;
        }
    }

    const ticketForTrips = () => {
        const tripCountOptions = groupBy(ticketTypes.filter(e => e.type === ticket.type && e.transport === ticket.transport), ticketType => ticketType.tripCount).keys;
        const transportOptions = groupBy(ticketTypes.filter(e => e.type === ticket.type), ticketType => ticketType.transport).keys;
        const durationOptions = groupBy(ticketTypes.filter(e => e.type === ticket.type), ticketType => ticketType.duration).keys;
        return (
            <>
                <div className="input-field col s12">
                    <select name="transport" onChange={handleChange} value={ticket.transport}>
                        {transportOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите вид транспорта</label>
                </div>
                <div className="input-field col s12" >
                    <select name="tripCount" onChange={handleChange} value={ticket.tripCount}>
                        {tripCountOptions.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                    <label>Выберите количество поездок</label>
                </div >
                <div className="input-field col s12" readOnly>
                    <input name="duration" type="text" id="duration" onChange={handleChange} value={ticket.duration} readOnly>
                    </input>
                    <label for="duration">Количество суток</label>
                </div >
            </>
        )
    }

    const ticketForDays = () => {
        const durationOptions = groupBy(ticketTypes.filter(e => e.type === ticket.type), ticketType => ticketType.duration).keys;
        const transportOptions = groupBy(ticketTypes.filter(e => e.type === ticket.type && e.tripsCount === '-1'), ticketType => ticketType.transport).keys;
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
                <input name="dateBegin" value={ticket.dateBegin} onSelect={handleChange} type="text" className="datepicker" id="dateBegin" />
                <label
                    htmlFor="dateBegin">
                    Выберите дату начала билета
                </label>
            </div>

            <div className="input-field col s12">
                <input name="dateEnd" id="dateEnd" type="text" onChange={handleChange} value={ticket.dateEnd} className="datepicker" readOnly />
                <label
                    htmlFor="dateEnd">
                    Дата окончания билета
                </label>
            </div>

            <div className="input-field col s12">
                <input placeholder='' id="price" type="text" value={ticket.price} readOnly />
                <label
                    htmlFor="dateEnd">
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
    const [ticket, setTicket] = useState({ // current ticket 
        document: '',
        dateBegin: today,
        dateEnd: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
        type: "На определенное количество поездок",
        transport: "Автобус-Троллейбус-Трамвай",
        tripCount: 1,
        price: 0.85,
        duration: 375
    });
    const [ticketTypes, setTicketTypes] = useState(); // possible ticket types
    const { loading, request } = useHttp();

    const StepDisplay = () => {
        switch (step) {
            case 1:
                return <Step1 ticket={ticket} setTicket={setTicket} ticketTypes={ticketTypes} />
            case 2:
                return <Step2 ticket={ticket} setTicket={setTicket} ticketTypes={ticketTypes} />
            case 3:
                return <Step3 ticket={ticket} setTicket={setTicket} ticketTypes={ticketTypes} />
            case 4:
                return <Result ticket={ticket} setTicket={setTicket} ticketTypes={ticketTypes} />
            default:
                return <Step1 ticket={ticket} setTicket={setTicket} ticketTypes={ticketTypes} />
        }
    }

    useEffect(() => {
        const func = async () => {
            var ticketTypes = await request('/api/ticket/types', 'GET', null, { 'Authorization': `Bearer ${auth.token}` });
            console.log(ticketTypes);
            setTicketTypes(ticketTypes);
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
                                    {ticketTypes && StepDisplay()}
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