import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';


export const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        if (store.isAuthenticated && !store.user) {
            actions.getUser();
        }
    }, [store.isAuthenticated, store.user, actions]);

    const handleLogout = () => {
        actions.logout();
        navigate('/login');
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center text-primary mb-3">Dashboard</h2>

                {store.error && (
                    <div className="alert alert-danger p-2 text-center">{store.error}</div>
                )}

                {store.user ? (
                    <div className="bg-light p-3 rounded border">
                        <p className="text-muted"><strong>ID:</strong> {store.user.id}</p>
                        <p className="text-muted"><strong>Email:</strong> {store.user.email}</p>
                        <p className={`fw-bold ${store.user.is_active ? 'text-success' : 'text-danger'}`}>
                            <strong>Activo:</strong> {store.user.is_active ? 'Sí' : 'No'}
                        </p>
                    </div>
                ) : (
                    <p className="text-center text-secondary">Cargando información del usuario...</p>
                )}

                <button
                    onClick={handleLogout}
                    className="btn btn-primary w-100 mt-4"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};
