
import React, { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import {BackendURL} from "./component/backendURL"
import { Context } from "./store/appContext";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import {Navbar} from "./component/navbar";


import {Signup} from "./component/Signup";
import {Login} from "./component/Login";
import {Dashboard} from "./component/Dashboard";
import {PrivateRoute} from "./component/PrivateRoute";

//create your first component
const Layout = () => {
	//the basename is used when your project is published in a subdirectory and not in the root of the domain
	// you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
	const basename = process.env.BASENAME || "";
	const { store } = useContext(Context);
    const isLoggedIn = !!store.token;

	if(!process.env.BACKEND_URL || process.env.BACKEND_URL === "") return <BackendURL />;

	return (
		<div>
			<BrowserRouter basename={basename}>
				<ScrollToTop>
					<Navbar />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/demo" element={<Demo />} />
						<Route path="/single/:theid" element={<Single />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
						<Route
							path="/dashboard"
							element={
								<PrivateRoute>
									<Dashboard />
								</PrivateRoute>
							}
						/>
						{/* Ruta por defecto para 404 */}
						<Route path="*" element={<h1>404 - Página No Encontrada</h1>} />
					</Routes>
					
				</ScrollToTop>
			</BrowserRouter>
		</div>
	);
};

export default injectContext(Layout);
