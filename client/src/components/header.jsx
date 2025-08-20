import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../index';
import { observer } from "mobx-react-lite" 
import { LOGIN_ROUTE, PROFILE_ROUTE } from '../utils/consts';
const Header = observer(() => {
  const {user}= useContext(Context)
    return (
        <div id="header" className="ax_default box_1">
        <div id="header_div" className="">
         <Link to={"/"} class = "link-route"> <div id="heart-beat" className="ax_default icon" style={{cursor: "pointer", fontSize: "4em"}}>
            <i className="fa-solid fa-heart-pulse"></i>
          </div></Link>
          <div className="container">
            {user.isAuth ?
            <Link to={PROFILE_ROUTE}>
              <div id="profile" className="ax_default icon">
                <i className="fa-solid fa-user"></i>
              </div> </Link>
              :
              <Link to={LOGIN_ROUTE} class = "link-route">
              <div id="out" className="ax_default icon">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div></Link>
            }
          </div>
        </div>
      </div>
    );
})

export default Header;
