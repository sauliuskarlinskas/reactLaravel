// import bootstrap css
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../sass/style.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Delete from '@/Social/Delete';
import Edit from '@/Social/Edit';

export default function Social({ storeUrl, listUrl }) {

    const [name, setName] = useState('');
    const [age, setAge] = useState(18);
    const [network, setNetwork] = useState('');
    const [messages, setMessages] = useState([]);
    const [persons, setPersons] = useState(null);

    const [deletePerson, setDeletePerson] = useState(null);
    const [editPerson, setEditPerson] = useState(null);

    useEffect(() => {
        axios.get(listUrl)
            .then(res => {
                if (res.status === 200) {
                    setPersons(res.data.socials);
                }
            })
            .catch(_ => {
                addMessage('Persons not loaded', 'danger');
            });
    }, []);


    useEffect(() => {
        if (age < 30) {
            setNetwork('tt');
        }
        else if (age < 60) {
            setNetwork('ig');
        }
        else {
            setNetwork('fb');
        }
    }, [age]);

    const addMessage = (text, type) => {
        const uuid = uuidv4();
        const message = {
            text,
            type,
            uuid
        };
        setMessages(m => [message, ...m]);
        setTimeout(() => {
            setMessages(m => m.filter(m => m.uuid !== uuid));
        }, 3000);
    }

    const store = _ => {
        const uuid = uuidv4();
        const person = {
            name: name,
            age: age,
            social: network,
            id: uuid,
            stored: false
        };
        setPersons(p => [person, ...p ?? []]);
        addMessage('Person added', 'success');
        axios.post(storeUrl, person)
            .then(res => {
                if (res.status === 201) {
                    delete person.stored;
                    person.id = res.data.id;
                    addMessage(res.data.message, 'success');
                    setName('');
                    setAge(18);
                    setNetwork('');
                }
                else {
                    setPersons(p => p.filter(p => p.id !== uuid));
                    addMessage('Person not stored', 'danger');
                }
            }
            )
            .catch(e => {
                setPersons(p => p.filter(p => p.id !== uuid));
                console.log(e);
                addMessage(e.response.data.message, 'danger');
            }
            );
    }

    const destroy = id => {
        setPersons(p => p.filter(p => p.id !== id));
        setDeletePerson(null);
        axios.delete(`${storeUrl}/${id}`)
            .then(res => {
                if (res.status === 200) {
                    addMessage(res.data.message, 'success');
                }
                else {
                    addMessage('Person not deleted', 'danger');
                }
            })
            .catch(e => {
                console.log(e);
                addMessage(e.response.data.message, 'danger');
            });
    }

    const update = person => {
        setPersons(p => p.map(p => p.id === person.id ? person : p));
        setEditPerson(null);
        axios.put(`${storeUrl}/${person.id}`, person)
            .then(res => {
                if (res.status === 200) {
                    addMessage(res.data.message, 'success');
                }
                else {
                    addMessage('Person not updated', 'danger');
                }
            })
            .catch(e => {
                console.log(e);
                addMessage(e.response.data.message, 'danger');
            });
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-4">
                    <div className="card m-4">
                        <div className="card-body">
                            <h5 className="card-title">Add</h5>
                            <h6 className="card-subtitle mb-2 text-muted">New nice person</h6>
                            <div className="mb-3">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">How old <b>{age}</b></label>
                                <input type="range" className="form-range" min="18" max="98" value={age} onChange={e => setAge(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Lovely social networks</label>
                                <ul className="netwoks">
                                    <li className={network === 'tt' ? 'active' : ''} onClick={_ => setNetwork('tt')}>TT</li>
                                    <li className={network === 'ig' ? 'active' : ''} onClick={_ => setNetwork('ig')}>IG</li>
                                    <li className={network === 'fb' ? 'active' : ''} onClick={_ => setNetwork('fb')}>FB</li>
                                </ul>
                            </div>
                            <button className="btn btn-primary" onClick={store}>Go somewhere</button>
                        </div>
                    </div>
                </div>
                <div className="col-8">
                    <div className="card m-4">
                        <div className="card-body">
                            <h5 className="card-title">Our Persons</h5>
                            <h6 className="card-subtitle mb-2 text-muted">All nice persons</h6>
                            <ul className="list-group list-group-flush">

                                {
                                    persons && persons.map(person =>
                                        <li key={person.id} className="list-group-item">
                                            <div className="left">
                                                {person.name}
                                                <span className="badge bg-primary rounded-pill">{person.age}</span>
                                                <span className="badge bg-secondary rounded-pill">{person.social}</span>
                                            </div>
                                            {
                                                person.stored !== false &&
                                                <div className="right">
                                                    <button className="btn btn-danger btn-sm" onClick={_ => setDeletePerson(person)}>Delete</button>
                                                    <button className="btn btn-warning btn-sm" onClick={_ => setEditPerson(person)}>Edit</button>
                                                </div>
                                            }

                                        </li>
                                    )

                                }


                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="messages">
                {
                    messages.map(message =>
                        <div key={message.uuid} className={`alert alert-${message.type}`} role="alert">
                            {message.text}
                        </div>
                    )
                }
            </div>
            <Delete deletePerson={deletePerson} setDeletePerson={setDeletePerson} destroy={destroy} />
            <Edit editPerson={editPerson} setEditPerson={setEditPerson} update={update} />
        </div>
    );
}