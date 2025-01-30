import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../store/appContext';

export const PrivateRoute = ({ children }) => {
	const { store, actions } = useContext(Context);

	useEffect(() => {
		if (store.isAuthenticated && !store.user) {
			actions.getUser();
		}
	}, [store.isAuthenticated, store.user, actions]);

	if (!store.isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return children;
};


