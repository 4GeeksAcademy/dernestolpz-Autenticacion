// src/store/flux.js
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			// Añadimos propiedades para la autenticación
			isAuthenticated: false,
			user: null,
			error: null
		},
		actions: {
			// Acciones existentes
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				setStore({ demo: demo });
			},

			
			signup: async (userData) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/signup", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(userData),
					});

					if (response.ok) {
						const data = await response.json();
						
						setStore({ error: null });
						return { success: true, message: data.message };
					} else {
						const errorData = await response.json();
						setStore({ error: errorData.message });
						return { success: false, message: errorData.message };
					}
				} catch (error) {
					console.error("Error en signup:", error);
					setStore({ error: "Error al registrar el usuario" });
					return { success: false, message: "Error al registrar el usuario" };
				}
			},

			
			login: async (credentials) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(credentials),
					});

					if (response.ok) {
						const data = await response.json();
						
						localStorage.setItem('access_token', data.access_token);
						
						setStore({ isAuthenticated: true, error: null });
						
						getActions().getUser();
						return { success: true };
					} else {
						const errorData = await response.json();
						setStore({ error: errorData.message });
						return { success: false, message: errorData.message };
					}
				} catch (error) {
					console.error("Error en login:", error);
					setStore({ error: "Error al iniciar sesión" });
					return { success: false, message: "Error al iniciar sesión" };
				}
			},

			
			getUser: async () => {
				try {
					const token = localStorage.getItem('access_token');
					const response = await fetch(process.env.BACKEND_URL + "/api/private", {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`,
						},
					});

					if (response.ok) {
						const data = await response.json();
						setStore({ user: data.user, isAuthenticated: true, error: null });
					} else {
						setStore({ error: "No autorizado" });
						getActions().logout();
					}
				} catch (error) {
					console.error("Error al obtener el usuario:", error);
					setStore({ error: "Error al obtener la información del usuario" });
					getActions().logout();
				}
			},

			
			logout: () => {
				localStorage.removeItem('access_token');
				setStore({ isAuthenticated: false, user: null, error: null });
			}
		}
	};
};

export default getState;
