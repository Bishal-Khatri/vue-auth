import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../axios-auth'
import globalAxios from 'axios'
import router from '../router/'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        idToken: null,
        userId: null,
        user: null
    },
    mutations: {
        authUser(state, userData){
            state.idToken = userData.token;
            state.userId = userData.userId;
        },
        storeUser(state, user){
            state.user = user
        },
        clearAuth(state){
            state.idToken = null
            state.userId = null
        }
    },
    actions: {
        setLogoutTimer({commit, dispatch}, expirationTime){
            setTimeout(() => {
                dispatch('logout')
            },expirationTime * 1000)
        },
        signUp({commit, dispatch}, authData){
            axios.post("/signupNewUser?key=AIzaSyAz0cPaKs2L-moMODSS4NTZe_lDoWKzIrQ",{
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(response => {
                    commit('authUser',{
                        token: response.data.idToken,
                        userId: response.data.localId
                    });
                    // store token in local storage
                    const now  = new Date();
                    const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000);
                    localStorage.setItem('token', response.data.idToken);
                    localStorage.setItem('userId', response.data.localId);
                    localStorage.setItem('expirationDate', expirationDate);

                    dispatch('storeUser', authData)
                    dispatch('setLogoutTimer', response.data.expiresIn)
                })
                .catch(error => console.log(error));
        },
        login({commit, dispatch}, authData){
            axios.post("/verifyPassword?key=AIzaSyAz0cPaKs2L-moMODSS4NTZe_lDoWKzIrQ",{
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(response => {
                    // store token in local storage
                    const now  = new Date();
                    const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000);
                    localStorage.setItem('token', response.data.idToken);
                    localStorage.setItem('userId', response.data.localId);
                    localStorage.setItem('expirationDate', expirationDate);

                    commit('authUser',{
                        token: response.data.idToken,
                        userId: response.data.localId
                    });
                    router.replace('/dashboard')
                    dispatch('setLogoutTimer', response.data.expiresIn)
                })
                .catch(error => console.log(error));
        },
        tryAutoLogin({commit}){
            const token = localStorage.getItem('token')
            if (!token){
                return
            }
            const expirationDate = localStorage.getItem('expirationDate')
            const now = new Date();
            if (now >= expirationDate){
                return
            }
            const userId = localStorage.getItem('userId')

            commit('authUser', {
                token: token,
                userId: userId
            })
            router.replace('/dashboard')
        },
        storeUser({commit, state}, userData){
            if (!state.idToken) {
                return
            }
            globalAxios.post("/users.json" + "?auth=" + state.idToken,userData)
                .then(response => {
                    console.log(response)
                })
                .catch(error => console.log(error));
        },
        fetchUser({commit, state}){
            if (!state.idToken) {
                return
            }
            globalAxios.get("/users.json" + "?auth=" + state.idToken)
                .then(response => {
                    const data = response.data;
                    const users = [];
                    for (let key in data){
                        const user = data[key]
                        user.id = key;
                        users.push(user)
                    }
                   commit("storeUser",users[0])
                })
                .catch(error => console.log(error));
        },
        logout({commit}){
            commit("clearAuth")
            localStorage.removeItem('expirationDate')
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            router.replace('/signin')
        }
    },
    getters: {
        user(state){
            return state.user
        },
        isAuthenticated(state){
            return state.idToken !== null
        }
    }
})