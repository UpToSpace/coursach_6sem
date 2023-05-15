import React from 'react';
import M from 'materialize-css';

export const AddTicketTypeForm = ({readOnly, onClickHandler, options, setNewTicketType, newTicketType, btnText}) => {

    const handleChange = (e) => {
        // console.log(newTicketType.type)
        // console.log(e.target.value)
        // console.log(options.type[0])
        // console.log(newTicketType.type === options.type[0]);

        switch (e.target.name) {
            case 'type':
                M.updateTextFields();
                setNewTicketType({ ...newTicketType, type: e.target.value });
                break;
            case 'transport':
                console.log(newTicketType.transport.length)
                if (e.target.checked) {
                    setNewTicketType({ ...newTicketType, transport: [...newTicketType.transport, e.target.value] });
                } else {
                    if (newTicketType.transport.length === 1) {
                        return;
                    }
                    setNewTicketType({ ...newTicketType, transport: newTicketType.transport.filter(transport => transport !== e.target.value) });
                }
                break;
            case 'tripCount':
                setNewTicketType({ ...newTicketType, tripCount: e.target.value });
                break;
            case 'duration':
                setNewTicketType({ ...newTicketType, duration: e.target.value });
                break;
            case 'price':
                setNewTicketType({ ...newTicketType, price: e.target.value });
                break;
            default:
                break;
        }
    }
    M.updateTextFields();
    M.FormSelect.init(document.querySelectorAll('select'), null);
    return (
        <>
            <form>
                <div className="row">
                    <label>Выбярыце тып бiлета</label>
                    <select name="type" id="type" onChange={handleChange} defaultValue={newTicketType.type} disabled={readOnly}>
                        {options.type.map((option, index) => {
                            return (
                                <option key={index} value={option}>{option}</option>
                            )
                        })}
                    </select>
                </div>

                {options.transport.map((option, index) => {
                    const checked = newTicketType.transport.includes(option);
                    return (
                        <div className="input-field col s12" key={index}>
                            <p>
                                <label key={index}>
                                    <input disabled={readOnly} type="checkbox" name="transport" checked={checked} className="filled-in" value={option} onChange={handleChange} />
                                    <span>{option}</span>
                                </label>
                            </p>
                        </div>
                    )
                }
                )}

                {newTicketType.type === options.type[0] && <div className="input-field col s6">
                    <label>Колькасць паездак</label>
                    <input placeholder="" name="tripCount" disabled={readOnly} type="number" defaultValue={newTicketType.tripCount} className="validate" onChange={handleChange} />
                </div>}

                <div className="input-field col s6">
                    <label>Колькасць сутак</label>
                    <input placeholder="" name="duration" disabled={readOnly} type="number" defaultValue={newTicketType.duration} className="validate" onChange={handleChange} />
                </div>

                <div className="input-field col s6">
                    <label>Цана</label>
                    <input placeholder="" name="price" type="text" defaultValue={newTicketType.price} className="validate" onChange={handleChange} />
                </div>

                <button onClick={onClickHandler} className="waves-effect waves-light btn-large">{btnText}</button>
            </form>
        </>
    )
}