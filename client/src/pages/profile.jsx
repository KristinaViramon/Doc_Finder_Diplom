import React from 'react';
import Header from '../components/header';
import MenuProfile from '../components/menu_profile';
import "../styles/menu-profile.css"
import Footer from '../components/Footer';
const Profile = () => {
    return [<Header/>,  <div id='main'>
        <div style={{width:"100%",height:"10em", backgroundColor:"#7cb2ca"}}></div>
        <MenuProfile/>
    </div>, <Footer/>];
}

export default Profile;
