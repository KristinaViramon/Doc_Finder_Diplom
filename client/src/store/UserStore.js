import { makeAutoObservable } from "mobx";
export default class UserStore {
  constructor() {
    this._isAuth = false;
    this._user = {};
    this._isDoctor = false;
    this._isAdmin = false;
    makeAutoObservable(this);
  }
  setIsAuth(bool) {
    this._isAuth = bool;
  }
  setUser(user) {
    this._user = user;
  }
  setIsDoctor(bool) {
    this._isDoctor = bool;
  }

  setIsAdmin(bool) {
    this._isAdmin = bool;
  }
  get isAuth() {
    return this._isAuth;
  }

  get user() {
    return this._user;
  }

  get isDoctor() {
    return this._isDoctor;
  }

  get isAdmin() {
    return this._isAdmin;
  }
}
